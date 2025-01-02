import {Tile3DLayer} from './Tile3DLayer.js';
import {Cesium3DTileStyle} from 'cesium';
import {createViewer} from '../../../cesium/initMap.js';
import {
  dynamicEventConPaneldata,
  DYNAMIC_MAP_ENV,
  CITY_BLACKLIST,
  getEtsForCity,
  getEtsForUserGroup,
  getEtsForItem,
} from '../../../views/map/layer/DynamicEventConditionPanel.ts';

const baseMapHL = window.api.baseMapHL;
const viewer = createViewer();

const DOMAIN_MAP_PRIOR = {
  'nmap-prior-issue-web.idc-uat.nioint.com': 'http://prior-issue-web-service.map-tencent-prod.nioint.com',
  'nmap-prior-issue-web.idc-prod.nioint.com': 'http://prior-issue-web-service.map-tencent-prod.nioint.com',
  localhost: 'http://prior-issue-web-service.map-tencent-stg.nioint.com',
};

function GetPriorIssueWebServiceUrl() {
  const hostname = window.location.hostname;
  return DOMAIN_MAP_PRIOR[hostname] || 'http://prior-issue-web-service.map-tencent-stg.nioint.com';
}

function GetDynamicEventUrl() {
  if (window.location.hostname == 'nmap-web-editor.idc-uat.nioint.com' || window.location.hostname == 'localhost') {
    return 'http://map-odd-service.tencent-prod.nioint.com/api/1/get-dynamic-events-by-tile';
  } else {
    let customUrl = 'http://map-odd-service.tencent-prod.nioint.com/api/1/get-dynamic-events-by-tile';
    if (dynamicEventConPaneldata.env == DYNAMIC_MAP_ENV.STG) {
      customUrl = 'http://map-odd-service.tencent-stg.nioint.com/api/1/get-dynamic-events-by-tile';
    }

    return customUrl;
  }
}

function dynamicJsonFormatFunc(payload) {
  try {
    return payload.wl_events;
  } catch (error) {
    console.log(error + '');
    return {features: [], type: 'FeatureCollection'};
  }
}

export class DynamicTileLayer extends Tile3DLayer {
  color_ = undefined;

  constructor(show, showExpr, name, color, memoryUsage, spaceError) {
    let tileStyle = new Cesium3DTileStyle({
      color: `color("${color}")`,
      show: showExpr,
    });

    let customUrl = GetDynamicEventUrl();

    let tilesetOption = {
      url: `${baseMapHL}/dynamicMap/3dtile_uri_nds_bias/tileset.json`, // dynamicMap/3dtile_uri_nds_49tile/tileset.json
      shadows: false,
      maximumMemoryUsage: memoryUsage,
      maximumScreenSpaceError: spaceError,
      customUri: customUrl,
      queryParameters: {
        map_version: '',
      },
    };

    super(show, name, false, false, tileStyle, tilesetOption);
    this.color_ = color;
  }

