import axios from 'axios';
import {Client} from '../libs/client';
import {ListResponse} from '../models';
import {components} from '../models/openapi-alg';

type EvalTaskQuery = components['schemas']['EvalTaskQuery'];
type EvalTaskVo = components['schemas']['EvalTaskVo'];

export const DOMAIN_MAP: {[key: string]: string} = {
  'cross-produce-web-dev.nioint.com': 'http://nmap-alg-eval.idc-dev.nioint.com',
  'cross-produce-web.idc-uat.nioint.com': 'http://nmap-alg-eval.idc-dev.nioint.com',
  'cross-produce-web-stg.nioint.com': 'http://nmap-alg-eval.idc-stg.nioint.com',
  'cross-produce-web.idc-prod.nioint.com': 'http://nmap-alg-eval.idc-prod.nioint.com',
  'cross-produce-web.nioint.com': 'http://nmap-alg-eval.idc-prod.nioint.com',
};

let Domain = DOMAIN_MAP[window.location.hostname];
if (!Domain) Domain = 'http://nmap-alg-eval.idc-dev.nioint.com';

//本地调试
if (window.location.port == '3000') {
  Domain = 'http://nmap-alg-eval.idc-stg.nioint.com';
}

class AlgoService {
  client = new Client(Domain, {underscoreRequestData: false});

  constructor() {}

  queryAlgoVerifyTaskList(payload: EvalTaskQuery) {
    return this.client.post<ListResponse<EvalTaskVo>>('/nmap-alg-eval/evalTask/queryList', payload);
  }

  createAlgoVerifyTask(payload: components['schemas']['EvalTaskCreateReq']) {
    return this.client.post<ListResponse<components['schemas']['EvalTask']>>('/nmap-alg-eval/evalTask/create', payload);
  }

  queryAlgoVerifyTaskDetailList(payload: components['schemas']['EvalSubTaskQuery']) {
    return this.client.post<ListResponse<components['schemas']['EvalSubtaskVo']>>(
      '/nmap-alg-eval/evalTask/queryEvalAlgSubtaskList',
      payload,
    );
  }

  queryAlgoList(payload: components['schemas']['AlgInfoQuery']) {
    return this.client.post<ListResponse<components['schemas']['AlgInfoVo']>>(
      '/nmap-alg-eval/algInfo/queryList',
      payload,
    );
  }

  queryAlgoVersionList(payload: components['schemas']['AlgVsnQuery']) {
    return this.client.post<ListResponse<components['schemas']['AlgVsnVo']>>(
      '/nmap-alg-eval/algVsn/queryList',
      payload,
    );
  }

  createAlgo(payload: components['schemas']['AlgInfo']) {
    return this.client.post<ListResponse<components['schemas']['AlgInfo']>>('/nmap-alg-eval/algInfo/create', payload);
  }

  queryBizAndAlgoType() {
    return this.client.get<
      ListResponse<{
        bizTypeDesc: string;
        bizTypeValue: number;
        bizTypeAlgTypeList: {
          algTypeDesc: string;
          algTypeValue: number;
        }[];
      }>
    >('/nmap-alg-eval/util/getBizAndAlgType');
  }

  async queryAlgoTypeOptions() {
    const ret = await this.queryBizAndAlgoType();
    let options = [];
    for (let item of ret.data) {
      for (let subItem of item.bizTypeAlgTypeList) {
        options.push({label: subItem.algTypeDesc, value: subItem.algTypeValue});
      }
    }

    return options;
  }

  createAlgoVersion(payload: components['schemas']['AlgVsn']) {
    return this.client.post<ListResponse<components['schemas']['AlgVsn']>>('/nmap-alg-eval/algVsn/create', payload);
  }

  deleteAlgoVersion(algVsnId: any) {
    return this.client.post<ListResponse<any>>('/nmap-alg-eval/algVsn/delete?algVsnId=' + algVsnId);
  }

  queryAlgoStepConfig(algId: any) {
    return this.client.post<components['schemas']['ResponseVo«AlgVsnWorkflowConf»']>(
      '/nmap-alg-eval/algVsn/getAlgVsnWorkflowConf4Create?algId=' + algId,
    );
  }

  querySampleList(payload: components['schemas']['SampleInfoQuery']) {
    return this.client.post<ListResponse<components['schemas']['SampleInfo']>>('/nmap-alg-eval/sample/query', payload);
  }

  createSampleset(payload: components['schemas']['CreateSampleSetRequest']) {
    return this.client.post<ListResponse<components['schemas']['SampleSet']>>(
      '/nmap-alg-eval/sampleSet/upsert',
      payload,
    );
  }

  querySamplesetList(payload: components['schemas']['SampleSetQuery']) {
    return this.client.post<ListResponse<components['schemas']['SampleSet']>>(
      '/nmap-alg-eval/sampleSet/query',
      payload,
    );
  }

  rerunVerifyTask(taskId: any) {
    return this.client.post<ListResponse<any>>('/nmap-alg-eval/evalTask/reExecuteEvalMetricSubtask?taskId=' + taskId);
  }

  querySampleListUseSetId(setId: any) {
    return this.client.get<ListResponse<components['schemas']['SampleSetVo']>>('/nmap-alg-eval/sampleSet/' + setId);
  }

  queryEvaMetric(payload: components["schemas"]["EvalMetricSumQuery"]) {
    return this.client.post<ListResponse<components["schemas"]["MetricSumTable"]>>(
      '/nmap-alg-eval/metricSum/query',
      payload,
    );
  }
}

export const algoService = new AlgoService();
