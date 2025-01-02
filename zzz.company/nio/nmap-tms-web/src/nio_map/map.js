import { Map, TileLayer, Point } from 'leaflet';
import { Render } from './render/render';
import { DataManager } from './data/dataManager';
import EventEmitter  from 'eventemitter3';
export class VeMap  extends EventEmitter {
  constructor(mapId, options, mapState) {
    super();
    this.lmap = new Map(mapId, {
      center: options.center,
      zoom: options.zoom,
      minZoom: 11,
      maxZoom: 14,
      attributionControl: false,
      zoomControl: false,
      preferCanvas: true,
    });

    window.map = this.lmap;
    this.render = new Render(this, mapState);
    this.dataManager = new DataManager(this);
    this._initLayer(options.url);
  }

  selectTile(tileId, pixelToCenter, isPopup) {
    const tile = this.dataManager.tileManager.loadedTiles.get(tileId);
    const center = tile.getCenter();
    this.setCenter(center, 11, pixelToCenter);
    this.render.svgLayer.popupModal.close();
    this.dataManager.setSelectId(`${tileId}`);
    if (isPopup) {
      this.render.svgLayer.popupModal.showup(tile);
    }
  }

  setCenter(center, zoom, pixcelToCenter) {
    const map = this.lmap;
    const pixel = map.project(center, zoom);
    const newPixel = new Point(pixel.x + pixcelToCenter[0], pixel.y + pixcelToCenter[1]);
    const newCenter = map.unproject(newPixel, zoom);
    map.setView(newCenter, zoom);
  }

  setFilters(filters) {
    this.dataManager.setFilters(filters);
  }
  setFilterStates(filterState) {
    this.dataManager.setFilterStates(filterState);
  }

  setBackgroundLayer(url) {
    if (this.backgroundLayer) {
      this.lmap.removeLayer(this.backgroundLayer);
    }
    this._initLayer(url);
  }

  _initLayer(url) {
    this.backgroundLayer = new TileLayer(url);
    this.backgroundLayer.addTo(this.lmap);
  }
}
