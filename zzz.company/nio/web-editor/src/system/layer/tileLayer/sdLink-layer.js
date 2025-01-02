import {Tile3DLayer} from './Tile3DLayer.js';
import {Cesium3DTileStyle} from 'cesium';
import {createViewer} from '../../../cesium/initMap.js';
import {omit} from 'lodash';

const baseMapHL = window.api.baseMapHL;
const viewer = createViewer();

const formWayMap = {
  0: 'unknown',
  1: '匝道',
  2: '服务区',
  3: '隧道',
  4: '桥',
  5: '交叉口内道路',
  6: '环岛',
  7: '掉头口',
  8: 'Built-up Area Road',
  9: 'Urban Road',
  10: '可移动桥',
  11: '其他',
  12: '收费站道路',
  13: '检查站道路',
  14: '停车场',
  15: '上下线分离',
  16: 'IC',
  17: 'JCT',
  18: '辅路',
  19: '主路',
  20: '主辅路出入口',
  21: '提前左转',
  22: '提前右转',
  23: '公交专用道',
};

const roadClassMap = {
  0: 'unknown',
  1: '高速',
  2: '城市快速路',
  3: '普通路',
  4: '服务区内部道路',
  11: '停车场内部道路',
};

function convertFormWay(formWayValue) {
  if (formWayValue == 0) {
    return '无属性';
  }

  let binaryStr = formWayValue.toString(2); // 转换为二进制字符串
  let result = [];
  for (let i = 0; i < binaryStr.length; i++) {
    if (binaryStr[i] === '1') {
      let index = binaryStr.length - 1 - i;
      if (formWayMap[index]) {
        result.push(formWayMap[index]);
      }
    }
  }

  return result.join(',');
}

//将sdLink返回的json转为geojson. cesium会回调本函数
function sdLinkJsonFormatFunc(payload) {
  try {
    if (!payload || !payload.tiles_data) {
      return {features: [], type: 'FeatureCollection'};
    }

    let features = [];

    for (let i = 0; i < payload.tiles_data.length; i++) {
      let sdLinks = payload.tiles_data[i].sdLinks;
      if (!sdLinks) continue;
      for (let sdLink of sdLinks) {
        let coordinates = sdLink.geometry.map((item) => {
          return [item.lon, item.lat];
        });
        let properties = omit(sdLink, ['geometry']);
        properties.formWay2 = convertFormWay(sdLink.formWay2) + ' (' + sdLink.formWay2 + ')';
        properties.roadClass2 = roadClassMap[properties.roadClass2] + ' (' + properties.roadClass2 + ')';
        //添加类型标记字段
        properties.type = 'sdl';

        let feature = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
          properties: properties,
        };

        features.push(feature);
      }
    }

    return {
      type: 'FeatureCollection',
      features: features,
    };
  } catch (error) {
    console.log(error + '');
    return {features: [], type: 'FeatureCollection'};
  }
}

export class SDLinkLayer extends Tile3DLayer {
  color_ = undefined;

  constructor(show, name, color, memoryUsage, spaceError) {
    let tileStyle = new Cesium3DTileStyle({
      color: `color("${color}")`,
    });

    let tilesetOption = {
      url: `${baseMapHL}/dynamicMap/3dtile_uri_nds_bias/tileset.json`,
      shadows: false,
      maximumMemoryUsage: memoryUsage,
      maximumScreenSpaceError: spaceError,
      customUri: window.api.sdLinkURL,
      queryParameters: {
        map_version: '',
      },
      jsonFormatFunc: sdLinkJsonFormatFunc,
    };

    super(show, name, false, false, tileStyle, tilesetOption);
    this.color_ = color;

    //放到了layercontroller里，用来改变压盖顺序
    //viewer.scene.primitives.add(this.dataSource);
  }

  load3DTile(version) {
    this.tileOption['queryParameters'] = {
      map_version: version.toString(),
    };

    //this.tileStyle.show = this.dataSource.show;
    return super.load3DTile();
  }

  get show() {
    return this._show;
  }

  set show(value) {
    super.show = value;
    this.dataSource.get(0) && (this.dataSource.get(0).show = value);
    viewer.scene.requestRender();
  }
}
