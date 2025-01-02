import {reactive, ref} from 'vue';
import axios from 'axios';
import {NioMessage} from '../../utils/utils.js';
import {BevModel} from '../../model/bev-model.ts';
import {renderPrimitiveManager} from '../../model/render-primitive.js';
import {NioFeature, dataManager, generateFeatureId} from '../../model/feature.js';
import {getInferLayerOption, inferLayerColor} from '../../system/tileset-manager.js';
import {actionParamMap, RegisterFunc, panelNames} from '../../system/view-restore.ts';
import {watch} from 'vue';

export const cameraPos = ref(0);
export let inferLayerLoading = ref<number>(0);

export const crossInferResumeVisible = ref(false);
export let crossInferBevModel = new BevModel();

watch(crossInferResumeVisible, (newVal) => {
  if (newVal === false) {
    actionParamMap.set(panelNames.sCrossInferResume, []);
    actionParamMap.set(panelNames.cCrossInferResume, []);
  }
});

export interface InferCrossResumeRecord {
  id: number;
  createTime: string;
  algVsn: string;
  text: string;
  datasetClip: string;
  datasetName: string;

  showOrigin: boolean;
  showTraj: boolean;
  showResult: boolean;
  showProduct: boolean;
  productLoading: boolean;
  productIds: number[];
}

export const crossInferResumePanel = reactive<{
  left: number;
  top: number;
  list: InferCrossResumeRecord[];
  loading: boolean;
}>({
  left: -1,
  top: -1,
  list: [],
  loading: false,
});

RegisterFunc(showOriginPic);
export async function showOriginPic(itemId: number) {
  crossInferBevModel.clear();

  let item: InferCrossResumeRecord | undefined;
  for (let record of crossInferResumePanel.list) {
    if (itemId == record.id) {
      item = record;
      item.showOrigin = !item.showOrigin;
    } else {
      record.showOrigin = false;
    }

    record.showResult = false;
    record.showTraj = false;
  }

  if (!item) {
    return;
  }
  if (item.showOrigin) {
    try {
      crossInferResumePanel.loading = true;
      //@ts-ignore
      let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getCrossResource', {
        datasetClip: item.datasetClip,
        datasetName: item.datasetName,
        mappingResultType: 'INFERENCE',
      });

      if (response.data.code != 200) {
        throw 'failed';
      }

      let posEnvInfo = response.data.data.inferenceOriginalPoseInfo;
      if (posEnvInfo == null || response.data.data.inferenceOriginalUrl == null) {
        item.showOrigin = false;
        NioMessage('warning', '路口暂无该数据，请核实或刷库后重试', 2000);
        return;
      }

      let param: any = {};
      param.width = posEnvInfo.width;
      param.height = posEnvInfo.height;
      param.rangePoints = [];
      param.rangePoints.push({lon: posEnvInfo.LeftBottom[0], lat: posEnvInfo.LeftBottom[1]});
      param.rangePoints.push({lon: posEnvInfo.RightBottom[0], lat: posEnvInfo.RightBottom[1]});
      param.rangePoints.push({lon: posEnvInfo.RightTop[0], lat: posEnvInfo.RightTop[1]});
      param.rangePoints.push({lon: posEnvInfo.LeftTop[0], lat: posEnvInfo.LeftTop[1]});

      param.img = response.data.data.inferenceOriginalUrl;

      if (param.img == '') {
        NioMessage('success', '没有模型图片');
        //item.showOrigin = false;
        return;
      }

      crossInferBevModel.refresh(param, item.showOrigin);
    } catch (error) {
      console.log(error);
      NioMessage('error', error);
    } finally {
      crossInferResumePanel.loading = false;
    }
  }
}

