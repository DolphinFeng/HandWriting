import {reactive, ref, onMounted} from 'vue';

export enum DYNAMIC_MAP_ENV {
  PROD = 'Prod',
  STG = 'Stg',
}

// 首先定义用户组的接口类型
interface UserGroup {
  id: number;
  vehicle_tag: string | null;
  name: string;
  vehicle_num: number;
  // ... 其他字段可以根据需要添加
}

// 移除原来写死的 USER_GROUP_LIST
// 改用 ref 来存储动态获取的用户组列表
export const userGroupList = ref<UserGroup[]>([]);

export const CITY_BLACKLIST = [
  '左转高风险', 
  '直行中风险', 
  '低风险环岛',
  '高风险环岛', 
  '低风险路口', 
  '中风险路口',
  '单点高风险路口', 
  '城区低风险', 
  '城区中风险',
  '闯红绿灯路口事件',
  '高快merge汇入事件',
  '高快风险匝道事件',
  '高快新旧车道线事件',
  '高快导航下匝道事件',
  '检查站事件'
]; 

export const DYNAMIC_ENV_LIST = [DYNAMIC_MAP_ENV.PROD, DYNAMIC_MAP_ENV.STG];

export type PanelType = 'lane' | 'road';

export const PANEL_TYPE = {
  LANE: 'lane' as PanelType,
  ROAD: 'road' as PanelType
};

export const dynamicEventConPaneldata = reactive({
  visible: false,
  env: DYNAMIC_MAP_ENV.PROD,
  userGroup: '默认组-NIO',
  panelType: PANEL_TYPE.ROAD as PanelType
});

const vehicleTagMap = ref<Record<string, string>>({});

export const DOMAIN_MAP_PRIOR = {
  'nmap-web-editor.idc-uat.nioint.com': {
    [DYNAMIC_MAP_ENV.PROD]: 'http://prior-issue-web-service.map-tencent-prod.nioint.com',
    [DYNAMIC_MAP_ENV.STG]: 'http://prior-issue-web-service.map-tencent-stg.nioint.com'
  },
  'nmap-web-editor.idc-prod.nioint.com': {
    [DYNAMIC_MAP_ENV.PROD]: 'http://prior-issue-web-service.map-tencent-prod.nioint.com',
    [DYNAMIC_MAP_ENV.STG]: 'http://prior-issue-web-service.map-tencent-stg.nioint.com'
  },
  'localhost': {
    [DYNAMIC_MAP_ENV.PROD]: 'http://prior-issue-web-service.map-tencent-prod.nioint.com',
    [DYNAMIC_MAP_ENV.STG]: 'http://prior-issue-web-service.map-tencent-stg.nioint.com'
  }
};

function GetPriorIssueWebServiceUrl(env: DYNAMIC_MAP_ENV) {
  const hostname = window.location.hostname;
  const envUrls = DOMAIN_MAP_PRIOR[hostname];
  return envUrls ? envUrls[env] : envUrls?.[DYNAMIC_MAP_ENV.STG];
}

export const fetchVehicleTags = async () => {
  const env = dynamicEventConPaneldata.env;
  const baseUrl = GetPriorIssueWebServiceUrl(env);
  
  console.log('当前环境:', env);
  console.log('基础 URL:', baseUrl);
  
  if (!baseUrl) {
    console.error('获取环境基础 URL 失败:', env);
    return;
  }

  try {
    const url = `${baseUrl}/dlayer/prior_events/vid_group_config/list`;
    console.log('请求 URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ need_vehicle_num: true }),
    });
    
    const data = await response.json();
    if (data.code === 0) {
      userGroupList.value = data.data.result;
      vehicleTagMap.value = {};
      data.data.result.forEach((item: UserGroup) => {
        if (item.vehicle_tag) {
          vehicleTagMap.value[item.name] = item.vehicle_tag;
        }
      });

      if (!dynamicEventConPaneldata.userGroup && userGroupList.value.length > 0) {
        dynamicEventConPaneldata.userGroup = userGroupList.value[0].name;
      }
    }
  } catch (error) {
    console.error('获取用户组数据失败:', error);
  }
};

export function getEtsForCity(city: string): string {
  switch (city) {
    case '左转高风险':
      return '1002';
    case '直行中风险':
      return '1003';
    case '低风险环岛':
      return '2104';
    case '高风险环岛':
      return '2105';
    case '低风险路口':
      return '2106';
    case '中风险路口':
      return '2107';
    case '单点高风险路口':
      return '2108';
    case '城区低风险':
      return '2109';
    case '城区中风险':
      return '2110';
    case '闯红绿灯路口事件':
      return '2101';
    case '高快merge汇入事件':
      return '2111';
    case '高快风险匝道事件':
      return '2112';
    case '高快新旧车道线事件':
      return '2201';
    case '高快导航下匝道事件':
      return '2131';
    case '检查站事件':
      return '2204';
    default:
      return '';
  }
}

export function getEtsForUserGroup(userGroup: string): string {
  const group = userGroupList.value.find(g => g.name === userGroup);
  if (group?.vehicle_tag) {
    return group.vehicle_tag;
  }
  
  // 保留默认组的处理逻辑
  const defaultMapping: Record<string, string> = {
    '默认组-NIO': '0',
    '默认组-ONVO': '0'
  };
  
  return defaultMapping[userGroup] || '';
}

export function combineEts(itemEts: string[], cityEts: string[], userGroupEts: string): string {
  const allEts = [...new Set([...itemEts, ...cityEts])]; // Combine and deduplicate ETSs
  if (allEts.length === 0) return '';
  
  return allEts
    .map(ets => `${ets},${userGroupEts},sdfsdf`)
    .join('@');
}

export function getEtsForItem(name: string): string {
  if (name.startsWith('nmap-1')) {
    return '0';
  } else if (name.startsWith('nmap-2')) {
    return '7304';
  } else if (name.startsWith('nmap-3')) {
    return '1002';
  }
  return '';
}

export const cityBlacklistOptions = ref<Record<string, boolean>>(
  CITY_BLACKLIST.reduce((acc, city) => {
    acc[city] = true;
    return acc;
  }, {})
);