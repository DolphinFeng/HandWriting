
import {
  Cartesian3, Color, ColorGeometryInstanceAttribute,
  GeometryInstance, Material,
  MaterialAppearance,
  PolygonGeometry,
  EllipsoidSurfaceAppearance,
  PerInstanceColorAppearance,
  HorizontalOrigin,
  LabelCollection,
  JulianDate,
  Ellipsoid,
  VerticalOrigin,
  BoundingSphere,
  PolygonOutlineGeometry,
  PolygonHierarchy, PolylineGeometry, PolylineMaterialAppearance,
  Primitive,
  PrimitiveCollection,
  Label,
  Math as CMath
} from "cesium";

import {Layer} from '../layer/Layer.js';

import {createViewer} from '../../cesium/initMap.js';

import {debounce} from 'lodash-es';
import {NioMessage, getTileLevel} from '../../utils/utils.js';
import {LayerEvent} from '../../event/index.js';
import {throttle} from 'lodash';
import {NadTileMeta} from './nadModel.js';
import {loadingNadTileHandler} from './loadingNadData.js';
import {Observer} from '../../js/observer.js';

class NadTileLayer extends Layer {
  viewer = createViewer();

  nadTile_id_map = new Map<string | number, boolean>();

  showNoHaveEvents = false;

  showHaveEvents = false;
  
  //geometry事件权柄
  handler: LayerEvent;

  loading: boolean = false;

  labelCollection: PrimitiveCollection;

  polygonCollection: PrimitiveCollection;

  scaleCallback;

  constructor() {
    super(false, 'NadTile', [], new PrimitiveCollection(), false, false);
    this.viewer.scene.primitives.add(this.dataSource);

    this.labelCollection = new PrimitiveCollection();
    this.polygonCollection = new PrimitiveCollection();

    this.dataSource.add(this.labelCollection);
    this.dataSource.add(this.polygonCollection);

    this.loadData([]);
    this.initMouseHandler();
  }

  initMouseHandler() {
    this.handler = new LayerEvent();

    //鼠标按下事件(拖动查询事件)
    this.handler.add('LEFT_DOWN', (ev) => {
      this.handler.start('MOUSE_MOVE');
      this.handler.start('LEFT_UP');
    });
    //鼠标拖动事件
    this.handler.add(
      'MOUSE_MOVE',
      throttle(() => {
        this.mouseLoadingNadTile();
      }, 1000),
    );
    //鼠标抬起事件
    this.handler.add('LEFT_UP', (ev) => {
      // this.mouseLoadingOdd();
      this.handler.stop('MOUSE_MOVE');
      this.handler.stop('LEFT_UP');
    });

    this.startOddEvent();
  }

  startOddEvent() {
    this.handler.start('LEFT_DOWN');
  }

  stopOddEvent() {
    this.handler.stop('LEFT_DOWN');
  }

  //加载NadTile数据
  mouseLoadingNadTile() {
    let tile = getTileLevel();
    if (!this.show || this.loading) {
      return;
    }
    loadingNadTileHandler(false);
  }

  loadData(nadTiles: NadTileMeta[]) {
    const polygonInstances = [];
    //const labels = this.dataSource.add(new LabelCollection());
    const labels = this.labelCollection.add(new LabelCollection());

    //先简单加一个限制
    if(this.nadTile_id_map.size > 10000){
      this.clearNadTiles();
    }

    nadTiles.forEach((item) => {

      if (this.nadTile_id_map.get(item.meshId)) {
        return;
      }

      this.nadTile_id_map.set(item.meshId, true);

      let coordinates = [];
      coordinates.push(Cartesian3.fromDegrees(item.leftBottomX, item.leftBottomY, 1));
      coordinates.push(Cartesian3.fromDegrees(item.rightTopX, item.leftBottomY, 1));
      coordinates.push(Cartesian3.fromDegrees(item.rightTopX, item.rightTopY, 1));
      coordinates.push(Cartesian3.fromDegrees(item.leftBottomX, item.rightTopY, 1));

      
      let height = 0
      let polygonHierarchy = new PolygonHierarchy(coordinates);

      let polygonGeometry = new PolygonGeometry({
        polygonHierarchy: polygonHierarchy,
        height: height
      })

      let color = Color.fromCssColorString('#B3E67C80');
      if(item.dynamicEventCnt !== 0){
        color = Color.fromCssColorString('#EF8F8F80');
      }

      this.polygonCollection.add(
        new Primitive({
          geometryInstances: new GeometryInstance({
              geometry: polygonGeometry,
          }),
          appearance: new EllipsoidSurfaceAppearance({
            aboveGround: false,
            material: Material.fromType('Color', {
              color: color,
            }),
          })
        })
      );

      var outlinePolygon = new PolygonOutlineGeometry({
        polygonHierarchy: polygonHierarchy,
        height: 0
      });
      var primitive = new Primitive({
        geometryInstances: new GeometryInstance({
          geometry: outlinePolygon,
          attributes: {
              color: ColorGeometryInstanceAttribute.fromColor(Color.BLACK)
          }
        }),
        appearance: new PerInstanceColorAppearance({
          flat: true,
          translucent: false
        })
      });

      this.polygonCollection.add(primitive);
      
      labels.add({
        position : coordinates[0],
        font: "18px Helvetica",
        text : item.meshId + '',
        fillColor: Color.BLACK,
      });
    });

    this.viewer.scene.requestRender();
  }

  /**
   * 如果条件发生改变，清空现有渲染的图层
   */
   clearNadTiles() {
    this.polygonCollection.removeAll();
    this.labelCollection.removeAll();
    this.nadTile_id_map.clear();
  }
}

export const nadTileLayer = new NadTileLayer();

nadTileLayer.scaleCallback = function ({distance}) {
  if(distance > 45000){
    nadTileLayer.labelCollection.show = false;
  }
  else{
    nadTileLayer.labelCollection.show = true;
  }
};
Observer.register('tileScale', nadTileLayer.scaleCallback);

export function clearNadTileData() {
  nadTileLayer.clearNadTiles();
}
