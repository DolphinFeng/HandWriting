import {createViewer} from '../../cesium/initMap.js';
import {markRaw} from 'vue';

const viewer = createViewer();
/**
 * 图层自增索引
 * @type {number}
 */
let idx = Math.round(Math.random() * 1e5);

/**
 * 图层类
 */
export class Layer {
  _show = false;

  /** @type {string} */
  name;

  /** @readonly */
  _id;
  get id() {
    return this._id;
  }

  /** @type {[]} */
  children;

  /** @type{Primitive|PrimitiveCollection|PointPrimitiveCollection|Cesium3DTileset} */
  dataSource;

  /** @type{boolean} */
  deletable;

  /** @type{boolean} */
  locatable;

  get show() {
    return this._show;
  }

  /** @param value{boolean} */
  set show(value) {
    this._show = value;
    this.dataSource.show = value;
    viewer.scene.requestRender();
  }

  /**
   * @constructor
   * @param show{boolean}
   * @param name{string}
   * @param children{[]}
   * @param dataSource{Primitive|PrimitiveCollection|PointPrimitiveCollection|Cesium3DTileset}
   * @param deletable{boolean}
   * @param locatable{boolean}
   */
  constructor(show, name, children = [], dataSource, deletable, locatable) {
    this._show = show;
    this.name = name;
    this.children = children;
    this.dataSource = markRaw(dataSource);
    this.dataSource.show = show;
    this.deletable = deletable;
    this.locatable = locatable;
    this._id = idx++;
  }

  /** 图层定位 */
  location() {}

  /** @abstract */
  destroy() {
    viewer.scene.primitives.remove(this.dataSource);
    viewer.scene.requestRender();
  }
}
