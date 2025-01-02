import {Cesium3DTileStyle, GeoJsonDataSource, Cartesian3, PolylineMaterialAppearance, Color, Material} from 'cesium';
import axios from 'axios';
import {WKTLayer} from './wktLayer.js';
import {Observer} from '../../../js/observer.js';
import {Layer} from '../Layer.js';
import {layerController} from '../layerController.js';
import {CustomTileLayer} from '../tileLayer/CustomTileLayer.js';
import {NioMessage} from '../../../utils/utils.js';

/**
 * 自定义3DTile图层
 */
const Custom3DTileLayer = function (option) {
  //计算线宽
  const getLineWidth = (function () {
    const k = 0.0025894736842105265,
      k2 = 0.004166666666666667;
    const b = -0.8947368421052632,
      b2 = -16.666666666666668;
    return function (distance) {
      let lineWidth;
      if (distance < 500) {
        lineWidth = 0.4;
      } else if (distance < 1e4 && distance >= 500) {
        lineWidth = k * distance + b;
      } else if (distance < 1e5) {
        lineWidth = k2 * distance + b2;
      } else {
        lineWidth = 400;
      }
      return lineWidth;
    };
  })();
  let pos, tileStyle, tileLayer;

  //解析查询条件，类似  "OPERATOR=EQUAL&VALUE=8&FIELD=ALLOW_TYPE"
  const url = new URL(option.url);
  let queryParams = new URLSearchParams(url.search);
  let field = queryParams.get('FIELD');
  let operator = queryParams.get('OPERATOR');
  let value = queryParams.get('VALUE');
  let showExpr = '';

  if (field && operator && value) {
    let op = '!==';
    if (operator == 'EQUAL') {
      op = '===';
    }
    showExpr = "${feature['" + field + "']}" + op + value;
  }

  return axios
    .get(option.url)
    .then((res) => {
      tileStyle = new Cesium3DTileStyle({
        color: `color("${option.color}")`,
      });
      pos = res.data.position.split(',').map((item) => parseFloat(item));
      tileLayer = new CustomTileLayer(option.label, tileStyle);
      if (showExpr.length == 0) {
        NioMessage('success', 'NO PARAMETER');
        return tileLayer.load3DTile(option.url, option.color);
      } else {
        NioMessage('success', 'FIELD=' + field + ', OPERATOR=' + operator + ', VALUE=' + value);
        return tileLayer.load3DTile3(option.url, option.color, showExpr);
      }
    })
    .then(() => {
      layerController.unshift(tileLayer);
      tileLayer.locPos = Cartesian3.fromDegrees(pos[0], pos[1], 500);
      tileLayer.location();
      tileLayer.scaleCallback = function ({distance}) {
        tileStyle.geometryWidth = getLineWidth(distance);
      };
      Observer.register('tileScale', tileLayer.scaleCallback);
    });
};

/**
 * 图层工厂函数
 * @type {Layer}
 */
export function LayerFactory(type, option) {
  return this[type](option);
}
LayerFactory.prototype = {
  Custom3DTileLayer(option) {
    return Custom3DTileLayer(option);
  },
  CustomWKTLayer(option) {
    return new WKTLayer(option.name, option.list);
  },
};
