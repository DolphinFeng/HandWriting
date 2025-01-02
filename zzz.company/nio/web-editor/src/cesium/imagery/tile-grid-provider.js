import {Event, Rectangle, WebMercatorTilingScheme} from 'cesium';
import {poll} from '../../worker/core.js';
import {ref} from 'vue';
import {createViewer} from '../initMap.js';

export class TileGridProvider {
  defaultAlpha = undefined;

  defaultNightAlpha = undefined;

  defaultDayAlpha = undefined;

  defaultBrightness = undefined;

  defaultContrast = undefined;

  defaultHue = undefined;

  defaultSaturation = undefined;

  defaultGamma = undefined;

  defaultMinificationFilter = undefined;

  tileLevel = 13;

  defaultMagnificationFilter = undefined;

  constructor(tileLevel) {
    this.tileLevel = tileLevel;
    this._tilingScheme = new WebMercatorTilingScheme();
    this._errorEvent = new Event();
    this._readyPromise = Promise.resolve(true);
  }

  get proxy() {
    return undefined;
  }

  get tileWidth() {
    return 256;
  }

  get tileHeight() {
    return 256;
  }

  get maximumLevel() {
    return undefined;
  }

  get minimumLevel() {
    return undefined;
  }

  get tilingScheme() {
    return this._tilingScheme;
  }

  get rectangle() {
    return this._tilingScheme.rectangle;
  }

  get tileDiscardPolicy() {
    return undefined;
  }

  get errorEvent() {
    return this._errorEvent;
  }

  get ready() {
    return true;
  }

  get readyPromise() {
    return this._readyPromise;
  }

  get credit() {
    return undefined;
  }

  get hasAlphaChannel() {
    return true;
  }

  getTileCredits() {
    return undefined;
  }

  async requestImage(x, y, level) {
    if (level >= 10) {
      return new Promise((resolve, reject) => {
        poll
          .start('getNDSTileImageUrl', {
            x,
            y,
            z: level,
            ndsLevel: this.tileLevel,
          })
          .then((res) => {
            let url = res.data.url;
            const img = new Image();
            img.src = url;
            img.onload = () => {
              resolve(img);
            };
          })
          .catch((err) => {
            console.log('失败了', err);
          });
      });
    }
    return null;
  }

  pickFeatures(x, y, level, longitude, latitude) {
    return undefined;
  }
}

export let tileGridLayerVisible = ref(false);
export let tileGridLayer = null;

export function resetGridTileLayer() {
  tileGridLayerVisible.value = false;
  tileGridLayer = null;
}

export function changeTileGridShow(show) {
  if (tileGridLayer === null) {
    let viewer = createViewer();
    initTileGridLayer(viewer);
  }
  tileGridLayer.show = show;
}

export function initTileGridLayer(viewer) {
  viewer.imageryLayers.addImageryProvider(new TileGridProvider(13), 1);
  tileGridLayer = viewer.imageryLayers.get(1);
  tileGridLayer.show = false;
}
