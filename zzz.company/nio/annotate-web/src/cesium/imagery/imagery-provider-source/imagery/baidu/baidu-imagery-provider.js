/**
 * @Author: Caven
 * @Date: 2020-01-15 20:27:27
 */
import BaiduMercatorTilingScheme from './baidu-mercator-tiling-scheme';
import {
  Cartesian2,
  WebMercatorTilingScheme,
  Event,
  DeveloperError,
  ImageryProvider,
} from 'cesium';

const TILE_URL = {
  img: '//shangetu{s}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46',
  vec: '//online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=sl&v=020',
  custom: `//${window.api.apiMapBDWMTSImageryProvider}?&x={x}&y={y}&z={z}&scale=1&customid={style}`,
  traffic:
    '//its.map.baidu.com:8002/traffic/TrafficTileService?time={time}&label={labelStyle}&v=016&level={z}&x={x}&y={y}&scaler=2',
};
class BaiduImageryProvider {
  constructor(options = {}) {
    this._url =
      options.url ||
      [
        options.protocol || '',
        TILE_URL[options.style] || TILE_URL['custom'],
      ].join('');
    this._tileWidth = 256;
    this._tileHeight = 256;
    this._maximumLevel = 18;
    this._crs = options.crs || 'BD09';
    if (options.crs === 'WGS84') {
      let resolutions = [];
      for (let i = 0; i < 19; i++) {
        resolutions[i] = 256 * Math.pow(2, 18 - i);
      }
      this._tilingScheme = new BaiduMercatorTilingScheme({
        resolutions,
        rectangleSouthwestInMeters: new Cartesian2(-20037726.37, -12474104.17),
        rectangleNortheastInMeters: new Cartesian2(20037726.37, 12474104.17),
      });
    } else {
      this._tilingScheme = new WebMercatorTilingScheme({
        rectangleSouthwestInMeters: new Cartesian2(-33554054, -33746824),
        rectangleNortheastInMeters: new Cartesian2(33554054, 33746824),
      });
    }
    this._rectangle = this._tilingScheme.rectangle;
    this._credit = undefined;
    this._style = options.style || 'normal';
    this._errorEvent = new Event();
  }

  get url() {
    return this._url;
  }

  get token() {
    return this._token;
  }

  get tileWidth() {
    if (!this.ready) {
      throw new DeveloperError(
        'tileWidth must not be called before the imagery provider is ready.'
      );
    }
    return this._tileWidth;
  }

  get tileHeight() {
    if (!this.ready) {
      throw new DeveloperError(
        'tileHeight must not be called before the imagery provider is ready.'
      );
    }
    return this._tileHeight;
  }

  get maximumLevel() {
    if (!this.ready) {
      throw new DeveloperError(
        'maximumLevel must not be called before the imagery provider is ready.'
      );
    }
    return this._maximumLevel;
  }

  get minimumLevel() {
    if (!this.ready) {
      throw new DeveloperError(
        'minimumLevel must not be called before the imagery provider is ready.'
      );
    }
    return 0;
  }

  get tilingScheme() {
    if (!this.ready) {
      throw new DeveloperError(
        'tilingScheme must not be called before the imagery provider is ready.'
      );
    }
    return this._tilingScheme;
  }

  get rectangle() {
    if (!this.ready) {
      throw new DeveloperError(
        'rectangle must not be called before the imagery provider is ready.'
      );
    }
    return this._rectangle;
  }

  get ready() {
    return !!this._url;
  }

  get errorEvent() {
    return this._errorEvent;
  }

  get credit() {
    return this._credit;
  }

  get hasAlphaChannel() {
    return true;
  }

  getTileCredits(x, y, level) {}

  requestImage(x, y, level) {
    if (!this.ready) {
      throw new DeveloperError(
        'requestImage must not be called before the imagery provider is ready.'
      );
    }
    let xTiles = this._tilingScheme.getNumberOfXTilesAtLevel(level);
    let yTiles = this._tilingScheme.getNumberOfYTilesAtLevel(level);
    let url = this._url
      .replace('{z}', level)
      .replace('{s}', String(1))
      .replace('{style}', this._style);
    if (this._crs === 'WGS84') {
      url = url.replace('{x}', String(x)).replace('{y}', String(-y));
    } else {
      url = url
        .replace('{x}', String(x - xTiles / 2))
        .replace('{y}', String(yTiles / 2 - y - 1));
    }
    return ImageryProvider.loadImage(this, url);
  }
}

export default BaiduImageryProvider;