  load3DTile(version, showExpr) {
    let customUrl = GetDynamicEventUrl();
    if (customUrl) {
      Object.assign(this.tileOption, {
        customUri: customUrl,
      });
    }

    this.tileOption['queryParameters'] = {
      map_version: version.toString(),
    };

    //要对dataSource的show进行处理。否则都不显示时也会请求数据
    if (showExpr === false) {
      this.dataSource.show = false;
    } else {
      this.dataSource.show = true;
    }

    this.tileStyle.show = showExpr;

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

export class DynamicPriorTileLayer extends Tile3DLayer {
  color_ = undefined;

  constructor(show, showExpr, name, color, memoryUsage, spaceError) {
    let tileStyle = new Cesium3DTileStyle({
      color: `color("${color}")`,
      show: showExpr,
    });

    let customUrl = GetDynamicEventUrl();

    let tilesetOption = {
      url: `${baseMapHL}/dynamicMap/3dtile_uri_nds_bias/tileset.json`, // dynamicMap/3dtile_uri_nds_49tile/tileset.json
      shadows: false,
      maximumMemoryUsage: memoryUsage,
      maximumScreenSpaceError: spaceError,
      customUri: customUrl,
      queryParameters: {
        map_version: '',
      },
    };

    super(show, name, false, false, tileStyle, tilesetOption);
    this.color_ = color;
  }

  load3DTile(version, showExpr) {
    let customUrl = GetDynamicEventUrl();
    if (customUrl) {
      Object.assign(this.tileOption, {
        customUri: customUrl,
      });
    }

    this.tileOption['queryParameters'] = {
      map_version: version.toString(),
    };

    //要对dataSource的show进行处理。否则都不显示时也会请求数据
    if (showExpr === false) {
      this.dataSource.show = false;
    } else {
      this.dataSource.show = true;
    }

    this.tileStyle.show = showExpr;

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

export class DynamicListPriorTileLayer extends Tile3DLayer {
  color_ = undefined;

  static getInitialEts() {
    // 从 localStorage 获取选中的城市状态
    const cityStates = {};
    CITY_BLACKLIST.forEach((city) => {
      const savedState = localStorage.getItem(`cityBlacklist_${city}`);
      cityStates[city] = savedState === null ? true : savedState === 'true';
    });

    // 获取选中的城市的 ets
    const selectedCityEts = Object.keys(cityStates)
      .filter((city) => cityStates[city])
      .map((city) => getEtsForCity(city));

    // 获取用户组 ets
    const userGroupEts = getEtsForUserGroup(dynamicEventConPaneldata.userGroup);

    // 直接检查 localStorage 中的动态图层状态
    const roadNames = ['nmap-1-road', 'nmap-2-road', 'nmap-3-road'];
    const sdLinkNames = ['nmap-1-sdlink', 'nmap-2-sdlink', 'nmap-3-sdlink'];

    // 获取动态图层的 ets
    const roadEts = roadNames
      .filter((name) => localStorage.getItem(name) === 'true')
      .map((name) => getEtsForItem(name));

    const sdLinkEts = sdLinkNames
      .filter((name) => localStorage.getItem(name) === 'true')
      .map((name) => getEtsForItem(name));

    // 合并所有 ets
    const allEts = [...selectedCityEts, ...roadEts, ...sdLinkEts];

    console.log('allEts:', allEts);
    if (allEts.length > 0) {
      return allEts.map((ets) => `${ets},${userGroupEts},sdfsdf`).join('@');
    }

    return '';
  }

  constructor(show, showExpr, name, color, memoryUsage, spaceError) {
    let tileStyle = new Cesium3DTileStyle({
      color: `color("${color}")`,
      show: true,
    });

    // 使用静态方法获取初始化的 ets
    const initialEts = DynamicListPriorTileLayer.getInitialEts();

    let customUrl = `${GetPriorIssueWebServiceUrl()}/dlayer_op/visual/query_events_by_tile`;

    let tilesetOption = {
      url: `${baseMapHL}/dynamicMap/3dtile_uri_nds_bias/tileset.json`,
      shadows: false,
      maximumMemoryUsage: memoryUsage,
      maximumScreenSpaceError: spaceError,
      customUri: customUrl,
      queryParameters: {
        map_version: '',
        ets: initialEts,
      },
      jsonFormatFunc: dynamicJsonFormatFunc,
    };

    super(show, name, false, false, tileStyle, tilesetOption);
    this.color_ = color;
  }

  load3DTile(version, ets, showExpr) {
    let customUrl = `${GetPriorIssueWebServiceUrl()}/dlayer_op/visual/query_events_by_tile`;
    // let customUrl = 'http://10.110.17.32:8080/dlayer_op/visual/query_events_by_tile';
    if (customUrl) {
      Object.assign(this.tileOption, {
        customUri: customUrl,
      });
    }

    console.log('ets:', ets);

    this.tileOption['queryParameters'] = {
      map_version: version.toString(),
      ets,
    };

    //要对dataSource的show进行处理。否则都不显示时也会请求数据
    if (showExpr === false) {
      this.dataSource.show = false;
    } else {
      this.dataSource.show = true;
    }

    this.tileStyle.show = showExpr;

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
