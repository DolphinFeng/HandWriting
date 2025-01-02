import {reactive, ref} from 'vue';
import axios from 'axios';
import {NioMessage} from '../../utils/utils.js';
import {BevModel} from '../../model/bev-model.ts';
import {ENUToGeodetic, UV2ENU} from '../../utils/coordinate-transform.js';
import {RegisterFunc, actionParamMap, panelNames} from '../../system/view-restore.ts';
import {watch} from 'vue';

export const cameraPos = ref(0);

export const crossModelResumeVisible = ref(false);

watch(crossModelResumeVisible, (newVal) => {
  if (newVal === false) {
    actionParamMap.set(panelNames.sCrossModelResume, []);
    actionParamMap.set(panelNames.cCrossModelResume, []);
  }
});

export let crossModelBevModel = new BevModel();

export interface ModelCrossResumeRecord {
  id: number;
  createTime: string;
  algVsn: string;
  text: string;
  datasetClip: string;
  datasetName: string;
  showBev: boolean;
  showModel: boolean;
}

export const crossModelResumePanel = reactive<{
  left: number;
  top: number;
  list: ModelCrossResumeRecord[];
  loading: boolean;
}>({
  left: -1,
  top: -1,
  list: [],
  loading: false,
});

RegisterFunc(showModelPic);
export async function showModelPic(itemId: number) {
  crossModelBevModel.clear();

  let item: ModelCrossResumeRecord | undefined;
  for (let record of crossModelResumePanel.list) {
    if (itemId == record.id) {
      item = record;
      item.showModel = !item.showModel;
    } else {
      record.showModel = false;
    }

    record.showBev = false;
  }

  if (!item) {
    return;
  }

  if (item.showModel) {
    try {
      crossModelResumePanel.loading = true;
      //@ts-ignore
      let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getCrossResource', {
        datasetClip: item.datasetClip,
        datasetName: item.datasetName,
        mappingResultType: 'MODEL',
      });

      if (response.data.code != 200) {
        throw 'failed';
      }

      let posEnvInfo = response.data.data.modelPoseInfo;
      if (posEnvInfo == null || response.data.data.modelUrl == null) {
        item.showModel = false;
        NioMessage('warning', '路口暂无该数据，请核实或刷库后重试', 2000);
        return;
      }

      let enu: any = [];
      enu.push(UV2ENU(0, 0, posEnvInfo.offsetX, posEnvInfo.offsetY, posEnvInfo.scaleX, posEnvInfo.scaleY));
      enu.push(
        UV2ENU(0, posEnvInfo.height, posEnvInfo.offsetX, posEnvInfo.offsetY, posEnvInfo.scaleX, posEnvInfo.scaleY),
      );
      enu.push(
        UV2ENU(
          posEnvInfo.width,
          posEnvInfo.height,
          posEnvInfo.offsetX,
          posEnvInfo.offsetY,
          posEnvInfo.scaleX,
          posEnvInfo.scaleY,
        ),
      );
      enu.push(
        UV2ENU(posEnvInfo.width, 0, posEnvInfo.offsetX, posEnvInfo.offsetY, posEnvInfo.scaleX, posEnvInfo.scaleY),
      );

      let geodetic0 = ENUToGeodetic(
        enu[0].east,
        enu[0].north,
        0.0,
        posEnvInfo.refLon,
        posEnvInfo.refLat,
        posEnvInfo.refHeight,
      );
      let geodetic1 = ENUToGeodetic(
        enu[1].east,
        enu[1].north,
        0.0,
        posEnvInfo.refLon,
        posEnvInfo.refLat,
        posEnvInfo.refHeight,
      );
      let geodetic2 = ENUToGeodetic(
        enu[2].east,
        enu[2].north,
        0.0,
        posEnvInfo.refLon,
        posEnvInfo.refLat,
        posEnvInfo.refHeight,
      );
      let geodetic3 = ENUToGeodetic(
        enu[3].east,
        enu[3].north,
        0.0,
        posEnvInfo.refLon,
        posEnvInfo.refLat,
        posEnvInfo.refHeight,
      );

      let param: any = {};
      param.width = posEnvInfo.width;
      param.height = posEnvInfo.height;
      param.rangePoints = [];
      param.rangePoints.push(geodetic0);
      param.rangePoints.push(geodetic1);
      param.rangePoints.push(geodetic2);
      param.rangePoints.push(geodetic3);
      param.img = response.data.data.modelUrl;

      crossModelBevModel.refresh(param, item.showModel);
    } catch (error) {
      console.log(error);
      NioMessage('error', error);
    } finally {
      crossModelResumePanel.loading = false;
    }
  }
}

