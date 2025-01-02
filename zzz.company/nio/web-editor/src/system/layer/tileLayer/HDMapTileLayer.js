import {Tile3DLayer} from './Tile3DLayer.js';
import {Cesium3DTileStyle} from 'cesium';
import {hoverOddLayer} from '../../odd/hoverOddLayer.js';
import {createViewer} from '../../../cesium/initMap.js';

const viewer = createViewer();
export class HDMapTileLayer extends Tile3DLayer {
  color_ = undefined;

  constructor(show, name, color, memoryUsage, spaceError) {
    let tileStyle = new Cesium3DTileStyle({
      color: `color("${color}")`,
    });
    let tilesetOption = {
      url: '',
      shadows: false,
      maximumMemoryUsage: memoryUsage, //默认瓦片集最大内存512
      maximumScreenSpaceError: spaceError, //默认16，较高的值会导致视觉效果下降
    };

    super(show, name, false, false, tileStyle, tilesetOption);
    this.color_ = color;
  }

  get show() {
    return this._show;
  }

  set show(value) {
    super.show = value;
    this.dataSource.get(0) && (this.dataSource.get(0).show = value);
    viewer.scene.requestRender();
    if (value === false) {
      hoverOddLayer.closeOneLaneSource(this.name);
    }
  }
}

export class HDMapTileLayer2 extends Tile3DLayer {
  color_ = undefined;

  constructor(show, name, color, memoryUsage, spaceError) {
    let tileStyle = new Cesium3DTileStyle({
      color: color,
    });
    let tilesetOption = {
      url: '',
      shadows: false,
      maximumMemoryUsage: memoryUsage, //默认瓦片集最大内存512
      maximumScreenSpaceError: spaceError, //默认16，较高的值会导致视觉效果下降
    };

    super(show, name, false, false, tileStyle, tilesetOption);
    this.color_ = color;
  }

  get show() {
    return this._show;
  }

  set show(value) {
    super.show = value;
    this.dataSource.get(0) && (this.dataSource.get(0).show = value);
    viewer.scene.requestRender();
    if (value === false) {
      hoverOddLayer.closeOneLaneSource(this.name);
    }
  }
}
