import { Base } from '../core/base';
import { TileManager } from './tileManager';
import { DataFilter } from './filter';
import { TileState, Tile } from '../data/tile';
export class DataManager extends Base {
  constructor(context) {
    super(context);
    this.tileManager = new TileManager(context);
    this.minLevel = 9;
    this._initListener();
    setTimeout(() => {
      this._onMapChange();
    }, 0);
    this.selectId = null;
    this.showCon = {};
    this.filtercondition = [];
    this.dataFilter = new DataFilter(context);
    this.selectIds = [];
    this.srcState = 1;
    this.version1Tiles = [];
    this.version2Tiles = [];
  }

  setTile(tileID, data) {
    const tile = new Tile(tileID, tileID, this.tileManager.tileZoom, tileID);
    this.tileManager.loadedTile(data, tile);
  }

  setFilters(filters) {
    this.dataFilter.setFilters(filters);
    this._onMapChange();
  }

  setFilterStates(filterState) {
    this.dataFilter.setFilterStates(filterState);
  }

  canShow(tile) {
    if (tile?.state === TileState.loaded
      && tile.data
      && tile.data.status !== -1
      && this.dataFilter.hasShowFilter(tile.data.status)) {
      return true;
    }
    return false;
  }

  stateCanShow(tile) {
    const tileState = tile.data?.tile_state;
    if (tileState && this.dataFilter.showFilterState(tileState)) {
      return true;
    }
    return false;
  }

  _onMapChange() {
    const map = this.context.lmap;
    const zoom = map.getZoom();
    if (zoom < this.minLevel) {
      return;
    }
    const bounds = this.context.lmap.getBounds();
    const tiles = this.tileManager.loadTileByLatLngBound(bounds);
    this.tileManager.loadTiles(tiles);
    this.context.render.renderTiles(tiles);
    this.context.render.regionLayer.renderText();
  }

  setSelectId(tileId) {
    this.selectId = tileId;
    this.context.render.setSelectId(tileId);
  }

  _initListener() {
    this.context.lmap.on('viewreset', this._onMapChange.bind(this));
    this.context.lmap.on('moveend', this._onMapChange.bind(this));
    this.context.lmap.once('load', this._onMapChange.bind(this));
  }

  refresh() {
    this.tileManager.clear();
    this._onMapChange();
  }

  setSelectIds(tileIds) {
    this.selectIds = tileIds;
  }

  getSelectIds() {
    return this.selectIds;
  }

  updateSelectTiles(tileId, isSelected) {
    if (isSelected) {
      this.selectIds.push(tileId);
    } else {
      const index = this.selectIds.indexOf(tileId);
      this.selectIds.splice(index, 1);
    }
    this.context.render.updateSelectTiles(tileId, isSelected);
  }

  setSrcState(state) {
    this.srcState = state;
    this.tileManager.setSrcState(state);
    this._onMapChange();
  }

  getSrcState() {
    return this.srcState;
  }

  setVersion1Tiles(tiles) {
    this.context.render.setVersion1Tiles(this.version1Tiles, false);
    if (tiles.length) {
      this.context.render.setVersion1Tiles(tiles, true);
    }
    this.version1Tiles = tiles;
  }

  setVersion2Tiles(tiles) {
    this.context.render.setVersion2Tiles(this.version2Tiles, false);
    if (tiles.length) {
      this.context.render.setVersion2Tiles(tiles, true);
    }
    this.version2Tiles = tiles;
  }
}
