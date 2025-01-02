import { gcj02towgs84 } from './geoTransform';
import {Cartesian3} from 'cesium';
export class LatLng {
  // 纬度
  public lat: number;
  // 经度
  public lng: number;
  // 点的高度
  public height: number;

  /**
   * gis位置点定义
   * @param lat 纬度
   * @param lng 经度
   * @param height 高度
   */
  constructor(lat: number, lng: number, height?: number) {
    this.lat = lat;
    this.lng = lng;
    if (height !== undefined) {
      this.height = height;
    } else {
      this.height = 0;
    }
  }

  /**
   *转换成笛卡尔坐标
   * @return {*}  {Cartesian3}
   * @memberof LatLng
   */
  toCartesian3(): Cartesian3 {
    return Cartesian3.fromDegrees(this.lng, this.lat, this.height);
  }

  /**
   * 返回cesium需要的数据结构
   */
  toArray(): number[] {
    return [this.lng, this.lat, this.height];
  }

  /**
   * 转wgs84
   *
   * @return {*}  {LatLng}
   * @memberof LatLng
   */
  toWGS84(): LatLng {
    const wgs84Array = gcj02towgs84(this.lng, this.lat);
    return new LatLng(wgs84Array[1], wgs84Array[0]);
  }
}
