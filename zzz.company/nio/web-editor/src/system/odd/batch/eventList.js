import {reactive} from 'vue';
import axios from 'axios';
import {DynamicInfo} from '../enum/EventType.js';
import {OddSource} from '../enum/OddSource.js';
import {NioNotification} from '../../../utils/utils.js';
import {requestOddBranchName} from '../../task/taskList/taskList.js';
import {modifiedWorkEvents} from '../../../system/EventBatchEdit.js';

const apiDynamicURL = window.api.apiDynamicURL;

//推送状态
const releaseStatus = {
  0: '默认',
  1: '未推送',
  2: '已推送',
  3: '已推送-重复/拒绝',
};

export const status_default = '默认';
export const status_valid = '有效';
export const status_invalid = '失效';

//事件状态
export const eventStatus = {
  0: status_default,
  1: status_valid,
  2: status_invalid,
};

export const eventListData = reactive({
  branchName: null,
  mapVersion: null,
  visible: false,
  loading: false,
  list: [],
  pageNo: 1,
  pageSize: 20,
  total: 0,
  workKey: '',
});

//触发界面更新
export function updateEventListPanel(changed_ids) {
  if (changed_ids.size == 0) {
    return;
  }

  for (let i = 0; i < eventListData.list.length; i++) {
    if (changed_ids.has(eventListData.list[i].eventId)) {
      let item = modifiedWorkEvents.get(eventListData.list[i].eventId);

      //eventId: item.eventId,
      eventListData.list[i].type = DynamicInfo[item.dynamicInfo];
      eventListData.list[i].lawSpeed = item.lawSpdlmt;
      eventListData.list[i].exSpeed = item.expSpdlmt;
      eventListData.list[i].provinceName = item.provinceName;
      eventListData.list[i].cityName = item.cityName;
      eventListData.list[i].tile = item.tile;
      eventListData.list[i].featureId = item.featureId;
      eventListData.list[i].startOffset = item.startOffset;
      eventListData.list[i].endOffset = item.endOffset;
      eventListData.list[i].mapVersion = item.mapVersion ?? 'null';
      eventListData.list[i].source = OddSource[item.source];
      eventListData.list[i].status = eventStatus[item.status];
      eventListData.list[i].infoValueList = item.infoValueList ?? '';
    }
  }
}

function resetEventList() {
  Object.assign(eventListData, {
    branchName: null,
    mapVersion: null,
    visible: false,
    loading: false,
    list: [],
    pageNo: 1,
    pageSize: 20,
    total: 0,
  });
}

function loadingEventList() {
  eventListData.loading = true;
  return axios
    .post(apiDynamicURL + '/dynamic-map/event/branch/list', {
      branchName: eventListData.branchName,
      mapVersion: eventListData.mapVersion,
      pageNo: eventListData.pageNo,
      pageSize: eventListData.pageSize,
    })
    .then((res) => {
      if (res.data.code === 200) {
        let data = res.data.data;
        eventListData.total = data.total;

        if (eventListData.workKey === 'step_user_ao_check') {
          eventListData.list = data.result.map((item) => {
            return {
              eventId: item.eventId,
              type: item.dynamicInfo,
              featureId: item.featureId,
              startOffset: item.startOffset,
              endOffset: item.endOffset,
              mapVersion: item.mapVersion ?? 'null',
              status: eventStatus[item.status],
            };
          });
        } else {
          eventListData.list = data.result.map((item) => {
            //替换为之前作业库通过列表批量修改后的值
            if (modifiedWorkEvents.has(item.eventId)) {
              item = modifiedWorkEvents.get(item.eventId);
            } else {
              modifiedWorkEvents.set(item.eventId, item);
            }

            return {
              eventId: item.eventId,
              type: DynamicInfo[item.dynamicInfo],
              lawSpeed: item.lawSpdlmt,
              exSpeed: item.expSpdlmt,
              provinceName: item.provinceName,
              cityName: item.cityName,
              tile: item.tile,
              featureId: item.featureId,
              startOffset: item.startOffset,
              endOffset: item.endOffset,
              mapVersion: item.mapVersion ?? 'null',
              source: OddSource[item.source],
              status: eventStatus[item.status],
              infoValueList: item.infoValueList ?? '',
              // releaseStatus: releaseStatus[item.releaseStatus],
            };
          });
        }
      } else {
        throw new Error('loadingEventList错误:' + res.data.msg);
      }
    })
    .finally(() => {
      eventListData.loading = false;
    });
}

export function loadingEventListHandler() {
  loadingEventList().catch((err) => {
    NioNotification('error', '事件列表查询失败', err.message);
  });
}

export function openEventListPanel(task) {
  resetEventList();
  eventListData.visible = true;
  requestOddBranchName(task)
    .then((branchName) => {
      eventListData.branchName = branchName;
      eventListData.mapVersion = task.mapVersion;
      eventListData.workKey = task.workKey;
      loadingEventListHandler();
    })
    .catch((err) => {
      NioNotification('error', '作业库获取失败', err.message);
    });
}

export function closeEventListPanel() {
  resetEventList();
}
