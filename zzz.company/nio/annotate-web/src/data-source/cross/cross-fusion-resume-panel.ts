import {reactive, ref} from 'vue';
import axios from 'axios';
import {NioMessage} from '../../utils/utils.js';
import {renderPrimitiveManager} from '../../model/render-primitive.js';
import {NioFeature, dataManager, generateFeatureId} from '../../model/feature.js';
import {getFusionLayerOption, fusionLayerColor} from '../../system/tileset-manager.js';
import {actionParamMap, RegisterFunc, panelNames} from '../../system/view-restore.js';
import {watch} from 'vue';

export const cameraPos = ref(0);
export let fusionLayerLoading = ref<number>(0);

export const crossFusionResumeVisible = ref(false);

watch(crossFusionResumeVisible, (newVal) => {
  if (newVal === false) {
    actionParamMap.set(panelNames.sCrossFusionResume, []);
    actionParamMap.set(panelNames.cCrossFusionResume, []);
  }
});

export interface FusionCrossResumeRecord {
  id: number;
  crossId: any;
  createTime: string;
  algVsn: string;
  text: string;
  productName: string;
  branchName: string;
  meshList: string[];

  showProductData: boolean;
  productLoading: boolean;

  showMeshData: boolean;
  meshDataLoading: boolean;

  productIds: number[];
  meshProductIds: number[];
}

export const crossFusionResumePanel = reactive<{
  left: number;
  top: number;
  list: FusionCrossResumeRecord[];
  loading: boolean;
}>({
  left: -1,
  top: -1,
  list: [],
  loading: false,
});

export async function loadFusionProductData(item: FusionCrossResumeRecord, isMesh: boolean) {
  let fusionLayers = getFusionLayerOption();
  try {
    if (isMesh) {
      item.meshDataLoading = true;
    } else {
      item.productLoading = true;
    }

    fusionLayerLoading.value++;
    //@ts-ignore
    let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getGeoJson', {
      productName: item.productName,
      crossId: isMesh ? undefined : item.crossId.id, //这里crossId是对象
      meshList: item.meshList,
      branchName: item.branchName,
      mappingResultType: 'MERGE',
      layerType: fusionLayers,
    });

    if (response.data.code != 200) {
      throw 'getGeoJson failed';
    }

    if (isMesh) {
      item.meshProductIds = [];
    } else {
      item.productIds = [];
    }

    for (let record of response.data.data) {
      let layerType = record.layerType;
      let featureId = generateFeatureId();

      //去除高程
      for (let feature of record.features) {
        if (feature.geometry.type == 'Point' && feature.geometry.coordinates.length == 3) {
          feature.geometry.coordinates[2] = 0.0;
        } else if (feature.geometry.type == 'LineString') {
          for (let coordinate of feature.geometry.coordinates) {
            if (coordinate.length == 3) {
              coordinate[2] = 0.0; //去除高程
            }
          }
        } else if (feature.geometry.type == 'Polygon') {
          for (let ring of feature.geometry.coordinates) {
            for (let coordinate of ring) {
              if (coordinate.length == 3) {
                coordinate[2] = 0.0; //去除高程
              }
            }
          }
        }
      }

      renderPrimitiveManager.addComponentPrimitive(featureId, record, fusionLayerColor[layerType]);

      // for (let jsonFeature of record.features) {
      //   let feature = NioFeature.fromGeojson('fusionLayer', jsonFeature);
      //   dataManager.addFeature(feature);
      //   renderPrimitiveManager.addCommonPrimitive(feature, {color: fusionLayerColor[layerType]});
      if (isMesh) {
        item.meshProductIds.push(featureId);
      } else {
        item.productIds.push(featureId);
      }
      // }
    }
  } catch (error) {
    console.log(error);
    NioMessage('error', error);
  } finally {
    if (isMesh) {
      item.meshDataLoading = false;
    } else {
      item.productLoading = false;
    }
    fusionLayerLoading.value--;
  }
}