RegisterFunc(showTrajPic);
export async function showTrajPic(itemId: number) {
  crossInferBevModel.clear();

  let item: InferCrossResumeRecord | undefined;
  for (let record of crossInferResumePanel.list) {
    if (itemId == record.id) {
      item = record;
      item.showTraj = !item.showTraj;
    } else {
      record.showTraj = false;
    }

    record.showResult = false;
    record.showOrigin = false;
  }

  if (!item) {
    return;
  }
  if (item.showTraj) {
    try {
      crossInferResumePanel.loading = true;
      //@ts-ignore
      let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getCrossResource', {
        datasetClip: item.datasetClip,
        datasetName: item.datasetName,
        mappingResultType: 'INFERENCE',
      });

      if (response.data.code != 200) {
        throw 'failed';
      }

      let posEnvInfo = response.data.data.inferenceTrajectoryPoseInfo;
      if (posEnvInfo == null || response.data.data.inferenceTrajectoryUrl == null) {
        item.showTraj = false;
        NioMessage('warning', '路口暂无该数据，请核实或刷库后重试', 2000);
        return;
      }

      let param: any = {};
      param.width = posEnvInfo.width;
      param.height = posEnvInfo.height;
      param.rangePoints = [];
      param.rangePoints.push({lon: posEnvInfo.LeftBottom[0], lat: posEnvInfo.LeftBottom[1]});
      param.rangePoints.push({lon: posEnvInfo.RightBottom[0], lat: posEnvInfo.RightBottom[1]});
      param.rangePoints.push({lon: posEnvInfo.RightTop[0], lat: posEnvInfo.RightTop[1]});
      param.rangePoints.push({lon: posEnvInfo.LeftTop[0], lat: posEnvInfo.LeftTop[1]});

      param.img = response.data.data.inferenceTrajectoryUrl;

      if (param.img == '') {
        NioMessage('success', '没有模型图片');
        //item.showOrigin = false;
        return;
      }

      crossInferBevModel.refresh(param, item.showTraj);
    } catch (error) {
      console.log(error);
      NioMessage('error', error);
    } finally {
      crossInferResumePanel.loading = false;
    }
  }
}

RegisterFunc(showResultPic);
export async function showResultPic(itemId: number) {
  crossInferBevModel.clear();

  let item: InferCrossResumeRecord | undefined;
  for (let record of crossInferResumePanel.list) {
    if (itemId == record.id) {
      item = record;
      item.showResult = !item.showResult;
    } else {
      record.showResult = false;
    }

    record.showTraj = false;
    record.showOrigin = false;
  }

  if (!item) {
    return;
  }
  if (item.showResult) {
    try {
      crossInferResumePanel.loading = true;
      //@ts-ignore
      let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getCrossResource', {
        datasetClip: item.datasetClip,
        datasetName: item.datasetName,
        mappingResultType: 'INFERENCE',
      });

      if (response.data.code != 200) {
        throw 'failed';
      }
      let posEnvInfo = response.data.data.inferenceResultPoseInfo;
      if (posEnvInfo == null || response.data.data.inferenceResultUrl == null) {
        item.showResult = false;
        NioMessage('warning', '路口暂无该数据，请核实或刷库后重试', 2000);
        return;
      }

      let param: any = {};
      param.width = posEnvInfo.width;
      param.height = posEnvInfo.height;
      param.rangePoints = [];
      param.rangePoints.push({lon: posEnvInfo.LeftBottom[0], lat: posEnvInfo.LeftBottom[1]});
      param.rangePoints.push({lon: posEnvInfo.RightBottom[0], lat: posEnvInfo.RightBottom[1]});
      param.rangePoints.push({lon: posEnvInfo.RightTop[0], lat: posEnvInfo.RightTop[1]});
      param.rangePoints.push({lon: posEnvInfo.LeftTop[0], lat: posEnvInfo.LeftTop[1]});

      param.img = response.data.data.inferenceResultUrl;

      if (param.img == '') {
        NioMessage('success', '没有模型图片');
        //item.showOrigin = false;
        return;
      }

      crossInferBevModel.refresh(param, item.showResult);
    } catch (error) {
      console.log(error);
      NioMessage('error', error);
    } finally {
      crossInferResumePanel.loading = false;
    }
  }
}

