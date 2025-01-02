import {CrownFilled, SmileFilled, TabletFilled} from '@ant-design/icons';
import {ProLayoutProps} from '@ant-design/pro-components';
import {ProjectList} from '../pages/project-list';
import {BatchList} from '../pages/batch-list';
import {Navigate} from 'react-router-dom';
import {DataCollect} from '../pages/data-product/increment/data-collect-list';
import {ProduceTaskList} from '../pages/data-product/increment/produce-task-list';
import {ProduceTaskCheckMerge} from '../pages/data-product/increment/produce-check-merge';
import {Login} from '../pages/login/login';
import {TASK_TYPE} from '../models/produce';
import {OverWriteTaskList} from '../pages/data-product/overwrite/task-list';
import {CrossMergeCreate} from '../pages/data-product/cross-merge/cross-merge-create';
import {CrossMergeDetail} from '../pages/data-product/cross-merge/cross-merge-detail';
import {OverWriteBatchList} from '../pages/data-product/overwrite/batch-list';
import {DataManagementList} from '../pages/data-management/data-list';
import {AlgoVerifyTaskList} from '../pages/algo-verify/algo-verify-task-list';
import {AlgoVerifyTaskDetailList} from '../pages/algo-verify/algo-verify-task-detail-list';
import {EvaStatistic} from '../pages/algo-verify/eva-statistic';
import {AlgoList} from '../pages/algo-verify/algo-list';
import {AlgoVersionList} from '../pages/algo-verify/algo-version-list';
import {SampleList} from '../pages/algo-verify/sample-list';
import {SamplesetList} from '../pages/algo-verify/sampleset-list';
import {ProjectProgressList} from '../pages/data-monitor/project-progress-list';
import {ProgressChart} from '../pages/data-monitor/progress-chart';
import {BatchProgressList} from '../pages/data-monitor/batch-progress-list';
import {IntersectionList} from '../pages/data-management/intersection-list';
import {DataCollectInManagement} from '../pages/data-management/data-collect-list';
import {DataDetailInManagement} from '../pages/data-management/data-detail-list';
import {DataDelivery} from '../pages/data-management/data-delivery';
import {SubmitProgressList} from '../pages/data-monitor/submit-progess-list';
import {SubmitBarLine} from '../pages/data-monitor/submit-barline';
import {SubmitTable} from '../pages/data-monitor/submit-Table';
import {BatchTaskList} from '../pages/data-monitor/batch-task-list';
import {DataVectorInManagement} from '../pages/data-management/data-vector-list';
import { EvalCheckCreate } from '../pages/data-product/eval-check/eval-check-create';
import { EvalCheckDetail } from '../pages/data-product/eval-check/eval-check-detail';
import {EvalCheckResult} from '../pages/data-product/eval-check/eval-check-result';
import {BuildMapSceneList} from '../pages/build-map/build-map-scene-list';
import {BuildMapTaskDetailList} from '../pages/build-map/build-map-task-detail-list';
import {BuildMapDemandImport} from '../pages/build-map/build-map-demand-import';
import {BuildMapDemandDetail} from '../pages/build-map/build-map-demand-detail';
import {BuildMapTaskCreate} from '../pages/build-map/build-map-task-create';
import {BuildMapTaskDetail} from '../pages/build-map/build-map-task-detail';
export const DEFAULT_PATH = '/project-management/project/list';

