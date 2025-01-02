import axios from 'axios';
import {Client} from '../libs/client';
import {
  BatchInList,
  PublicConfig,
  CollectTaskInList,
  CreateMapByModelPayload,
  CreateMapByPointCloudPayload,
  DataManageInList,
  DataManageListQuery,
  ListResponse,
  ProjectInList,
  ProjectProgressInList,
  ProjectProgressListQuery,
  ProjectStatus,
  DataDelivery,
  createBatchAnnotation,
  ProgressDailyTask,
  GetCityCrossNumQuery,
  MergeTaskInList,
  MergeTaskOutList,
  MergeTaskCrossOutList,
  GetCityCrossNumList,
  CreateMergeTaskInList,
  GetCityNumListByProcess,
  GetCrossNumByCityLevel,
} from '../models';
import {
  CollectTaskQuery,
  DataDetailQuery,
  DataDetailInList,
  CollectMaterialQueryInList,
  CreateOverWriteBatchParams,
  OverWriteBatchInList,
  OverWriteBatchQuery,
  OverWriteTaskInList,
  OverWriteTaskQuery,
  ProduceTaskInList,
  ProduceTaskQuery,
  produceTaskDataQuery,
  produceTaskDataInList,
} from '../models/produce';
import moment from 'moment';

export const DOMAIN_MAP: {[key: string]: string} = {
  'cross-produce-web-dev.nioint.com': 'http://cross-produce-management.idc-dev.nioint.com',
  'cross-produce-web.idc-uat.nioint.com': 'http://cross-produce-management.idc-dev.nioint.com',
  'cross-produce-web-stg.nioint.com': 'http://cross-produce-management.idc-stg.nioint.com',
  'cross-produce-web.idc-prod.nioint.com': 'http://cross-produce-management.idc-prod.nioint.com',
  'cross-produce-web.nioint.com': 'http://cross-produce-management.idc-prod.nioint.com/',
};

let Domain = 'http://cross-produce-management.idc-dev.nioint.com';
Domain = DOMAIN_MAP[window.location.hostname];

if (process.env.NODE_ENV === 'production') {
  Domain = DOMAIN_MAP[window.location.hostname];
}

//test code
//Domain = 'http://cross-produce-management.idc-dev.nioint.com';

/**
 * CPM Service
 * http://cross-produce-management.idc-dev.nioint.com
 */
class CPMService {
  client = new Client(Domain, {underscoreRequestData: false});

  constructor() {}

  /**
   * 创建项目
   */
  createProject(payload: {projectName: string; projectDesc: string; operator?: string}) {
    return this.client.post('/cross-produce-management/project/create', payload);
  }

  /**
   * 获取项目列表
   */
  retrieveProjectList(payload: {
    pageSize: number;
    startIndex: number;
    operator?: string;
    orderBy?: string;
    projectName?: string;
    projectId?: number;
    startTime?: number;
    endTime?: number;
    businessType?: number;
    statusList?: ProjectStatus[];
  }) {
    // const startTime = payload.startTime ? moment(payload.startTime).format('YYYY-MM-DD') : undefined;
    // const endTime = payload.endTime ? moment(payload.endTime).format('YYYY-MM-DD') : undefined;
    return this.client.post<ListResponse<ProjectInList>>('/cross-produce-management/project/query', {
      ...payload,
      // startTime,
      // endTime,
    });
  }

