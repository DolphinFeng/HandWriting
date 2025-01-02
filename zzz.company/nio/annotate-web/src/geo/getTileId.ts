export type IInt32Coord = Record<'lat_nds' | 'lng_nds', string>;
export type ILngLatCoord = Record<'lng' | 'lat', number>;

/**
 * @description 根据经纬度以及level生成瓦片ID
 * @export
 * @param {number} lng 经
 * @param {number} lat 纬
 * @param {number} level
 * @return {*}  {number}
 */
export function getTileIDFromLatLng(lng: number, lat: number, level: number): number {
  const init32Coord = toNdsCoordinates(lng, lat); // 将经纬度映射成int32类型的
  return getTileIDByNdsCoord(init32Coord, level);
}

/**
 * 根据nds坐标系统获取tile编码
 * @export
 * @param {IInt32Coord} ndsCoord
 * @param {number} level
 * @return {*}  {number}
 */
export function getTileIDByNdsCoord(ndsCoord: IInt32Coord, level: number): number {
  const mortonCode = getMortonCodes(ndsCoord); // 取到莫顿码
  const tileNumber = mortonCode.substring(0, 2 * level + 1); // 根据莫顿码取其 tile number
  const tileId = `${'1'.padEnd(16 - level, '0')}${tileNumber}`; // Create the packed tile id from the tile number and level.
  return parseInt(tileId, 2);
}

/**
 * @description 根据tile ID获取经纬度
 * @export
 * @param {(number | string)} tileID
 * @param {number} level
 * @return {*}  {ILngLatCoord}
 */
export function getLngLatFromTileID(tileID: number | string, level: number): ILngLatCoord {
  const tileNum = getTileNum(tileID, level); // 获取tile num
  return getLngLatFromTileNum(tileNum);
}

/**
 * @description 经度范围内求该瓦片层级下每格tile的 size
 * @export
 * @param {number} level
 * @return {*}  {number}
 */
export function getLngTileBoundarySizeFromLevel(level: number): number {
  return 360 / 2 ** (level + 1);
}

/**
 * @description 根据 tileNum获取获取经纬度
 * @export
 * @param {string} tileNum
 * @return {*}  {ILngLatCoord}
 */
export function getLngLatFromTileNum(tileNum: string): ILngLatCoord {
  const tileArr = tileNum.split('');
  let lngStr = '';
  let latStr = '';
  tileArr.forEach((code, index) => {
    if (index % 2 === 0) {
      lngStr += code;
    } else {
      latStr += code;
    }
  });

  const lngResult = getCoordFromNdsCoord(parseInt(getNdsCoordFromNegative(lngStr), 2));
  const latResult = getCoordFromNdsCoord(parseInt(getNdsCoordFromNegative(latStr), 2));

  return {
    lng: judgementNdsCoordPositive(lngStr) ? lngResult : -lngResult,
    lat: judgementNdsCoordPositive(lngStr) ? latResult : -latResult,
  };
}

/**
 * @description 根据二进制坐标判断正负
 * @param {string} ndsCoord
 * @return {*}  {boolean}
 */
function judgementNdsCoordPositive(ndsCoord: string): boolean {
  return ndsCoord[0] === '0';
}

/**
 * @description 根据二进制坐标判断正负， 如果为负获取正确二进制
 * @param {string} ndsCoord
 * @param {('x'| 'y')} type
 * @return {*}  {string}
 */
function getNdsCoordFromNegative(ndsCoord: string): string {
  // 首数字为0则证明在正轴 可以直接返回
  if (judgementNdsCoordPositive(ndsCoord)) return ndsCoord;
  let codeLength = ndsCoord.length;

  // 取补码
  let complementCode = ndsCoord;
  // 当有进位时
  if (parseInt(ndsCoord, 2) === 0) {
    codeLength += 1;
    complementCode = '1'.padEnd(codeLength, '0');
  }

  // 求得反码
  const negateCode = subBinary(complementCode, '1'.padStart(codeLength, '0'));
  // 取反
  return getNegateFromOriginalCode(negateCode);
}

/**
 * @description 根据tileID 获取 tileNum
 * @export
 * @param {string} tileID
 * @param {number} level
 * @return {*}  {string}
 */
export function getTileNum(tileID: number | string, level: number): string {
  const cTileID = typeof tileID === 'number' ? tileID.toString(2) : parseInt(tileID, 10).toString(2); // 转成二进制
  return cTileID.substring(16 - level).padEnd(63, '0');
}

