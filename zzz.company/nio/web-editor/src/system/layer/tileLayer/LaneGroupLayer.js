import {Tile3DLayer} from './Tile3DLayer.js';
import {Cesium3DTileStyle} from 'cesium';
import {createViewer} from '../../../cesium/initMap.js';

export const ALLOW_ROAD = '放行道路';
const baseMapURL = window.api.baseMap;
const viewer = createViewer();
export class LaneGroupTileLayer extends Tile3DLayer {
  color_ = undefined;

  constructor(show, showExpr, name, color, memoryUsage, spaceError) {
    let tileStyle = new Cesium3DTileStyle({
      color: `color("${color}")`,
      show: showExpr,
    });
    let tilesetOption = {
      url: '',
      shadows: false,
      maximumMemoryUsage: memoryUsage,
      maximumScreenSpaceError: spaceError,
      queryParameters: ALLOW_ROAD,
    };
    super(show, name, false, false, tileStyle, tilesetOption);
    this.color_ = color;
  }

  // mutation 强制刷新
  load3DTile(version, showExpr = false, timer = null, mutation = false) {
    if (localStorage.getItem(ALLOW_ROAD) !== 'true' && !mutation) return;
    const deadline = localStorage.getItem('timer');
    const url = `http://nmap-web-editor-hl.idc-prod.nioint.com/data/ln/customLayers/allow_data_visual_${
      timer ?? deadline
    }_${version}/tileset.json`;
    if (showExpr === false) {
      this.dataSource.show = false;
    } else {
      this.dataSource.show = true;
    }

    this.tileStyle.show = showExpr;
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
