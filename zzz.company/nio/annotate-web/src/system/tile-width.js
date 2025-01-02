/** 线宽类 */
export class TileWidth {
  distance = 0;
  width = 0;
  k = 0;
  b = 0;
  constructor(distance, width) {
    this.distance = distance;
    this.width = width;
  }
}

/**计算线宽 */
export function getParams(arr) {
  arr[0].b = arr[0].width;
  let len = arr.length;
  for (let i = 1; i < len; i++) {
    arr[i].k =
      (arr[i].width - arr[i - 1].width) /
      (arr[i].distance - arr[i - 1].distance);
    arr[i].b = arr[i].width - arr[i].k * arr[i].distance;
  }
  arr.push(new TileWidth(Number.POSITIVE_INFINITY, arr[len - 1].width));
  arr[len].b = arr[len].width;
  return (distance) => {
    for (let i = 0; i < arr.length; i++) {
      if (distance < arr[i].distance) {
        return arr[i].k * distance + arr[i].b;
      }
    }
  };
}