RegisterFunc(showBevPic);
export async function showBevPic(itemId: number) {
  crossModelBevModel.clear();
  let item: ModelCrossResumeRecord | undefined;
  for (let record of crossModelResumePanel.list) {
    if (itemId == record.id) {
      item = record;
      item.showBev = !item.showBev;
    } else {
      record.showBev = false;
    }

    record.showModel = false;
  }

  if (!item) {
    return;
  }
  if (item.showBev) {
    try {
      crossModelResumePanel.loading = true;
      //@ts-ignore
      let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getCrossResource', {
        datasetClip: item.datasetClip,
        datasetName: item.datasetName,
        mappingResultType: 'MODEL',
      });

      if (response.data.code != 200) {
        throw 'failed';
      }

      let posEnvInfo = response.data.data.bevPoseInfo;
      if (posEnvInfo == null || response.data.data.bevUrl == null) {
        item.showBev = false;
        NioMessage('warning', '路口暂无该数据，请核实或刷库后重试', 2000);
        return;
      }

      let enu: any = [];
      enu.push(UV2ENU(0, 0, posEnvInfo.offsetX, posEnvInfo.offsetY, posEnvInfo.scaleX, posEnvInfo.scaleY));
      enu.push(
        UV2ENU(0, posEnvInfo.height, posEnvInfo.offsetX, posEnvInfo.offsetY, posEnvInfo.scaleX, posEnvInfo.scaleY),
      );
      enu.push(
        UV2ENU(
          posEnvInfo.width,
          posEnvInfo.height,
          posEnvInfo.offsetX,
          posEnvInfo.offsetY,
          posEnvInfo.scaleX,
          posEnvInfo.scaleY,
        ),
      );
      enu.push(
        UV2ENU(posEnvInfo.width, 0, posEnvInfo.offsetX, posEnvInfo.offsetY, posEnvInfo.scaleX, posEnvInfo.scaleY),
      );

      let geodetic0 = ENUToGeodetic(
        enu[0].east,
        enu[0].north,
        0.0,
        posEnvInfo.refLon,
        posEnvInfo.refLat,
        posEnvInfo.refHeight,
      );
      let geodetic1 = ENUToGeodetic(
        enu[1].east,
        enu[1].north,
        0.0,
        posEnvInfo.refLon,
        posEnvInfo.refLat,
        posEnvInfo.refHeight,
      );
      let geodetic2 = ENUToGeodetic(
        enu[2].east,
        enu[2].north,
        0.0,
        posEnvInfo.refLon,
        posEnvInfo.refLat,
        posEnvInfo.refHeight,
      );
      let geodetic3 = ENUToGeodetic(
        enu[3].east,
        enu[3].north,
        0.0,
        posEnvInfo.refLon,
        posEnvInfo.refLat,
        posEnvInfo.refHeight,
      );

      let param: any = {};
      param.width = posEnvInfo.width;
      param.height = posEnvInfo.height;
      param.rangePoints = [];
      param.rangePoints.push(geodetic0);
      param.rangePoints.push(geodetic1);
      param.rangePoints.push(geodetic2);
      param.rangePoints.push(geodetic3);
      param.img = response.data.data.bevUrl;

      crossModelBevModel.refresh(param, item.showBev);
    } catch (error) {
      console.log(error);
      NioMessage('error', error);
    } finally {
      crossModelResumePanel.loading = false;
    }
  }
}

RegisterFunc(refreshModelResumePanel);
export async function refreshModelResumePanel(id: any) {
  //对象
  actionParamMap.set(panelNames.sCrossModelResume, [[refreshModelResumePanel.name, [id]]]);

  //履历更新了，轨迹要清空
  crossModelResumeVisible.value = true;
  crossModelResumePanel.loading = true;
  crossModelResumePanel.list.splice(0);
  try {
    //@ts-ignore
    let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getCrossSnapshot', {
      crossId: id.id,
      mappingResultType: 'MODEL',
      projectId: id.projectId,
    });

    if (response.data.code != 200) {
      NioMessage('error', '履历加载失败', 2000);
      return false;
    }

    crossModelResumePanel.list = response.data.data.map((record) => {
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
          record.mappingTaskId,
      };
    });
  } catch (error) {
    console.error(error);
  } finally {
    crossModelResumePanel.loading = false;
  }

  return true;
}

export function closeModelResumePanel() {
  crossModelBevModel.clear();
  crossModelResumeVisible.value = false;
}

export function createActionParamCrossModelResume() {
  for (let item of crossModelResumePanel.list) {
    if (item.showBev) {
      actionParamMap.get(panelNames.cCrossModelResume).push([showBevPic.name, [item.id]]);
    }

    if (item.showModel) {
      actionParamMap.get(panelNames.cCrossModelResume).push([showModelPic.name, [item.id]]);
    }
  }
}
