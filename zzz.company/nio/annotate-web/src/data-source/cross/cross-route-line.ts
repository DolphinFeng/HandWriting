import {
  Material,
  Primitive,
  ColorGeometryInstanceAttribute,
  PrimitiveCollection,
  PolylineMaterialAppearance,
  PolylineGeometry,
  Color,
  Cartesian3,
  GeometryInstance,
} from 'cesium';

import {createViewer} from '../../cesium/create-viewer.js';
import {CrossRouteInfo, crossLayerItems, crossDesc} from './cross-material.ts';

let routeLinesContainer: PrimitiveCollection | null = null;

export function showCrossRouteLines(visible) {
  if (!routeLinesContainer) {
    let viewer = createViewer();
    routeLinesContainer = new PrimitiveCollection();
    viewer.scene.primitives.add(routeLinesContainer);
  }

  routeLinesContainer.show = visible;
}

export function clearCrossRouteLines() {
  if (routeLinesContainer) routeLinesContainer.removeAll();
}

export function refreshCrossRouteLines(crossRouteInfos: CrossRouteInfo[], routeId: number | undefined) {
  let viewer = createViewer();
  if (!routeLinesContainer) {
    routeLinesContainer = new PrimitiveCollection();
    viewer.scene.primitives.add(routeLinesContainer);
  } else {
    routeLinesContainer.removeAll();
  }

  for (let crossRouteInfo of crossRouteInfos) {
    let positions: any = [];
    for (let pt of crossRouteInfo.points) {
      let pos: any = Cartesian3.fromDegrees(pt.lon, pt.lat, 0.05);
      positions.push(pos);
    }

    let width = 6;
    let color: any = null;
    if (crossRouteInfo.routeId == routeId) {
      width = 18;
      color = Color.fromCssColorString('#ff0000');
    } else {
      color = Color.fromCssColorString('#F2A440');
    }

    //为了每段都有箭头，两个点画一次
    for (let i = 1; i < positions.length; i++) {
      let pos: any = [];
      pos.push(positions[i - 1]);
      pos.push(positions[i]);

      let geometryInstances = new GeometryInstance({
        geometry: new PolylineGeometry({
          positions: pos,
          width: width,
          vertexFormat: PolylineMaterialAppearance.VERTEX_FORMAT,
        }),
        attributes: {
          color: ColorGeometryInstanceAttribute.fromColor(Color.WHITE),
        },
      });

      let appearance = new PolylineMaterialAppearance({
        material: Material.fromType('PolylineArrow', {
          color: color,
        }),
      });

      let polyLinePrimitive = new Primitive({
        geometryInstances: geometryInstances,
        appearance: appearance,
        asynchronous: true, //交给webWorker创建
        allowPicking: false,
      });

      routeLinesContainer.add(polyLinePrimitive);

      for (let crossLayerItem of crossLayerItems) {
        if (crossLayerItem.name == crossDesc.crossRoute) {
          routeLinesContainer.show = crossLayerItem.visible;
        }
      }
    }
  }
}
