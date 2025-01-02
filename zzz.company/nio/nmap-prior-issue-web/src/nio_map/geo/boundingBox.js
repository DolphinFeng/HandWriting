import { tile2lon, tile2lat } from './geo';
import { LatLng, LatLngBounds } from 'leaflet';
export class BoudingBox {
  constructor(min, max) {
    this.min = min;
    this.max = max;
  }

  toArray() {
    const { min } = this;
    const { max } = this;
    return [[min, [max[0], min[1]], max, [min[0], max[1]], min]];
  }

  toLeafLetBounds() {
    const { min } = this;
    const { max } = this;
    return new LatLngBounds(new LatLng(min[1], min[0]), new LatLng(max[1], max[0]));
  }

  getCenter() {
    return new LatLng((this.min[1] + this.max[1]) / 2, (this.min[0] + this.max[0]) / 2);
  }

  static tile2boundingBox(x, y, z) {
    const minX = tile2lon(x, z);
    const minY = tile2lat(y + 1, z);
    const maxX = tile2lon(x + 1, z);
    const maxY = tile2lat(y, z);
    return new BoudingBox([minX, minY], [maxX, maxY]);
  }
}
