import { Base } from '../core/base';
import { lon2tile, lat2tile } from '../geo/geo';
import { Tile, TileState } from './tile';
import {
  getLatNdsCoord, getLngNdsCoord,
  getLngTileBoundarySizeFromLevel,
  getLatTileBoundarySizeFromLevel,
} from '../geo/getTileId';
import { getTileInfo } from '../../api';

import * as _ from 'lodash-es';

export class TileManager extends Base {
  constructor(context) {
    super(context);
    this.tileZoom = 13;
    this.loadedTiles = new Map();
    this.loadingTiles = new Map();
    this.srcState = 1
  }

  clear() {
    Array.from(this.loadedTiles.values()).forEach((tile) => {
      this.loadedTiles.delete(tile.id);
    });
    Array.from(this.loadingTiles.values()).forEach((tile) => {
      this.loadingTiles.delete(tile.id);
    });
  }

  getTileByBoundary(bounds) {
    const min = bounds.getSouthWest();
    const max = bounds.getNorthEast();
    const zoom = this.tileZoom;

    const minTileX = lon2tile(min.lng, zoom);
    const maxTileX = lon2tile(max.lng, zoom);
    const minTileY = lat2tile(max.lat, zoom);
    const maxTileY = lat2tile(min.lat, zoom);

    const results = [];
    for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
      for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
        const tile = new Tile(tileX, tileY, zoom);
        results.push(tile);
      }
    }
    this.loadTiles(results);
    return results;
  }

  /**
   * 根据屏幕需要加载tile数据
   *
   * @param {LatLngBoundary} bounds
   * @memberof TileManager
   */
  loadTileByLatLngBound(bounds) {
    const minLatLng = bounds.getSouthWest();
    const maxLatLng = bounds.getNorthEast();
    const minLat = minLatLng.lat;
    const minLng = minLatLng.lng;
    const maxLat = maxLatLng.lat;
    const maxLng = maxLatLng.lng;
    const zoom = this.tileZoom;
    const tileLngWidth = getLngTileBoundarySizeFromLevel(zoom);
    const tileLatWidth = getLatTileBoundarySizeFromLevel(zoom);
    const tiles = new Map();
    for (let lng = minLng; lng <= (maxLng + tileLngWidth); lng += tileLngWidth) {
      for (let lat = minLat; lat <= (maxLat + tileLatWidth); lat += tileLatWidth) {
        const ndsLatCoord = getLatNdsCoord(lat);
        const ndsLngCoord = getLngNdsCoord(lng);
        const tile = new Tile(ndsLngCoord, ndsLatCoord, zoom);
        const tileId = tile.tileID;
        if (tiles.get(tileId) === undefined) {
          const loadedTile = this.loadedTiles.get(tileId);
          if (loadedTile !== undefined) {
            tiles.set(tileId, loadedTile);
          } else {
            tiles.set(tileId, tile);
          }
        }
      }
    }
    return Array.from(tiles.values());
  }

  loadedTile(tileData, tile) {
    tile.setState(TileState.loaded);
    tile.setData(tileData);
    this.loadedTiles.set(tile.tileID, tile);
    this.loadingTiles.delete(tile.tileID);
  }

  loadingTile(tile) {
    tile.setState(TileState.loading);
    this.loadingTiles.set(tile.tileID, tile);
  }

  loadTiles(tiles) {
    const needLoadingTiles = [];
    tiles.forEach((tile) => {
      if (this.loadedTiles.get(tile.tileID) === undefined
      && this.loadingTiles.get(tile.tileID) === undefined) {
        needLoadingTiles.push(tile);
      }
    });
    if (needLoadingTiles.length > 0) {
      this.requestTiles(needLoadingTiles);
    }
  }

  setSrcState(state) {
    this.srcState = state;
  }

  requestTiles(tiles) {
    _.each(tiles, tile => this.loadingTile(tile));
    _.chunk(_.compact(_.map(tiles, 'tileID')), 300).forEach((tileIDs) => {
      const data = {
        tile_ids: tileIDs,
        product_type: this.srcState
      };
      getTileInfo(data).then((res) => {
        const resData = res.data
        if (resData.code === 0) {
          const datas = resData.data
          if (datas.length > 0) {
            datas.forEach((data) => {
              const tile = this.loadingTiles.get(data.tileId);
              if (tile !== undefined) {
                this.loadedTile(data, tile);
              }
            });
          }
          this.context.dataManager._onMapChange();
        }
      });
    });
  }
}
