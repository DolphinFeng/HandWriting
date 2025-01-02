const {atan, cos, exp, floor, log, tan, PI} = Math;

/**
 *经度转像素
 * @export
 * @param {number} lon
 * @param {number} zoom
 * @return {*}  {number}
 */
export function lng2pixel(lon: number, zoom: number): number {
  const pixels = 256 * 2 ** zoom;
  return (pixels * (lon + 180)) / 360;
}

/**
 *纬度转像素
 * @export
 * @param {number} lat
 * @param {number} zoom
 * @return {*}  {number}
 */
export function lat2pixel(lat: number, zoom: number): number {
  const pixels = 256 * 2 ** zoom;
  return (pixels * (1 - log(tan((lat * PI) / 180) + 1 / cos((lat * PI) / 180)) / PI)) / 2;
}

// export function lat2pixel2(lat: number, zoom: number): number {
//   const lat_m = Math.atanh(Math.sin(lat));
//   const pixel_y = -((lat_m * 256 * exp(zoom * Math.LN2)) / (2 * PI))
//   + (exp(zoom * Math.LN2) * (256 / 2));
//   return pixel_y;
// }

/**
 * 像素转经度
 * @export
 * @param {number} x
 * @param {number} zoom
 * @return {*}  {number}
 */
export function pixel2lng(x: number, zoom: number): number {
  const pixels = 256 * 2 ** zoom;
  return (x / pixels) * 360 - 180;
}

/**
 *像素转维度
 * @export
 * @param {number} y
 * @param {number} zoom
 * @return {*}  {number}
 */
export function pixel2lat(y: number, zoom: number): number {
  const pixels = 256 * 2 ** zoom;
  const n = PI - (2 * PI * y) / pixels;
  return (180 / PI) * atan(0.5 * (exp(n) - exp(-n)));
}

/**
 *经度转瓦片号
 * @export
 * @param {number} lon
 * @param {number} zoom
 * @return {*}  {number}
 */
export function lon2tile(lon: number, zoom: number): number {
  return floor(((lon + 180) / 360) * 2 ** zoom);
}

/**
 *纬度转瓦片号
 * @export
 * @param {number} lat
 * @param {number} zoom
 * @return {*}  {number}
 */
export function lat2tile(lat: number, zoom: number): number {
  return floor(((1 - log(tan((lat * PI) / 180) + 1 / cos((lat * PI) / 180)) / PI) / 2) * 2 ** zoom);
}

/**
 * tile号转经度
 * @export
 * @param {number} x
 * @param {number} z
 * @return {*}  {number}
 */
export function tile2lon(x: number, z: number): number {
  return (x / 2 ** z) * 360 - 180;
}

/**
 * tile号转维度
 * @export
 * @param {number} y
 * @param {number} z
 * @return {*}  {number}
 */
export function tile2lat(y: number, z: number): number {
  const n = PI - (2 * PI * y) / 2 ** z;
  return (180 / PI) * atan(0.5 * (exp(n) - exp(-n)));
}
