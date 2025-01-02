import {Tile3DLayer} from './Tile3DLayer.js';
import {createViewer} from '../../../cesium/initMap.js';

const viewer = createViewer();
export class CustomTileLayer extends Tile3DLayer {
  constructor(label, tileStyle) {
    let tilesetOption = {
      url: '',
      shadows: false,
      maximumMemoryUsage: 200,
      maximumScreenSpaceError: 0,
    };
    super(true, label, true, true, tileStyle, tilesetOption);
  }

  load3DTile(url, color) {
    this.tileOption.color = `color("${color}")`;
    return super.load3DTile(url);
  }

  load3DTile3(url, color, showExpr) {
    if (showExpr === false) {
      this.dataSource.show = false;
    } else {
      this.dataSource.show = true;
    }

    this.tileStyle.show = showExpr;
    this.tileOption.color = `color("${color}")`;
    return super.load3DTile(url, '没有放行数据');
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
