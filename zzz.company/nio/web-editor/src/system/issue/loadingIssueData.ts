import {poll} from '../../worker/core.js';
import store from '../../store/index.js';
import {getScreenPoint} from '../../utils/compute.js';
import {PollTaskResult} from '../../worker/taskResult.js';
import {getTileLevel, NioMessage} from '../../utils/utils.js';
import {createViewer} from '../../cesium/initMap.js';
import {ISSUE_CONDITION_TYPE} from '../../views/map/Issue/constants.js';
import {v4 as uuidv4} from 'uuid';
import {issueLayer} from './layer.js';

// issue 最新的请求 uuid
let request_uuid: string | null = null;

// @ts-ignore
const {issueServiceURL, issueServiceStgURL} = api;

const loadingTaskQueue: any[] = [];
const viewer = createViewer();

function handleIssueData(taskResult) {
  if (taskResult.code === PollTaskResult.SUCCESS) {
    if (taskResult.data.request_uuid === request_uuid) {
      issueLayer.loadData(taskResult.data.data ?? []);
    } else {
      console.error('handleIssueData错误: request_uuid不匹配');
    }
  } else {
    throw new Error('handle issue Data错误:' + taskResult.data);
  }
}

async function loadingSourceIssue(payload: any, issueMap: any, lbLon: any, lbLat: any, rtLon: any, rtLat: any) {
  try {
    issueLayer.loading = true;

    let _issueServiceURL = issueServiceURL;

    if (payload.env === 'Stg') {
      _issueServiceURL = issueServiceStgURL;
    }

    const taskResult = await poll.start('loadingSourceIssue', {
      issueServiceURL: _issueServiceURL,
      payload: payload,
      issueMap: issueMap,
      lbLon: lbLon,
      lbLat: lbLat,
      rtLon: rtLon,
      rtLat: rtLat,
    });

    handleIssueData(taskResult);
  } catch (error) {
    NioMessage('error', 'Issue 事件获取失败：' + error.message, 2000);
  } finally {
    issueLayer.loading = false;
    if (loadingTaskQueue.length > 0) {
      loadingTaskQueue[0]();
      loadingTaskQueue.shift();
    }
  }
}

/**
 * 加载 issue 数据
 * @param forceLoad{boolean}
 */
export const loadingIssueHandler = async (forceLoad: boolean) => {
  if (getTileLevel() <= 10 || (issueLayer.loading === true && forceLoad !== true) || issueLayer.show === false) {
    return;
  }

  const uuid = uuidv4();

  request_uuid = uuid;

  const width = document.body.clientWidth,
    height = document.body.clientHeight;
  const issueMap = issueLayer.issue_id_map;
  let lb = getScreenPoint(0, height),
    rt = getScreenPoint(width, 0);
  const lbLon = lb.longitude;
  const lbLat = lb.latitude;
  const rtLon = rt.longitude;
  const rtLat = rt.latitude;

  const triggerTimeBegin = store.state.issue.search_conditions.date_range[0].getTime();
  const triggerTimeEnd = store.state.issue.search_conditions.date_range[1].getTime();

  const issue_notify_type = Object.keys(
    store.state.issue.search_conditions.selected_issue_props[ISSUE_CONDITION_TYPE.ISSUE_NOTIFY_TYPE],
  ).filter(
    (key) => store.state.issue.search_conditions.selected_issue_props[ISSUE_CONDITION_TYPE.ISSUE_NOTIFY_TYPE][key],
  );

  const issue_status = Object.keys(
    store.state.issue.search_conditions.selected_issue_props[ISSUE_CONDITION_TYPE.ISSUE_STATUS],
  ).filter((key) => store.state.issue.search_conditions.selected_issue_props[ISSUE_CONDITION_TYPE.ISSUE_STATUS][key]);

  const env =
    Object.keys(store.state.issue.search_conditions.selected_issue_props[ISSUE_CONDITION_TYPE.ISSUE_ENV])[0] ?? '';

  const payload = {
    request_uuid,
    triggerTimeBegin,
    triggerTimeEnd,
    ndsVsn: store.state.version.curVersion,
    issueStatus: issue_status,
    issueNotifyType: issue_notify_type,
    env,
  };

  if (issueLayer.loading === false) {
    loadingSourceIssue(payload, issueMap, lbLon, lbLat, rtLon, rtLat);
  } else {
    new Promise((resolve) => {
      loadingTaskQueue.push(resolve);
    }).then(() => {
      loadingSourceIssue(payload, issueMap, lbLon, lbLat, rtLon, rtLat);
    });
  }
};