export async function loadProductData(item: InferCrossResumeRecord) {
  let inferLayers = getInferLayerOption();

  try {
    item.productLoading = true;
    inferLayerLoading.value++;
    //@ts-ignore
    let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getGeoJson', {
      datasetClip: item.datasetClip,
      datasetName: item.datasetName,
      layerType: inferLayers,
    });

    if (response.data.code != 200) {
      throw 'getGeoJson failed';
    }

    item.productIds = [];
    for (let record of response.data.data) {
      let layerType = record.layerType;
      let featureId = generateFeatureId();

      //后端返回的点数据格式不对，修改一下，同时去掉高程
      for (let feature of record.features) {
        if (feature.geometry.type == 'Point') {
          let lon = feature.geometry.coordinates[0][0];
          let lat = feature.geometry.coordinates[1][0];
          feature.geometry.coordinates = [lon, lat];
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

      renderPrimitiveManager.addComponentPrimitive(featureId, record, inferLayerColor[layerType]);
      item.productIds.push(featureId);
    }
  } catch (error) {
    console.log(error);
    NioMessage('error', error);
  } finally {
    item.productLoading = false;
    inferLayerLoading.value--;
  }
}

RegisterFunc(showInferProductData);
export async function showInferProductData(itemId: number) {
  let item: InferCrossResumeRecord | undefined;
  for (let record of crossInferResumePanel.list) {
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

  let inferLayers = getInferLayerOption();
  if (inferLayers.length == 0) {
    NioMessage('warning', '请在图层管理中开启推理数据对应图层', 2000);
    return;
  }

  item.showProduct = !item.showProduct;
  if (item.showProduct) {
    await loadProductData(item);
  } else {
    for (let productId of item.productIds) {
      renderPrimitiveManager.removePrimitive(productId);
    }

    item.productIds = [];
  }
}

RegisterFunc(refreshInferResumePanel);
export async function refreshInferResumePanel(id: any) {
  actionParamMap.set(panelNames.sCrossInferResume, [[refreshInferResumePanel.name, [id]]]);

  //履历更新了，轨迹要清空
  crossInferResumeVisible.value = true;
  crossInferResumePanel.loading = true;
  crossInferResumePanel.list.splice(0);
  try {
    //@ts-ignore
    let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getCrossSnapshot', {
      crossId: id.id,
      mappingResultType: 'INFERENCE',
      projectId: id.projectId,
    });

    if (response.data.code != 200) {
      NioMessage('error', '履历加载失败', 2000);
      return false;
    }

    crossInferResumePanel.list = response.data.data.map((record) => {
      return {
        id: record.id,
        createTime: record.createTime,
        algVsn: record.algVsn,
        datasetClip: record.datasetClip,
        datasetName: record.datasetName,
        text:
          '项目名称 = ' +
          record.projectName +
          ', 批次号 = ' +
          record.projectId +
          ', 路径数量 = ' +
          record.routeNum +
          ', 任务ID = ' +
          record.mappingTaskId +
          ', cosKey = ' +
          record.cosKey +
          ', 变化源ID = ' +
          record.sourceId,

        showOrigin: false,
        showTraj: false,
        showResult: false,
        showProduct: false,
        productLoading: false,
        productIds: [],
      };
    });
  } catch (error) {
    console.error(error);
  } finally {
    crossInferResumePanel.loading = false;
  }

  return true;
}

export function closeInferResumePanel() {
  crossInferBevModel.clear();
  crossInferResumeVisible.value = false;
  for (let record of crossInferResumePanel.list) {
    for (let id of record.productIds) {
      renderPrimitiveManager.removePrimitive(id);
    }

    record.productIds = [];
  }
}

export function createActionParamCrossInferResume() {
  for (let item of crossInferResumePanel.list) {
    if (item.showOrigin) {
      actionParamMap.get(panelNames.cCrossInferResume).push([showOriginPic.name, [item.id]]);
    }

    if (item.showProduct) {
      actionParamMap.get(panelNames.cCrossInferResume).push([showInferProductData.name, [item.id]]);
    }

    if (item.showResult) {
      actionParamMap.get(panelNames.cCrossInferResume).push([showResultPic.name, [item.id]]);
    }

    if (item.showTraj) {
      actionParamMap.get(panelNames.cCrossInferResume).push([showTrajPic.name, [item.id]]);
    }
  }
}