  /**
   * 创建批次
   */
  createBatch(payload: any) {
    // 1. 通过 FormData 上传文件
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value) {
        // @ts-ignore
        formData.append(key, value);
      }
    });

    return axios.post(`${Domain}/cross-produce-management/batch/create`, formData);
  }

  /**
   * 更新批次
   */
  updateBatch(payload: {
    /** @description 批次描述 */
    batchDesc?: string;
    /**
     * Format: binary
     * @description 批次文件
     */
    batchFile?: string;
    /**
     * Format: int64
     * @description 批次编号，仅更新时提供
     */
    batchId?: number;
    /** @description 批次编号，仅批量更新时提供 */
    batchIds?: string;
    /**
     * Format: int32
     * @description 产线模式
     */
    batchMode?: number;
    /** @description 批次名 */
    batchName?: string;
    /**
     * Format: int32
     * @description 产线类型
     */
    businessType?: number;
    /** @description 批次配置 */
    configParam?: string;
    fileContent?: string;
    /** @description 操作员 */
    operator?: string;
    /** @description 流程列表 */
    processList?: string;
    /**
     * Format: int64
     * @description 项目编号
     */
    projectId?: number;
  }) {
    return this.client.post('/cross-produce-management/batch/updateBatch', payload, {dataType: 'multipart'});
  }

  queryConfigPublic(bizType: any) {
    return this.client.get(`/cross-produce-management/config/query/public/${bizType}`);
  }

  batchProcessList(bizType: any) {
    return this.client.get(`/cross-produce-management/config/query/processList/${bizType}`);
  }

  /**
   * 获取批次列表
   */
  retrieveBatchList(payload: {
    pageNo?: number;
    pageSize: number;
    // startIndex: number;
    orderBy?: string;
    operator?: string;
    projectName?: string;
    batchId?: number;
    projectId?: number;
    startTime?: number;
    endTime?: number;
    collectBatchId?: number;
    statusList?: ProjectStatus[];
    businessType?: number;
    batchMode?: number;
  }) {
    // const startTime = payload.startTime ? moment(payload.startTime).format('YYYY-MM-DD') : undefined;
    // const endTime = payload.endTime ? moment(payload.endTime).format('YYYY-MM-DD') : undefined;

    return this.client.post<ListResponse<BatchInList>>('/cross-produce-management/batch/query', {
      ...payload,
      // startTime,
      // endTime,
    });
  }
  //数据盛昌-点云建图-查看CI文件
  getCiFileByTaskId(taskId: any) {
    return this.client.get('/cross-produce-management/util/getCIFileByTaskId/' + taskId);
  }

  getParseKwargsByTaskId(taskId: any) {
    return this.client.get<ListResponse<any>>('/cross-produce-management/util/parseKwargsByTaskId/' + taskId);
  }

  /**
   * 获取资料采集列表
   */
  retrieveCollectTaskList(payload: CollectTaskQuery) {
    return this.client.post<ListResponse<CollectTaskInList>>('/cross-produce-management/batch/queryCross', payload);
  }

  retriveDataDetailList(payload: DataDetailQuery) {
    return this.client.post<ListResponse<DataDetailInList>>(
      '/cross-produce-management/collect/material/query',
      payload,
    );
  }

  reCreateCollectTask(payload: CollectMaterialQueryInList) {
    return this.client.post('/cross-produce-management/collect/reCreateCollectTask', payload);
  }

  /**
   * 获取生产任务
   *
   */
  retrieveProduceTaskList(payload: ProduceTaskQuery) {
    return this.client.post<ListResponse<ProduceTaskInList>>(
      '/cross-produce-management/mappingtask/produceTask/list',
      payload,
    );
  }

  /**
   * 数据检查、数据融合
   */
  retrieveTaskQueryList(payload: produceTaskDataQuery) {
    return this.client.post<ListResponse<produceTaskDataInList>>(
      '/cross-produce-management/produce/task/query',
      payload,
    );
  }

  /**
   * 获取刷库任务列表
   */
  retrieveOverWriteBatchList(payload: OverWriteBatchQuery) {
    return this.client.post<ListResponse<OverWriteBatchInList>>(
      '/cross-produce-management/mappingtask/batchMappingTask/batchList',
      {
        ...payload,
      },
    );
  }

  /**
   * 创建刷库批次
   */
  createOverWriteBatch(payload: CreateOverWriteBatchParams) {
    return this.client.post('/cross-produce-management/mappingtask/batchMappingTask/create', payload);
  }

  /**
   * 获取刷库任务列表
   */
  retrieveOverWriteTaskList(payload: OverWriteTaskQuery) {
    return this.client.post<ListResponse<OverWriteTaskInList>>(
      '/cross-produce-management/mappingtask/batchMappingTask/taskList',
      payload,
    );
  }

  /**
   * 获取数据管理的相关接口
   * 点云建图、模型建图、数据标注、推理
   */
  retrieveDataManageList(payload: DataManageListQuery) {
    return this.client.post<ListResponse<DataManageInList>>(
      '/cross-produce-management/mappingtask/produceData/list',
      payload,
    );
  }

  /**
   * 获取数据管理的相关接口
   * 模型建图-数据标注查询
   */
  retrieveDataDeliveryList(payload: DataDelivery) {
    return this.client.post<ListResponse<DataManageInList>>(
      '/cross-produce-management/mappingtask/annotation/selectList',
      payload,
    );
  }
  /**
   * 获取数据管理的相关接口
   * 模型建图-数据标注-送标原数据
   */
  streamSourceUuidList() {
    return this.client.post('/cross-produce-management/mappingtask/annotation/streamsourceUuidList');
  }
  /**
   * 获取数据管理的相关接口
   * 模型建图-数据标注-创建送标任务
   */
  createBatchAnnotationTask(payload: createBatchAnnotation) {
    return this.client.post('/cross-produce-management/mappingtask/batchAnnotation/create', payload);
  }
  /**
   * 获取进度统计
   */
  retrieveProjectProgressList(payload: ProjectProgressListQuery) {
    return this.client.post<ListResponse<ProjectProgressInList>>(
      '/cross-produce-management/progress/getTotalTaskNumByProcess',
      undefined,
      {
        params: payload,
      },
    );
  }

  // 路口交付进度
  retrieveCrossList(payload: ProjectProgressListQuery) {
    return this.client.post<ListResponse<GetCityNumListByProcess>>(
      '/cross-produce-management/progress/getTotalCrossNumByProcess',
      undefined,
      {
        params: payload,
      },
    );
  }
  /**
   * 创建点云建图任务
   */
  createMapByPointCloud(payload: CreateMapByPointCloudPayload) {
    return this.client.post('/cross-produce-management/mappingtask/perception/create', payload);
  }

  /**
   * 创建模型建图任务
   */
  createMapByModel(payload: CreateMapByModelPayload) {
    return this.client.post('/cross-produce-management/mappingtask/produceTask/create', payload);
  }

  /**
   * 进度详情
   */
  retrieveProgressDetail(payload: ProjectProgressListQuery) {
    return this.client.post<ListResponse<ProgressDailyTask>>(
      '/cross-produce-management/progress/getDailyTaskNum',
      undefined,
      {params: payload},
    );
  }

  /** 城市列表 */
  retrieveDimCity() {
    return this.client.get('/cross-produce-management/util/getCityList');
  }

  //建图任务概览
  retrieveCrossByCityLevel(payload: GetCrossNumByCityLevel) {
    return this.client.post('/cross-produce-management/progress/getCrossNumByCityLevel', undefined, {params: payload});
  }

  //分城市生产转化分布
  retrieveGetCityCrossNum(payload: GetCityCrossNumQuery) {
    return this.client.post<ListResponse<GetCityCrossNumList>>(
      '/cross-produce-management/progress/getCityCrossNum',
      undefined,
      {params: payload},
    );
  }

  //分城市生产转化分布
  retrieveTotalCrossNum(payload: GetCityCrossNumQuery) {
    return this.client.post('/cross-produce-management/progress/getTotalCrossNum', undefined, {params: payload});
  }

  //生产各环节损失分布
  retrieveGetCityCrossNumByProcess(payload: GetCityCrossNumQuery) {
    return this.client.post('/cross-produce-management/progress/getCityCrossNumByProcess', undefined, {
      params: payload,
    });
  }

  retrieveMergeSubTaskList(payload: MergeTaskInList) {
    return this.client.post<ListResponse<MergeTaskOutList>>('/cross-produce-management/mergetask/mergeSubtask/list', {
      ...payload,
    });
  }

  retrieveMergeSubTaskCrossList(payload: MergeTaskInList) {
    return this.client.post<ListResponse<MergeTaskCrossOutList>>(
      '/cross-produce-management/mergetask/mergeSubtask/crosslist',
      {
        ...payload,
      },
    );
  }

  triggerMergeTask(subtaskId: number) {
    return this.client.get<ListResponse<any>>(
      '/cross-produce-management/mergetask/mergeSubtask/triggerMergeTask?subtaskId=' + subtaskId,
    );
  }

  createMergeTask(payload: CreateMergeTaskInList) {
    return this.client.post<ListResponse<MergeTaskCrossOutList>>(
      '/cross-produce-management/mergetask/mergeSubtask/create',
      {
        ...payload,
      },
    );
  }

  retrieveTaskNameList() {
    return this.client.get('/cross-produce-management/mergetask/getMergeTaskNameList');
  }

  retrieveMergeParamConfigs() {
    return this.client.get('/cross-produce-management/util/getMergeParamConfigs');
  }

  retrieveInferAlgVsnList() {
    return this.client.get('/cross-produce-management/util/getInferAlgVsnList');
  }

  retrieveEvalAlgVsnList() {
    return this.client.get('/cross-produce-management/util/getEvalAlgVsnList');
  }

  retrieveGetTmsFieldsList(pipelineType: string) {
    return this.client.get('/cross-produce-management/mergetask/mergeSubtask/getTmsFields/' + pipelineType);
  }

  //获取产线模式列表
  getBatchModeList() {
    return this.client.get('/cross-produce-management/util/getBatchModeList');
  }

  //获取产线列表
  getBusinessTypeList() {
    return this.client.get('/cross-produce-management/util/getBusinessTypeList');
  }

  //获取融合产线类型列表
  getMergeBusinessTypeList(){
    return this.client.get('/cross-produce-management/util/getMergeLineList');
  }

  //批量创建打分任务
  createEvalTask(payload: {
    /** @description 打分刷库任务描述 */
    batchInferEvalTaskDesc?: string;
    /**
     * Format: int32
     * @description 打分刷库任务编号
     */
    batchInferEvalTaskId?: number;
    /** @description 打分刷库任务名称 */
    batchInferEvalTaskName?: string;
    /** @description 城市名称列表，多个时用英文逗号分割 */
    cityList?: string;
    /**
     * Format: date-time
     * @description 任务创建时间
     */
    createTime?: string;
    diffFileAllKey?: string;
    diffFileInputKey?: string;
    /**
     * Format: int32
     * @description 变化源数量
     */
    diffNumAll?: number;
    /** Format: int32 */
    diffNumInput?: number;
    /** @description 打分算法版本 */
    evalAlgVsn?: string;
    /** @description 推理算法版本 */
    inferAlgVsn?: string;
    /**
     * Format: int32
     * @description 融合项目编号
     */
    mergeSubtaskId?: number;
    /** @description 创建人 */
    operator?: string;
    /** @description 项目编号列表，多个时用英文逗号分割 */
    projectIds?: string;
    /** @description 任务状态 */
    status?: string;
    /** @description tms任务号 */
    tmsTaskId?: string;
    /** Format: date-time */
    updateTime?: string;
  }) {
    return this.client.post('/cross-produce-management/inferEval/batchInferEvalTask/create', payload);
  }

  //查询打分任务详情
  queryEvalTaskDetail(payload: {
    /**
     * Format: int32
     * @description 打分刷库任务编号
     */
    batchInferEvalTaskId?: number;
    /**
     * Format: int64
     * @description 建图实体编号
     */
    crossId?: string;
    /**
     * Format: date-time
     * @description 创建时间查询的截止时间
     */
    endCreateTime?: string;
    /** @description 推理算法版本 */
    inferAlgVsn?: string;
    orderBy?: string;
    /** Format: int32 */
    pageNo?: number;
    /** Format: int32 */
    pageSize?: number;
    /**
     * Format: date-time
     * @description 创建时间查询的开始时间
     */
    startCreateTime?: string;
  }) {
    return this.client.post('/cross-produce-management/inferEval/batchInferEvalTask/detailList', payload);
  }

  //查询打分任务
  queryEvalTask(payload: {
    /**
     * Format: int32
     * @description 打分刷库任务编号
     */
    batchInferEvalTaskId?: number;
    /**
     * Format: date-time
     * @description 创建时间查询的截止时间
     */
    endCreateTime?: string;
    /** @description 推理算法版本 */
    inferAlgVsn?: string;
    orderBy?: string;
    /** Format: int32 */
    pageNo?: number;
    /** Format: int32 */
    pageSize?: number;
    /**
     * Format: int64
     * @description 项目ID
     */
    projectId?: number;
    /**
     * Format: date-time
     * @description 创建时间查询的开始时间
     */
    startCreateTime?: string;
    /** @description 执行状态 */
    status?: string;
    tmsTaskId?: string;
  }) {
    return this.client.post('/cross-produce-management/inferEval/batchInferEvalTask/list', payload);
  }

  //创建打分结果对比任务
  createEvalTaskResult(payload:{
    cityList?: string;
    createTime?: string;
    evalAlgVsn?: string;
    inferEvalCompareTaskDesc?: string;
    inferEvalCompareTaskId?: number;
    inferEvalCompareTaskName?: string;
    newInferAlgVsn?: string;
    newMergeSubtaskId?: number;
    oldInferAlgVsn?: string;
    oldMergeSubtaskId?: number;
    operator?: string;
    projectIds?: string;
    status?: string;
    updateTime?: string;
  }) {
    return this.client.post('/cross-produce-management/inferEval/inferEvalCompareTask/create', payload);
  }

  //查询打分结果对比任务
  queryEvalTaskResult(payload: {
    cityName?: string;
    endCreateTime?: string;
    evalAlgVsn?: string;
    inferEvalCompareTaskId?: number;
    newInferAlgVsn?: string;
    newMergeSubtaskId?: number;
    oldInferAlgVsn?: string;
    oldMergeSubtaskId?: number;
    orderBy?: string;
    pageNo?: number;
    pageSize?: number;
    startCreateTime?: string;
  }) {
    return this.client.post('/cross-produce-management/inferEval/inferEvalCompareTask/resultList', payload);
  }


  //创建时获取当前打分算法版本
  getCurrentEvalAlgVsn(){
    return this.client.get('/cross-produce-management/util/getCurrentEvalAlgVsn')
  }

  //批量原地重试
  retryFailedInplace(payload: {
    batchMappingTaskId: number;
    mappingTaskId?: number;
  }){
    return this.client.get('/cross-produce-management/mappingtask/batchMappingTask/retryFailedInplace', payload)
  }

  //追加NDS版本号
  setNdsVsn(payload: {
    subtaskId: number;
    ndsVsn: string;
  }){
    return this.client.post('/cross-produce-management/mergetask/mergeSubtask/setNdsVsn', payload)
  }
}

export const cpmService = new CPMService();