RegisterFunc(showProductData);
export async function showProductData(itemId: number) {
  let item: FusionCrossResumeRecord | undefined;
  for (let record of crossFusionResumePanel.list) {
    if (record.id == itemId) {
      item = record;
      break;
    }
  }

  if (!item) {
    return;
  }
  if (item.productLoading) {
    return;
  }

  let inferLayers = getFusionLayerOption();
  if (inferLayers.length == 0) {
    NioMessage('warning', '请在图层管理中开启推理数据对应图层', 2000);
    return;
  }

  item.showProductData = !item.showProductData;
  if (item.showProductData) {
    await loadFusionProductData(item, false);
  } else {
    for (let productId of item.productIds) {
      renderPrimitiveManager.removePrimitive(productId);
    }

    item.productIds = [];
  }
}

RegisterFunc(showMeshProductData);
export async function showMeshProductData(itemId: number) {
  let item: FusionCrossResumeRecord | undefined;
  for (let record of crossFusionResumePanel.list) {
    if (record.id == itemId) {
      item = record;
      break;
    }
  }
  if (!item) {
    return;
  }
  if (item.meshDataLoading) {
    return;
  }

  let inferLayers = getFusionLayerOption();
  if (inferLayers.length == 0) {
    NioMessage('warning', '请在图层管理中开启推理数据对应图层', 2000);
    return;
  }

  item.showMeshData = !item.showMeshData;
  if (item.showMeshData) {
    await loadFusionProductData(item, true);
  } else {
    for (let productId of item.meshProductIds) {
      renderPrimitiveManager.removePrimitive(productId);
    }

    item.meshProductIds = [];
  }
}

RegisterFunc(refreshFusionResumePanel);
export async function refreshFusionResumePanel(id: any) {
  actionParamMap.set(panelNames.sCrossFusionResume, [[refreshFusionResumePanel.name, [id]]]);

  //履历更新了，轨迹要清空
  crossFusionResumeVisible.value = true;
  crossFusionResumePanel.loading = true;
  crossFusionResumePanel.list.splice(0);
  try {
    //@ts-ignore
    let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getCrossSnapshot', {
      crossId: id.id,
      mappingResultType: 'MERGE',
      projectId: id.projectId,
    });

    if (response.data.code != 200) {
      NioMessage('error', '履历加载失败', 2000);
      return false;
    }

    crossFusionResumePanel.list = response.data.data.map((record) => {
      return {
        id: record.id,
        crossId: id,
        createTime: record.createTime,
        algVsn: record.algVsn,
        productName: record.productName,
        branchName: record.branchName,
        meshList: record.meshList,
        text:
          '产品库 = ' +
          record.productName +
          ', 产品库分支 = ' +
          record.branchName +
          ', tile号 = ' +
          record.meshList +
          ', 融合批次名称 = ' +
          record.mergeVersion +
          ', 融合任务ID = ' +
          record.mergeTaskId +
          ', 变化源ID = ' +
          record.sourceId,

        showProductData: false,
        productLoading: false,

        showMeshData: false,
        meshDataLoading: false,

        productIds: [],
        meshProductIds: [],
      };
    });
  } catch (error) {
    console.error(error);
  } finally {
    crossFusionResumePanel.loading = false;
  }

  return true;
}

export function closeFusionResumePanel() {
  crossFusionResumeVisible.value = false;

  for (let record of crossFusionResumePanel.list) {
    for (let id of record.productIds) {
      renderPrimitiveManager.removePrimitive(id);
    }

    record.productIds = [];

    for (let id of record.meshProductIds) {
      renderPrimitiveManager.removePrimitive(id);
    }

    record.meshProductIds = [];
  }
}

export function createActionParamCrossFusionResume() {
  for (let item of crossFusionResumePanel.list) {
    if (item.showProductData) {
      actionParamMap.get(panelNames.cCrossFusionResume).push([showProductData.name, [item.id]]);
    }

    if (item.showMeshData) {
      actionParamMap.get(panelNames.cCrossFusionResume).push([showMeshProductData.name, [item.id]]);
    }
  }
}
