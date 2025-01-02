import {getLngLatFromTileID, getNdsCoord, getTileBoundarySizeFromLevel, getTileIDFromLatLng} from '../../geo/getTileId';
import {tile2lat, tile2lon, lat2pixel, lng2pixel} from '../../geo/simpleProjection';

type ConvertType = () => Promise<any>;
const TILE_SIZE = 256;
const CONTENT_TILE_LEVEL = 14;

export class TileDrawer {
  public canvas: OffscreenCanvas;
  public context: OffscreenCanvasRenderingContext2D | null;
  public x: number;
  public y: number;
  public z: number;
  public minLat: number;
  public minLng: number;
  public maxLat: number;
  public maxLng: number;
  public earthTileLevel: number;
  public tileWidth: number;
  public retryCount: number;
  public hasDataTiles?: number[];
  public isRequested: boolean; // 判断当前标准网格对应nds tiles 是否需要重新请求
  public tiles: Map<string, number[]>; // nds tiles map
  public tilesArr: number[]; // nds tiles tileNum数组
  public isShowTileLabel = true;
  public labelColor: string; // 文本颜色
  public gridColor: string; // 网格边框颜色
  public rectColor: string; // 有数据的网格颜色

  constructor(x: number, y: number, z: number, ndsLevel: number, hasDataTiles?: number[]) {
    this.canvas = new OffscreenCanvas(TILE_SIZE, TILE_SIZE);
    this.context = this.canvas.getContext('2d');
    this.x = x;
    this.y = y;
    this.z = z;
    this.minLat = tile2lat(y + 1, this.z);
    this.maxLat = tile2lat(y, this.z);
    this.minLng = tile2lon(x, this.z);
    this.maxLng = tile2lon(x + 1, this.z);
    this.isRequested = true;
    this.retryCount = 0;
    this.earthTileLevel = ndsLevel;
    this.hasDataTiles = hasDataTiles;
    this.tilesArr = [];
    this.tileWidth = getTileBoundarySizeFromLevel(this.earthTileLevel);
    this.tiles = this.getNdsTiles();
    this.labelColor = 'rgba(255, 0, 0, 1)';
    this.gridColor = 'rgba(255, 0, 0, 1)';
    this.rectColor = 'rgba(255, 0, 0, 1)';

    if (this.context !== null) {
      this.context.lineWidth = 1;
      this.context.font = '16px SourceHanSerifCN';
      this.context.strokeStyle = this.gridColor;
    }
  }

  drawNormalTile(): void {
    if (this.context !== null) {
      const baseX = lng2pixel(this.minLng, this.z);
      const baseY = lat2pixel(this.maxLat, this.z);
      const minX = lng2pixel(this.minLng, this.z) - baseX;
      const minY = lat2pixel(this.maxLat, this.z) - baseY;
      const maxX = lng2pixel(this.maxLng, this.z) - baseX;
      const maxY = lat2pixel(this.minLat, this.z) - baseY;
      this.context.strokeStyle = this.gridColor;
      this.drawRect(minX, minY, maxX, maxY);
      this.context.strokeStyle = 'rgb(255,0,0)';
    }
  }

  /**
   * 根据经纬度获取nds瓦片编号
   *
   * @param {LatLngBoundary} bounds
   * @memberof TileManager
   */
  getNdsTiles(): Map<string, number[]> {
    const {minLat, minLng, maxLat, maxLng} = this;
    const result = new Map();
    const tileLngWidth = this.tileWidth;
    const tileLatWidth = tileLngWidth;
    for (let lng = minLng; lng < maxLng + tileLngWidth; lng += tileLngWidth) {
      for (let lat = minLat; lat < maxLat + tileLatWidth; lat += tileLatWidth) {
        const ndsLatCoord = getNdsCoord(lat);
        const ndsLngCoord = getNdsCoord(lng);
        const tileId = getTileIDFromLatLng(lng, lat, this.earthTileLevel);
        // console.log(lng, lat, tileId, getLngLatFromTileID(tileId, this.earthTileLevel));
        if (result.get(tileId) === undefined) {
          const tile = [ndsLatCoord, ndsLngCoord, this.earthTileLevel, tileId];
          result.set(tileId, tile);
        }
      }
    }
    return result;
  }

