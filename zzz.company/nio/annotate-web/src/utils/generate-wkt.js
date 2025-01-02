import { Cartographic, Math as CMath } from 'cesium';

/**
 * 生成WKT字符串
 */
const generateWKT = {
  write(type, positions) {
    return this.stringify[type.toLowerCase()](positions);
  },
  stringify: {
    linestring: function (positions) {
      positions = positions.map((item) => {
        let cartographic = Cartographic.fromCartesian(item);
        return `${CMath.toDegrees(cartographic.longitude)} ${CMath.toDegrees(
          cartographic.latitude
        )} ${cartographic.height}`;
      });
      return `LINESTRING Z(${positions.join(',')})`;
    },
    point: function (position) {
      let cartographic = Cartographic.fromCartesian(position);
      return `POINT Z(${CMath.toDegrees(
        cartographic.longitude
      )} ${CMath.toDegrees(cartographic.latitude)} 0)`;
    },
  },
};

export { generateWKT };
