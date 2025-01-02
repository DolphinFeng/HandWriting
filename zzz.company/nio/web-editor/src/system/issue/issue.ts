import {
  Cartesian3,
  Entity,
  Color,
  PrimitiveCollection,
  EntityCollection,
  PointPrimitive,
  NearFarScalar,
  PointPrimitiveCollection,
  Material,
  GeometryInstance,
  PolylineGeometry,
  Primitive,
  PolylineMaterialAppearance,
  Viewer,
} from 'cesium';

import {parseWKT} from '../../utils/wkt/parseWKT.js';
import {DefineColor} from '../../cesium/materail.js';
import {IssueMeta} from './model.js';
import {loadingSourceOddHandler} from '../../system/odd/loading/loadingOddData.js';
import {loadingNadTileHandler} from '../../system/nad/loadingNadData';

const InnerActiveColor = Color.fromCssColorString('#e935db');
const OuterActiveColor = Color.fromCssColorString('#f2bf4e');

const OuterColor = Color.fromCssColorString('#04138f');
const ArrowPolyline = new PolylineMaterialAppearance({
  material: Material.fromType('PolylineArrow', {
    color: Color.fromCssColorString('#75fbed'),
  }),
});

const NormalIconSize = 6;
const HighLightIconSize = 12;

const NormalOutlineSize = 2;
const HighlightOutlineSize = 3;
const UpdateInterval = 500;

const _nearFarScalar = new NearFarScalar(1.5e2, 1, 1.5e3, 1);

export class Issue {
  startPosition: Cartesian3;
  startPoint: PointPrimitive;
  endPoint: PointPrimitive;
  arrowEntity: Entity;

  collection = new PrimitiveCollection();

  pointCollection: PointPrimitiveCollection = new PointPrimitiveCollection();
  arrowPrimitive: Primitive;

  issueMeta: IssueMeta;

  is_rendered = false;
  start_point_coord: [number, number, number];

  viewer: Viewer;
  lastUpdateTime = Date.now();

  blinkPositive: 1 | -1 = 1;

  constructor(view: Viewer, issue: IssueMeta) {
    this.viewer = view;
    this.issueMeta = issue;

    const start = parseWKT.read(issue.startCoord) as [number, number, number];
    const end = parseWKT.read(issue.endCoord) as [number, number, number];

    this.start_point_coord = start;

    const startPosition = Cartesian3.fromDegrees(start[0], start[1], 0);
    const endPosition = Cartesian3.fromDegrees(end[0], end[1], 0);

    this.startPosition = startPosition;

    const startPointPrimitive = this.pointCollection.add({
      id: `${issue.id}-start`,
      pixelSize: NormalIconSize,
      color: Color.RED,
      position: startPosition,
      outlineColor: OuterColor,
      outlineWidth: NormalOutlineSize,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      scaleByDistance: _nearFarScalar,
    });

    // @ts-ignore
    startPointPrimitive.properties = {
      ...issue,
    };
    this.startPoint = startPointPrimitive;

    const endPointPrimitive = this.pointCollection.add({
      id: `${issue.id}-end`,
      pixelSize: NormalIconSize,
      color: Color.LIGHTGREEN,
      position: endPosition,
      outlineColor: OuterColor,
      outlineWidth: NormalOutlineSize,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      scaleByDistance: _nearFarScalar,
    });

    // @ts-ignore
    endPointPrimitive.properties = {
      ...issue,
    };
    this.endPoint = endPointPrimitive;

    const arrowPrimitive = new Primitive({
      geometryInstances: [
        new GeometryInstance({
          id: `${issue.id}-arrow`,
          geometry: new PolylineGeometry({
            positions: [startPosition, endPosition],
            width: 8,
            vertexFormat: PolylineMaterialAppearance.VERTEX_FORMAT,
          }),
          attributes: {
            color: DefineColor.WHITE_ATTRIBUTE,
          },
        }),
      ],
      appearance: ArrowPolyline,
      asynchronous: true, //交给webWorker创建
      allowPicking: false,
    });

    this.arrowPrimitive = arrowPrimitive;

    this.collection.add(this.pointCollection);
    this.collection.add(this.arrowPrimitive);
  }

  get id() {
    return this.issueMeta.id;
  }

  addTo(primitive: PrimitiveCollection) {
    if (this.is_rendered) {
      return;
    }

    primitive.add(this.collection);
  }

  flyTo() {
    const currentPosition = this.viewer.camera.positionCartographic;

    this.viewer.scene.camera.position.z;

    this.viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(this.start_point_coord[0], this.start_point_coord[1], currentPosition.height),
      duration: 1,
      complete: () => {
        loadingSourceOddHandler(true);
        loadingNadTileHandler(true);
      },
    });
  }

  hightlight() {
    this.startPoint.outlineColor = OuterActiveColor;

    this.endPoint.outlineColor = OuterActiveColor;

    this.viewer.clock.onTick.addEventListener(this.tickListener);
  }

  deHighlight() {
    this.viewer.clock.onTick.removeEventListener(this.tickListener);

    this.startPoint.outlineColor = OuterColor;
    this.startPoint.color = Color.RED;

    this.endPoint.outlineColor = OuterColor;
    this.endPoint.color = Color.LIGHTGREEN;
  }

  tickListener = () => {
    let currentTime = Date.now();

    if (currentTime - this.lastUpdateTime > UpdateInterval) {
      if (this.blinkPositive === 1) {
        this.startPoint.color = OuterActiveColor;
        this.endPoint.color = OuterActiveColor;

        this.blinkPositive = -1;
      } else {
        this.startPoint.color = Color.RED;
        this.endPoint.color = Color.LIGHTGREEN;

        this.blinkPositive = 1;
      }
      this.lastUpdateTime = currentTime;
    }
  };

  dispose() {
    this.viewer.clock.onTick.removeEventListener(this.tickListener);

    this.collection.removeAll();
  }
}