  drawOneTile(ndsTileNum: number, isGrid: boolean): void {
    const {context} = this;
    if (context !== null) {
      const coords = getLngLatFromTileID(ndsTileNum, this.earthTileLevel);
      const {lat, lng} = coords;
      const {tileWidth} = this;
      const maxLng = lng + tileWidth;
      const maxLat = lat + tileWidth;
      const baseX = lng2pixel(this.minLng, this.z);
      const baseY = lat2pixel(this.maxLat, this.z);
      const minX = lng2pixel(lng, this.z) - baseX;
      const minY = lat2pixel(maxLat, this.z) - baseY;
      const maxX = lng2pixel(maxLng, this.z) - baseX;
      const maxY = lat2pixel(lat, this.z) - baseY;

      if (isGrid) {
        this.drawGrid(minX, minY, maxX, maxY);
        this.drawTileLabel(ndsTileNum, minX, minY);
      } else {
        this.drawGrid(minX, minY, maxX, maxY);
        this.drawRect(minX, minY, maxX, maxY);
      }
    }
  }

  // 绘制网格
  drawGrid(minX: number, minY: number, maxX: number, maxY: number): void {
    const {context} = this;
    if (context !== null) {
      context.moveTo(minX, minY);
      context.lineTo(minX, maxY);
      context.lineTo(maxX, maxY);
      context.lineTo(maxX, minY);
      context.lineTo(minX, minY);
      context.stroke();
    }
  }

  // 绘制矩形
  drawRect(minX: number, minY: number, maxX: number, maxY: number): void {
    const {context} = this;
    const width = maxX - minX;
    const height = maxY - minY;
    if (context !== null) {
      context.fillStyle = this.rectColor;
      context.fillRect(minX, minY, width, height);
      context.fillStyle = this.labelColor;
    }
  }

  // 绘制tile号
  drawTileLabel(tileNumber: number, minX: number, minY: number): void {
    const {context, isShowTileLabel} = this;
    if (context !== null && isShowTileLabel && this.z > 12) {
      context.fillStyle = this.labelColor;
      context.fillText(`${tileNumber}`, minX + 5, minY + 20);
    }
  }

  async drawNdsTile(): Promise<any> {
    const tileIds = this.tiles.keys();

    for (const tileId of tileIds) {
      this.drawOneTile(Number(tileId), true);
    }
    return this.toDataUrl();
  }

  async drawNdsContentTile(): Promise<any> {
    const tileIds = this.tiles.keys();

    if (this.z < CONTENT_TILE_LEVEL) {
      for (const tileId of tileIds) {
        const tileNum = Number(tileId);
        if (this.hasDataTiles !== undefined) {
          if (this.hasDataTiles.includes(tileNum)) {
            this.drawOneTile(tileNum, false);
          }
        }
      }
    }
    return this.toDataUrl();
  }

  /**
   * 转换成url
   *
   * @return {*}  {Promise<any>}
   * @memberof TileDrawer
   */
  async toDataUrl(): Promise<any> {
    return new Promise((resolve) => {
      let nativeFuntion: ConvertType | undefined = this.canvas.convertToBlob;
      if (nativeFuntion === undefined) {
        nativeFuntion = (this.canvas as any).toBlob;
      }

      if (nativeFuntion !== undefined) {
        this.canvas.convertToBlob().then((blob): void => {
          const blobURL = URL.createObjectURL(blob);
          resolve(blobURL);
        });
      }
    });
  }
}

export const tileTask = {
  getNDSTileImageUrl(resolve, reject, args) {
    const drawer = new TileDrawer(args.x, args.y, args.z, args.ndsLevel);
    drawer.drawNdsTile().then((imageUrl) => {
      resolve({
        url: imageUrl,
      });
    });
  },
};
