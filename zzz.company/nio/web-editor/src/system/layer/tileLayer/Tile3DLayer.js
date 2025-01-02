import {Layer} from '../Layer.js';
import {Cesium3DTileset, Cesium3DTileStyle, PrimitiveCollection} from 'cesium';
import {Observer} from '../../../js/observer.js';
import {nioCamera, NioMessage, NioNotification} from '../../../utils/utils.js';
import {createViewer} from '../../../cesium/initMap.js';
import {ElNotification} from 'element-plus';

const viewer = createViewer();

export class Tile3DLayer extends Layer {
  locPos;
  scaleCallback = null;

  /**
   * @constructor
   * @param show{boolean}
   * @param name{string}
   * @param deletable{boolean}
   * @param locatable{boolean}
   * @param tileStyle{Cesium3DTileStyle}
   * @param tilesetOption{{url}}
   */
  constructor(show, name, deletable, locatable, tileStyle, tilesetOption) {
    super(show, name, [], new PrimitiveCollection(), deletable, locatable);
    this.tileStyle = tileStyle;
    this.tileOption = tilesetOption;
  }

  destroy() {
    viewer.scene.primitives.remove(this.dataSource);
    if (typeof this.scaleCallback === 'function') {
      Observer.remove('tileScale', this.scaleCallback);
    }
    viewer.scene.requestRender();
  }

  location() {
    if (this.locPos) {
      nioCamera.locatePosition({
        position: this.locPos,
        animate: true,
      });
    } else {
      NioNotification('warning', '当前图层无法定位', '', 3000);
    }
  }

  load3DTile(url, msg = '') {
    if (url) {
      Object.assign(this.tileOption, {
        url: url,
      });
    }
    return new Cesium3DTileset(this.tileOption).readyPromise
      .then((tileset) => {
        ElNotification.closeAll();
        this.dataSource.removeAll();
        tileset.style = this.tileStyle;
        this.dataSource.add(tileset);
      })
      .catch((err) => {
        NioMessage('warning', '数据不存在, 或加载失败。如果更新了数据, 请清空浏览器缓存后刷新页面重试。', 2000);
        this.dataSource.removeAll();
        console.log(url + ', 数据不存在, 或加载失败。如果更新了数据, 请清空浏览器缓存后刷新页面重试。  ' + err.message);
        throw err;
      });
  }

  load3DTile2(url, showExpr) {
    if (url) {
      Object.assign(this.tileOption, {
        url: url,
      });
    }

    //要对dataSource的show进行处理。否则都不显示时也会请求数据
    if (showExpr === false) {
      this.dataSource.show = false;
    } else {
      this.dataSource.show = true;
    }

    this.tileStyle.show = showExpr;
    return this.load3DTile(url);
  }
}
