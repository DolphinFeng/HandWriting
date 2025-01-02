export class NioPoint {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  x: number;
  y: number;
}

export class NioGeoPoint {
  constructor(lon: number, lat: number, h: undefined | number = undefined) {
    this.lon = lon;
    this.lat = lat;
    if (h) {
      this.h = h;
    }
  }

  lon: number;
  lat: number;
  h?: number;
}
