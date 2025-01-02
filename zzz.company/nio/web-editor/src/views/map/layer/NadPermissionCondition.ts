import {reactive, ref} from 'vue';
import {Cesium3DTileStyle} from 'cesium';
import {nadLayer} from '../../../system/layer/tileLayer/tileLayerController.js';
import { wheelCallback } from '../../../event/mouse.js';
import {NioNotification} from '../../../utils/utils.js';
import store from '../../../store/index.js';

// 添加环境枚举
export enum NAD_MAP_ENV {
  PROD = 'Prod',
  STG = 'Stg',
}

export const NAD_ENV_LIST = [NAD_MAP_ENV.PROD, NAD_MAP_ENV.STG];

// 界面参数
export const nadPermissionName = 'NAD白名单';
export const nadPermissionLayerVisible = ref(localStorage.getItem(nadPermissionName) === 'true');

// 在文件顶部添加接口定义
interface UserGroup {
  id: number;
  name: string;
  vehicle_tag: string | null;
  vehicle_num: number;
}

// 修改 userGroupList 的定义
export const userGroupList = ref<UserGroup[]>([]);

export const permissionNadConPaneldata = reactive<{
  visible: boolean;
  env: NAD_MAP_ENV;
  userGroup: string;
  items: {
    value: number;
    label: string;
    active: boolean
  }[];
}>({
  visible: false,
  env: NAD_MAP_ENV.PROD,
  userGroup: '',
  items: [
    {
      value: 591,
      label: '高快HD',
      active: true,
    },
    {
      value: 2902,
      label: '高快SD',
      active: true,
    },
    {
      value: 0,
      label: '城区HD',
      active: true,
    },
    {
      value: 1001,
      label: '城区SD',
      active: true,
    }
  ],
});

// 添加获取用户组数据的函数
export async function fetchVehicleTags() {
  try {
    const baseUrl = permissionNadConPaneldata.env === NAD_MAP_ENV.PROD 
      ? 'http://prior-issue-web-service.map-tencent-prod.nioint.com'
      : 'http://prior-issue-web-service.map-tencent-stg.nioint.com';
      
    const response = await fetch(`${baseUrl}/dlayer/prior_events/vid_group_config/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ need_vehicle_num: true }),
    });
    
    const data = await response.json();
    if (data.code === 0) {
      userGroupList.value = data.data.result;
    }
  } catch (error) {
    console.error('获取用户组数据失败:', error);
  }
}

export function setNadVisibleHandler(visible: boolean){
  nadLayer.show = visible;
  nadPermissionLayerVisible.value = nadLayer.show;

  localStorage.setItem(nadPermissionName, nadLayer.show.toString());

  const tileset = nadLayer.dataSource.get(0);
  const expr = nadLayer.show;

  tileset.style = new Cesium3DTileStyle({
    show: expr,
    color: `color("${nadLayer.color_}")`,
  });

  //强制调用一下，用来刷新线宽
  wheelCallback();
}

export function getNadPermissionTypeString(){
  let typeString = '';
  for(let item of permissionNadConPaneldata.items){
    if(item.active){
      typeString += item.value + ',';
    }
  }

  if(typeString.length != 0){
    typeString = typeString.slice(0, -1);
  }

  return typeString;
}

export function setPermissionNadCondition(){
  try {
    //如果全选了，则不设置参数。对两种选项的情况是有效的。如果后期添加第三个选项，且选中两个的时候传什么参数需要跟后端拉齐
    nadLayer.load3DTile(store.state.version.curVersion, getNadPermissionTypeString());
    wheelCallback();
  } catch (ex) {
    NioNotification('error', ``, ex.message);
  }
}