/**
 * @description 根据二进制NDS坐标取经纬度
 * @export
 * @param {number} lngNdsCoord
 * @return {*}  {number}
 */
export function getCoordFromNdsCoord(ndsCoord: number): number {
  return (ndsCoord * 360) / 2 ** 32;
}

/**
 * @description 求该瓦片层级下每格tile的 size
 * @export
 * @param {number} level
 * @return {*}  {number}
 */
export function getTileBoundarySizeFromLevel(level: number): number {
  return 180 / 2 ** level;
}

/**
 * 获取10进制的纬度编号
 *
 * @export
 * @return {*}  {number}
 */
export function getNdsCoord(coord: number): number {
  return Math.floor((coord / 360) * 2 ** 32);
}

/**
 *转换成莫顿码坐标编号
 *
 * @export
 * @param {number} latNdsCoord
 * @return {*}
 */
export function ndsCoordToString(ndsCoord: number, type: 'x' | 'y'): string {
  const codeLength = type === 'x' ? 32 : 31;

  // 如果经纬度为负则取补码
  if (ndsCoord < 0) {
    const originalCode = Math.abs(ndsCoord).toString(2).padStart(codeLength, '0'); // 求原码
    const negateCode = getNegateFromOriginalCode(originalCode); // 取反码
    const complementCode = addBinary(negateCode, '1'.padStart(codeLength, '0')); // 取补码
    return complementCode.length > codeLength ? '0'.padStart(codeLength, '0') : complementCode; // 如果超位了就用 0
  }
  return ndsCoord.toString(2).padStart(codeLength, '0');
}

/**
 * @description 根据经纬度生成其映射后的int32数据
 * @param {number} lng
 * @param {number} lat
 * @return {IInt32Coord}  {IInt32Coord}
 */
export function toNdsCoordinates(lng: number, lat: number): IInt32Coord {
  return {
    lng_nds: ndsCoordToString(getNdsCoord(lng), 'x'),
    lat_nds: ndsCoordToString(getNdsCoord(lat), 'y'),
  };
}

/**
 * @description 根据int32经纬度获取莫顿码
 * @param {IInt32Coord} init32_coord
 * @return {string}  {string}
 */
export function getMortonCodes({lng_nds, lat_nds}: IInt32Coord): string {
  let str = '';
  const len = Math.max(lat_nds.length, lng_nds.length);
  // 交替插值
  for (let i = 0; i < len; i++) {
    str += lng_nds[i] + lat_nds[i]; // 将undefined和其他值都添加进去
  }
  const s = str.split('undefined').join(''); // 去除数组多余的undefined
  return s;
}

/**
 * @description 根据原码取反码 返回的仍然是二进制字符串
 * @param {string} originalCode
 * @return {*}  {string}
 */
function getNegateFromOriginalCode(originalCode: string): string {
  return originalCode
    .split('')
    .map((code) => (code === '0' ? '1' : '0'))
    .join('');
}

/**
 * @description 二进制求和 返回的仍然是二进制字符串
 * @param {string} code1
 * @param {string} code2
 * @return {*}  {string}
 */
function addBinary(code1: string, code2: string): string {
  let result = '';
  let carry = 0;
  for (let i = code1.length - 1, j = code2.length - 1; i >= 0 || j >= 0; i--, j--) {
    let sum = carry;
    sum += i >= 0 ? parseInt(code1[i], 10) : 0;
    sum += j >= 0 ? parseInt(code2[j], 10) : 0;
    result += `${sum % 2}`;
    carry = Math.floor(sum / 2);
  }
  result += `${carry === 1 ? carry : ''}`;
  return result.split('').reverse().join('');
}

/**
 * @description 二进制求差 返回的仍然是二进制字符串
 * @param {string} code1
 * @param {string} code2
 * @return {*}  {string}
 */
export function subBinary(code1: string, code2: string): string {
  // 二进制数
  const num1List = code1.split('');
  const num2List = code2.split('');
  // 借位标识
  let borrowflug = 0;
  // 两数相加后结果
  const subRes = [];

  // 需要循环相加的次数
  const needLoopCoutTimes = num1List.length;
  // 从最后一位开始
  for (let i = needLoopCoutTimes - 1; i > -1; i--) {
    // 该位相减
    let n = parseInt(num1List[i], 10) - parseInt(num2List[i], 10) - borrowflug;
    borrowflug = 0;
    // 需要借位
    if (n < 0) {
      n += 2;
      borrowflug = 1;
    }
    subRes.unshift(n);
  }

  return subRes.join('');
}
