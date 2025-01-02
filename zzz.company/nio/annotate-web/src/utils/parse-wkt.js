/**
 * 解析WKT字符串
 */
const parseWKT = (function () {
  const regExes = {
    typeStr: /^\s*(\w+)[\s\w]*\(\s*(.*)\s*\)\s*$/,
    spaces: /\s+/,
    parenComma: /\)\s*,\s*\(/,
    polygonComma: /\)\)\s*,\s*\(\(/,
    doubleParenComma: /\)\s*\)\s*,\s*\(\s*\(/,
    trimParens: /^\s*\(?(.*?)\)?\s*$/,
  };
  return {
    /**
     * 传入WKT字符串
     * @param wkt{string}
     * @return {*}
     */
    read(wkt) {
      let features, type, str;
      wkt = wkt.replace(/[\n\r]/g, ' ');
      let matches = regExes.typeStr.exec(wkt);
      if (matches) {
        type = matches[1].toLowerCase();
        str = matches[2];
        if (this.parse[type]) {
          features = this.parse[type].apply(this, [str]);
        }
      }
      return features;
    },
    trim: function (str) {
      return str.replace(/^\s+|\s+$/, '');
    },
    parse: {
      point: function (str) {
        return this.trim(str)
          .split(regExes.spaces)
          .map((item) => parseFloat(item));
      },
      multipoint: function (str) {
        let point;
        let points = this.trim(str).split(',');
        let components = [];
        for (let i = 0, len = points.length; i < len; ++i) {
          point = points[i].replace(regExes.trimParens, '$1');
          components.push(this.parse.point.apply(this, [point]).geometry);
        }
        return components;
      },

      linestring: function (str) {
        let points = this.trim(str).split(',');

        let components = [];
        for (let i = 0, len = points.length; i < len; ++i) {
          components.push(this.parse.point.apply(this, [points[i]]));
        }
        return components;
      },

      multilinestring: function (str) {
        let line;
        let lines = str.trim().split(regExes.parenComma);
        let components = [];
        for (let i = 0, len = lines.length; i < len; ++i) {
          line = lines[i].replace(regExes.trimParens, '$1');
          components.push(this.parse.linestring.apply(this, [line]).geometry);
        }
        return components;
      },

      polygon: function (str) {
        let ring, linestring;
        let rings = this.trim(str).split(regExes.parenComma);
        let components = [];
        for (let i = 0, len = rings.length; i < len; i++) {
          ring = rings[i].replace(regExes.trimParens, '$1');
          linestring = this.parse.linestring.apply(this, [ring]);
          components.push(linestring);
        }
        return components;
      },

      multipolygon: function (str) {
        let polygon, rings;
        let polygons = this.trim(str).split(regExes.polygonComma);
        let components = [];
        for (let i = 0; i < polygons.length; ++i) {
          polygon = polygons[i].replace(regExes.trimParens, '$1');
          rings = this.parse.polygon.apply(this, [polygon]);
          for (let j = 0; j < rings.length; j++) {
            components.push(rings[j]);
          }
        }
        return components;
      },
    },
  };
})();

export { parseWKT };
