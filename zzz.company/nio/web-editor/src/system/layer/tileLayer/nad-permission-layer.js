import {Tile3DLayer} from './Tile3DLayer.js';
import {Cesium3DTileStyle} from 'cesium';
import {createViewer} from '../../../cesium/initMap.js';

const baseMapHL = window.api.baseMapHL;
const viewer = createViewer();

function nadJsonFormatFunc(payload) {
  try {
    return payload.wl_events;
  } catch (error) {
    console.log(error + '');
    return {features: [], type: 'FeatureCollection'};
  }
}

export class NadPermissionLayer extends Tile3DLayer {
  color_ = undefined;

  constructor(show, name, color, memoryUsage, spaceError) {
    let showExpr = show;

    let tileStyle = new Cesium3DTileStyle({
      color: `color("${color}")`,
      show: showExpr,
    });
    let tilesetOption = {
      url: `${baseMapHL}/dynamicMap/3dtile_uri_nds_bias/tileset.json`, // dynamicMap/3dtile_uri_nds_49tile/tileset.json
      shadows: false,
      maximumMemoryUsage: memoryUsage,
      maximumScreenSpaceError: spaceError,
      customUri: window.api.nadServiceURL,
      queryParameters: {
        map_version: '',
      },

      jsonFormatFunc: nadJsonFormatFunc,
    };

    super(show, name, false, false, tileStyle, tilesetOption);
    this.color_ = color;

    //放到了layercontroller里，用来改变压盖顺序
    //viewer.scene.primitives.add(this.dataSource);
  }

  load3DTile(version, typeString) {
    this.tileOption['queryParameters'] = {
      map_version: version.toString(),
      event_types_str: typeString,
    };

    this.tileStyle.show = this.dataSource.show;
    return super.load3DTile();
  }

  get show() {
    return this._show;
  }

  set show(value) {
    super.show = value;
    this.dataSource.get(0) && (this.dataSource.get(0).show = value);
    viewer.scene.requestRender();
  }
}