export const Route: ProLayoutProps['route'] = {
  path: '/',
  routes: [
    {
      path: '/login',
      name: '加载页',
      component: <Login />,
      hideInMenu: true,
    },
    {
      path: '/project-management',
      name: '项目管理',
      icon: <SmileFilled />,
      routes: [
        {
          path: '/project-management/project/list',
          name: '项目管理',
          icon: <SmileFilled />,
          component: <ProjectList></ProjectList>,
        },
        {
          path: '/project-management/project/detail',
          name: '详情',
          icon: <SmileFilled />,
          hideInMenu: true,
          component: './project detail',
        },
        {
          path: '/project-management/batch/list',
          name: '批次管理',
          icon: <SmileFilled />,
          component: <BatchList></BatchList>,
        },
      ],
    },
    {
      name: '数据生产',
      icon: <TabletFilled />,
      path: '/data-product',
      component: <Navigate to="/welcome" replace />,
      routes: [
        {
          path: '/data-product/increment',
          name: '增量建图',
          icon: <CrownFilled />,
          routes: [
            {
              path: '/data-product/increment/collect',
              name: '资料采集',
              icon: <CrownFilled />,
              component: <DataCollect></DataCollect>,
            },
            {
              path: '/data-product/increment/pointcloud-to-map',
              name: '点云建图',
              icon: <CrownFilled />,
              component: (
                <ProduceTaskList key={TASK_TYPE.PERCEPTION} mappingTaskType={TASK_TYPE.PERCEPTION}></ProduceTaskList>
              ),
            },
            {
              path: '/data-product/increment/collect-qa',
              name: '采集质检',
              icon: <CrownFilled />,
              component: (
                <ProduceTaskList
                  key={TASK_TYPE.PERCEPTION_VERIFY}
                  mappingTaskType={TASK_TYPE.PERCEPTION_VERIFY}
                ></ProduceTaskList>
              ),
            },
            {
              path: '/data-product/increment/model-to-map',
              name: '模型建图',
              icon: <CrownFilled />,
              component: <ProduceTaskList key={TASK_TYPE.MODEL} mappingTaskType={TASK_TYPE.MODEL}></ProduceTaskList>,
            },
            {
              path: '/data-product/increment/data-annotation',
              name: '数据标注',
              icon: <CrownFilled />,
              component: (
                <ProduceTaskList key={TASK_TYPE.ANNOTATION} mappingTaskType={TASK_TYPE.ANNOTATION}></ProduceTaskList>
              ),
            },
            {
              path: '/data-product/increment/reasoning',
              name: '推理',
              icon: <CrownFilled />,
              component: (
                <ProduceTaskList key={TASK_TYPE.INFERENCE} mappingTaskType={TASK_TYPE.INFERENCE}></ProduceTaskList>
              ),
            },
            {
              path: '/data-product/increment/data-check',
              name: '数据检查',
              icon: <CrownFilled />,
              component: (
                <ProduceTaskCheckMerge key={TASK_TYPE.CHECK} produceTaskType={TASK_TYPE.CHECK}></ProduceTaskCheckMerge>
              ),
            },
            {
              path: '/data-product/increment/data-merge',
              name: '数据融合',
              icon: <CrownFilled />,
              component: (
                <ProduceTaskCheckMerge key={TASK_TYPE.MERGE} produceTaskType={TASK_TYPE.MERGE}></ProduceTaskCheckMerge>
              ),
            },
            // {
            //   path: '/data-product/increment/data-merge',
            //   name: '数据融合',
            //   icon: <CrownFilled />,
            //   component: './Welcome',
            //   hideInMenu: true,
            // },
            {
              path: '/data-product/increment/data-publish',
              name: '数据发布',
              icon: <CrownFilled />,
              component: './Welcome',
              hideInMenu: true,
            },
          ],
        },
        {
          path: '/data-product/overwrite',
          name: '批量刷库',
          icon: <CrownFilled />,
          routes: [
            {
              path: '/data-product/overwrite/batch',
              name: '创建刷库任务',
              icon: <CrownFilled />,
              component: <OverWriteBatchList></OverWriteBatchList>,
            },
            {
              path: '/data-product/overwrite/task/list',
              name: '刷库任务明细',
              icon: <CrownFilled />,
              component: <OverWriteTaskList></OverWriteTaskList>,
            },
          ],
        },
        {
          path: '/data-product/cross-merge',
          name: '批量融合',
          icon: <CrownFilled />,
          routes: [
            {
              path: '/data-product/cross-merge/create',
              name: '融合任务创建',
              icon: <CrownFilled />,
              component: <CrossMergeCreate></CrossMergeCreate>,
            },
            {
              path: '/data-product/cross-merge/detail',
              name: '融合任务明细',
              icon: <CrownFilled />,
              component: <CrossMergeDetail></CrossMergeDetail>,
            },
          ],
        },
        {
          path: '/data-product/eval-check',
          name: '批量打分检查',
          icon: <CrownFilled />,
          routes: [
            {
              path: '/data-product/eval-check/create',
              name: '创建打分任务',
              icon: <CrownFilled />,
              component: <EvalCheckCreate></EvalCheckCreate>,
            },
            {
              path: '/data-product/eval-check/detail',
              name: '打分任务明细',
              icon: <CrownFilled />,
              component: <EvalCheckDetail></EvalCheckDetail>,
            },
            {
              path: '/data-product/eval-check/result',
              name: '打分结果查询',
              icon: <CrownFilled />,
              component: <EvalCheckResult></EvalCheckResult>,
            },
          ],
        },
      ],
    },
    {
      name: '数据管理',
      icon: <TabletFilled />,
      path: '/data-management',
      component: <Navigate to="/welcome" replace />,
      routes: [
        {
          path: '/data-management/cross',
          name: '路口数据',
          icon: <CrownFilled />,
          hideInMenu: true,
          component: <IntersectionList></IntersectionList>,
        },
        {
          path: '/data-management/vector',
          name: '矢量资料',
          icon: <CrownFilled />,
          component: <DataVectorInManagement></DataVectorInManagement>,
        },
        {
          path: '/data-management/collect',
          name: '资料采集',
          icon: <CrownFilled />,
          component: <DataCollectInManagement></DataCollectInManagement>,
        },
        {
          path: '/data-management/data-detail',
          name: '资料详情',
          icon: <CrownFilled />,
          hideInMenu: true,
          component: <DataDetailInManagement></DataDetailInManagement>,
        },
        {
          path: '/data-management/pointcloud-to-map',
          name: '点云建图',
          icon: <CrownFilled />,
          component: (
            <DataManagementList
              key={TASK_TYPE.PERCEPTION}
              mappingResultType={TASK_TYPE.PERCEPTION}
            ></DataManagementList>
          ),
        },
        {
          path: '/data-management/model-to-map',
          name: '模型建图',
          icon: <CrownFilled />,
          component: (
            <DataManagementList key={TASK_TYPE.MODEL} mappingResultType={TASK_TYPE.MODEL}></DataManagementList>
          ),
        },
        {
          path: '/data-management/data-delivery',
          name: '数据送标',
          icon: <CrownFilled />,
          component: <DataDelivery></DataDelivery>,
          hideInMenu: true,
        },
        {
          path: '/data-management/data-annotation',
          name: '数据标注',
          icon: <CrownFilled />,
          component: (
            <DataManagementList
              key={TASK_TYPE.ANNOTATION}
              mappingResultType={TASK_TYPE.ANNOTATION}
            ></DataManagementList>
          ),
        },
        {
          path: '/data-management/reasoning',
          name: '推理',
          icon: <CrownFilled />,
          component: (
            <DataManagementList key={TASK_TYPE.INFERENCE} mappingResultType={TASK_TYPE.INFERENCE}></DataManagementList>
          ),
        },
      ],
    },
    {
      path: '/data-monitor',
      name: '数据监控',
      icon: <SmileFilled />,
      routes: [
        {
          path: '/data-monitor/project',
          name: '项目进度统计',
          icon: <SmileFilled />,
          component: <ProjectProgressList></ProjectProgressList>,
          hideInMenu: true,
        },
        {
          path: '/data-monitor/batch',
          name: '生产建图进度',
          icon: <SmileFilled />,
          component: <BatchProgressList></BatchProgressList>,
        },
        {
          path: '/data-monitor/batchLask',
          name: '建图交付进度',
          icon: <SmileFilled />,
          component: <BatchTaskList></BatchTaskList>,
        },
        {
          path: '/data-monitor/charts',
          name: '进度图',
          icon: <SmileFilled />,
          component: <ProgressChart></ProgressChart>,
          hideInMenu: true,
        },
        {
          path: '/data-monitor/submitProgress',
          name: '生产交付概览',
          icon: <SmileFilled />,
          component: <SubmitProgressList></SubmitProgressList>,
        },

        {
          path: '/data-monitor/submitBarLine',
          name: '分城市交付进度统计',
          icon: <SmileFilled />,
          component: <SubmitBarLine></SubmitBarLine>,
          hideInMenu: true,
        },
        {
          path: '/data-monitor/submitTable',
          name: '分城市生产转化分布',
          icon: <SmileFilled />,
          component: <SubmitTable></SubmitTable>,
          hideInMenu: true,
        },
      ],
    },
    {
      path: '/algo-verify',
      name: '算法迭代验证',
      icon: <TabletFilled />,
      routes: [
        {
          path: '/algo-verify/main',
          name: '算法迭代及验证',
          routes: [
            {
              path: '/algo-verify/create-task',
              name: '评测任务创建',
              component: <AlgoVerifyTaskList></AlgoVerifyTaskList>,
            },
            {
              path: '/algo-verify/task-detail',
              name: '评测任务明细',
              component: <AlgoVerifyTaskDetailList></AlgoVerifyTaskDetailList>,
            },
            {
              path: '/algo-verify/eva-statistic',
              name: '评测统计',
              component: <EvaStatistic></EvaStatistic>,
            },
          ],
        },
        {
          path: '/algo-verify/main2',
          name: '算法及版本管理',
          routes: [
            {
              path: '/algo-verify/algo-list',
              name: '算法管理',
              component: <AlgoList></AlgoList>,
            },
            {
              path: '/algo-verify/algo-version-list',
              name: '算法版本管理',
              component: <AlgoVersionList></AlgoVersionList>,
            },
          ],
        },
        {
          path: '/algo-verify/main3',
          name: '样本及评测集管理',
          routes: [
            {
              path: '/algo-verify/sample-list',
              name: '样本库管理',
              component: <SampleList></SampleList>,
            },
            {
              path: '/algo-verify/sampleset-list',
              name: '评测集管理',
              component: <SamplesetList></SamplesetList>,
            },
          ],
        },
      ],
    },
    {
      path: '/build-map',
      name: '建图场景及需求管理',
      icon: <TabletFilled />,
      routes: [
        {
          path: '/build-map/scene',
          name: '场景管理',
          routes: [
            {
              path: '/build-map/scene-list',
              name: '场景列表',
              component: <BuildMapSceneList></BuildMapSceneList>,
            },
            {
              path: '/build-map/path-list',
              name: '路径列表',
              component: <BuildMapTaskDetailList></BuildMapTaskDetailList>,
            },
          ],
        },
        {
          path: '/build-map/demand',
          name: '需求管理',
          routes: [
            {
              path: '/build-map/demand-import',
              name: '需求管理',
              component: <BuildMapDemandImport></BuildMapDemandImport>,
            },
            {
              path: '/build-map/demand-detail',
              name: '需求明细',
              component: <BuildMapDemandDetail></BuildMapDemandDetail>,
            },
          ],
        },
        {
          path: '/build-map/scene-analysis',
          name: '场景分析',
          routes: [
            {
              path: '/build-map/task-create',
              name: '任务创建',
              component: <BuildMapTaskCreate></BuildMapTaskCreate>,
            },
            {
              path: '/build-map/task-detail',
              name: '任务明细',
              component: <BuildMapTaskDetail></BuildMapTaskDetail>,
            },
          ],
        },
      ],
    },
  ],
};
