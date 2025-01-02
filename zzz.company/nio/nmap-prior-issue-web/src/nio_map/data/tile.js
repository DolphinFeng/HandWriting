import { BoudingBox } from '../geo/boundingBox';
import {
  getLngTileBoundarySizeFromLevel,
  getLatTileBoundarySizeFromLevel, getTileIDByNdsCoord,
  ndsCoordToString, getLngLatFromTileID,
} from '../geo/getTileId';

export const TileState = {
  empty: 0,
  loading: 1,
  loaded: 2,
};

export class Tile {
  constructor(x, y, z, tileID) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.ndsTileX = x;
    this.ndsTileY = y;
    this.level = z;
    this.tileID = tileID || this.getTileId();
    this.data = null;
    this.id = this.tileID;
    this.updateVersion = 0;
    this.setState(TileState.empty);
  }

  setState(state) {
    this.state = state;
    this.updateRenderId();
  }

  getCenter() {
    if (this._center === undefined) {
      const bounds = this.getTileBoundary();
      this._center = bounds.getCenter();
    }

    return this._center;
  }

  updateRenderId() {
    this.updateVersion += 1;
    this.updateVersion %= 10000;
    this.renderId = `${this.updateVersion}_${this.id}_${this.state}`;
  }

  tileToBounds() {
    return BoudingBox.tile2boundingBox(this.x, this.y, this.z);
  }

  setData(data) {
    this.data = data;
    this.updateRenderId();
  }

  /**
   * 获取tile id
   *
   * @return {*}  {number}
   * @memberof Tile
   */
  getTileId() {
    if (this.tileID) {
      return this.tileID;
    }
    const ndsCoords = {
      lng_nds: ndsCoordToString(this.ndsTileX, 'x'),
      lat_nds: ndsCoordToString(this.ndsTileY, 'y'),
    };
    return getTileIDByNdsCoord(ndsCoords, this.level);
  }

  intersects(bounds) {
    return this.getTileBoundary().toLeafLetBounds()
      .intersects(bounds);
  }

  /**
   * 获取瓦片的boundary
   *
   * @return {*}  {LatLngBoundary}
   * @memberof Tile
   */
  getTileBoundary() {
    if (this._boundaray === undefined) {
      const { lng, lat } = getLngLatFromTileID(this.tileID, this.level);
      const tileLngSize = getLngTileBoundarySizeFromLevel(this.level);
      const tileLatSize = getLatTileBoundarySizeFromLevel(this.level);
      const maxLng = lng + tileLngSize;
      const maxLat = lat + tileLatSize;
      this._boundaray = new BoudingBox([lng, lat], [maxLng, maxLat]);
    }
    return this._boundaray;
  }

  asGeoJSON() {
    return  {
      type: 'Feature',
      id: this.id,
      properties: {
        name: 'Wyoming',
      },
      geometry: {
        type: 'Polygon',
        coordinates: this.getTileBoundary().toArray(),
      },
    };
  }
}
