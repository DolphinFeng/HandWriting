import { createRouter, createWebHashHistory } from "vue-router";
import login from "../components/login.vue";
import TaskComponents from "../task/TaskComponents.vue";
import workComponents from "../workPage/workComponents.vue";
import TaskTypeComponents from "../taskType/TaskTypeComponents.vue";
import FunctionComponent from "../function/FunctionComponent.vue";
import JobComponent from "../job/JobComponent.vue";
import ExecutionEngineComponent from "../executionEngine/ExecutionEngineComponent.vue";
import ProcessComponents from "../process/ProcessComponents.vue";
import ProductComponent from "../productPms/version/ProductComponent.vue";
import DifferenceFile from "../productPms/difference/DifferenceFile.vue";
import MaterialComponent from "../material/taskMaterial/MaterialComponent.vue";
import CollectionMaterialManager from "../material/collectionMaterial/CollectionMaterialManager.vue";
import RulesComponent from "../CheckPage/rules/RulesComponent.vue";
import CheckComponent from "../CheckPage/check/CheckComponent.vue";
import ExecutionComponent from "../CheckPage/execution/ExecutionComponent.vue";
import ResultsComponent from "../CheckPage/results/ResultsComponent.vue";
import ExceptionComponent from "../CheckPage/exception/ExceptionComponent.vue";
import VersionComponent from "../version/VersionComponent.vue";
import CaseComponent from "../case/CaseComponent.vue";
import CaseHistoryComponent from "../case/CaseHistoryComponent.vue";
import CaseProjectComponent from "../case/CaseProjectComponent.vue";
import CaseCollectionComponent from "../case/CaseCollectionComponent.vue";
import CollectMapComponent from "../case/CollectMapComponent.vue";
import PowerFileComponent from "../powerStation/file/PowerFileComponent.vue";
import PowerSettingComponent from "../powerStation/setting/PowerSettingComponent.vue";
import PowerReleaseComponent from "../powerStation/release/PowerReleaseComponent.vue";
import CloudVersion from "@/powerStation/cloud/CloudVersion.vue";
import AccountSetup from "../account/AccountSetup.vue";
import UserSet from "../users/UserSet.vue";
import RoleManagement from "../role/RoleManagement.vue";
import MenuManagement from "../menu/MenuManagement.vue";
import PublishPageComponent from "../publish/publishPage/PublishPageComponent.vue";
import PublishDetail from "../publish/publishPage/PublishDetail.vue";
import ProjectPageComponent from "../publish/projectPage/ProjectPageComponent.vue";
// import ConfigurePageComponent from "../publish/configurePage/ConfigurePageComponent.vue"
import MeshOccupation from "@/meshOccupation/MeshOccupation.vue";
import DrafterComponent from "@/drafter/DrafterComponent.vue";
import HDMapIssue from "@/HDMap/HDMapIssue.vue";
// 停车场管理对应的组件
import ParkingLotFileComponent from "../parkingLot/file/ParkingLotFile.vue";
import ParkingCollectionComponent from "../parkingLot/parkingCollection/ParkingCollectionMaterial.vue";
import ParkingMappingListComponent from "../parkingLot/parkingMappingList/ParkingMappingList.vue";
import ParkingLotDetailComponent from "../parkingLot/detail/ParkingLotDetail.vue";
import CollectTaskListComponent from "../parkingLot/collectTask/CollectTaskList.vue";
import ParkingLotReleaseComponent from "../parkingLot/release/ParkingLotRelease.vue";
import AutoQAPackages from "../parkingLot/autoQA/packages/AutoQAPackages.vue";
import AutoQAApprove from "../parkingLot/autoQA/approve/AutoQAApprove.vue";
import DiffSourceComponent from "../diff-source/DiffSource.vue";
import TrueValueSystem from "../system/TrueValueSystem.vue";

import store from "@/store";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", redirect: "/login" },
    {
      path: "/login",
      name: "login",
      meta: { title: "登录" },
      component: login,
    }, // {path: '/MapPage', name: 'MapPage', meta: {title: '地图管理'}, component: ViewMap},
    // {path: '/InfoUploadPage', name: 'InfoUploadPage', meta: {title: '信息上传'}, component: InfoUploadPage},
    // {path: '/InfoCheckPage', name: 'InfoCheckPage', meta: {title: '信息检查'}, component: InfoCheckPage},
    {
      path: "/TaskPage",
      name: "TaskPage",
      meta: { title: "任务管理" },
      component: TaskComponents,
    },
    {
      path: "/WorkPage",
      name: "WorkPage",
      meta: { title: "作业管理" },
      component: workComponents,
    },
    {
      path: "/TaskTypePage",
      name: "TaskTypePage",
      meta: { title: "任务类型管理" },
      component: TaskTypeComponents,
    },
    {
      path: "/drafter",
      name: "DrafterComponent",
      meta: { title: "编排服务" },
      component: DrafterComponent,
    },
    {
      path: "/MeshOccupation",
      name: "MeshOccupation",
      meta: { title: "占图服务" },
      component: MeshOccupation,
    },
    {
      path: "/HDMapIssue",
      name: "HDMapIssue",
      meta: { title: "HdMap Issue" },
      component: HDMapIssue,
    },
    {
      path: "/PublishPage",
      name: "PublishPage",
      meta: { title: "发布版本管理" },
      component: PublishPageComponent,
      children: [
        {
          path: 'PublishDetail',
          name: 'PublishDetail',
          component: PublishDetail
        }
      ]
    },
    {
      path: "/ProjectPage",
      name: "ProjectPage",
      meta: { title: "项目管理" },
      component: ProjectPageComponent,
    },
    // {
    //     path: '/ConfigurePage', name: 'ConfigurePage', meta: {title: '项目配置管理'}, component: ConfigurePageComponent
    // },

    {
      path: "/FunctionPage",
      name: "FunctionPage",
      meta: { title: "接口管理" },
      component: FunctionComponent,
    },
    {
      path: "/JobPage",
      name: "JobPage",
      meta: { title: "Job管理" },
      component: JobComponent,
    },
    {
      path: "/ExecutionEnginePage",
      name: "ExecutionEngine",
      meta: { title: "引擎管理" },
      component: ExecutionEngineComponent,
    },
    {
      path: "/ProcessPage",
      name: "ProcessPage",
      meta: { title: "流程管理" },
      component: ProcessComponents,
    },
    {
      path: "/ProductPagePms",
      name: "ProductPagePms",
      meta: { title: "产品管理" },
      component: ProductComponent,
    },
    {
      path: "/DifferenceFile",
      name: "DifferenceFile",
      meta: { title: "差分管理" },
      component: DifferenceFile,
    },
    {
      path: "/MaterialPage",
      name: "MaterialPage",
      meta: { title: "资料管理" },
      component: MaterialComponent,
    },
    {
      path: "/CollectionMaterialPage",
      name: "CollectionMaterialPage",
      meta: { title: "采集资料管理" },
      component: CollectionMaterialManager,
    }, // {path: '/ResourcePage', name: 'ResourcePage', meta: {title: '资源管理'}, component: ResourceComponent},
    {
      path: "/RulesPage",
      name: "RulesPage",
      meta: { title: "规则管理" },
      component: RulesComponent,
    },
    {
      path: "/CheckPage",
      name: "CheckPage",
      meta: { title: "套餐管理" },
      component: CheckComponent,
    },
    {
      path: "/ExecutionPage",
      name: "ExecutionPage",
      meta: { title: "执行记录" },
      component: ExecutionComponent,
    },
    {
      path: "/ResultsPage",
      name: "ResultsPage",
      meta: { title: "检查结果" },
      component: ResultsComponent,
    },
    {
      path: "/ExceptionPage",
      name: "ExceptionPage",
      meta: { title: "例外管理" },
      component: ExceptionComponent,
    },
    {
      path: "/PowerStation/File",
      name: "PowerFilePage",
      meta: { title: "换电站资料" },
      component: PowerFileComponent,
    },
    {
      path: "/PowerStation/Setting",
      name: "PowerSettingPage",
      meta: { title: "换电站清单" },
      component: PowerSettingComponent,
    },
    {
      path: "/PowerStation/Release",
      name: "PowerReleasePage",
      meta: { title: "换电站发版" },
      component: PowerReleaseComponent,
    },
    {
      path: "/PowerStation/Cloud",
      name: "CloudVersion",
      meta: { title: "点云发版管理" },
      component: CloudVersion,
    },
    {
      path: "/VersionPage",
      name: "VersionPage",
      meta: { title: "版本管理" },
      component: VersionComponent,
    },
    {
      path: "/Case/CasePage",
      name: "CasePage",
      meta: { title: "case页面" },
      component: CaseComponent,
    },
    {
      path: "/Case/CaseHistoryPage",
      name: "CaseHistoryPage",
      meta: { title: "case历史页面" },
      component: CaseHistoryComponent,
    },
    {
      path: "/Case/CaseProjectPage",
      name: "CaseProjectPage",
      meta: { title: "项目页面" },
      component: CaseProjectComponent,
    },
    {
      path: "/Case/CollectionPage",
      name: "CollectionPage",
      meta: { title: "采集建图" },
      component: CaseCollectionComponent,
    },
    {
      path: "/AccountPage",
      name: "AccountPage",
      meta: { title: "账户设置" },
      component: AccountSetup,
    },
    {
      path: "/UserPage",
      name: "UserPage",
      meta: { title: "用户管理" },
      component: UserSet,
    },
    {
      path: "/RolePage",
      name: "RolePage",
      meta: { title: "角色管理" },
      component: RoleManagement,
    },
    {
      path: "/MenuPage",
      name: "MenuPage",
      meta: { title: "菜单管理" },
      component: MenuManagement,
    },
    {
      path: "/:pathMatch(.*)",
      name: "notFound",
      meta: { title: "404" },
      component: () => import("../error/404.vue"),
    },
    // 停车场管理
    {
      path: "/ParkingLot/File",
      name: "ParkingLotFile",
      meta: { title: "停车场建图资料" },
      component: ParkingLotFileComponent,
    },
    {
      path: "/ParkingLot/parkingCollection",
      name: "parkingCollection",
      meta: { title: "停车场采集资料" },
      component: ParkingCollectionComponent,
    },
    {
      path: "/ParkingLot/parkingMappingList",
      name: "parkingMappingList",
      meta: { title: "停车场建图任务列表" },
      component: ParkingMappingListComponent,
    },
    {
      path: "/ParkingLot/collectionTask",
      name: "collectionTask",
      meta: { title: "采集任务管理" },
      component: CollectTaskListComponent,
    },
    {
      path: "/ParkingLot/autoQAPackage",
      name: "autoQAPackage",
      meta: { title: "autoQA套餐管理" },
      component: AutoQAPackages,
    },
    {
      path: "/ParkingLot/autoQAApprove",
      name: "autoQAApprove",
      meta: { title: "autoQA准出" },
      component: AutoQAApprove,
    },
    {
      path: "/ParkingLot/Detail",
      name: "ParkingLotDetail",
      meta: { title: "停车场详情" },
      component: ParkingLotDetailComponent,
    },
    {
      path: "/ParkingLot/release",
      name: "ParkingLotRelease",
      meta: { title: "停车场详情" },
      component: ParkingLotReleaseComponent,
    },
    {
      path: "/diff-source/index",
      name: "DiffSource",
      meta: { title: "变化源管理" },
      component: DiffSourceComponent,
    },
    {
      path: "/TrueValueSystem",
      name: "TrueValueSystem",
      meta: { title: "真值评测系统" },
      component: TrueValueSystem,
    },
  ],
});
let attemptedUrl = '/TaskPage'; // 默认重定向页面

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('token'); // 使用 localStorage 检查登录状态
  console.log('Navigating to:', to.fullPath); // 调试信息

  if (!isLoggedIn && to.path !== '/login') {
    console.log('Storing attempted URL:', to.fullPath); // 调试信息
    store.commit('setAttemptedUrl', to.fullPath); // 存储用户尝试访问的 URL
    next('/login'); // 重定向到登录页面
  } else {
    next();
  }
});
router.afterEach((to, from) => {
  document.title = `${to.meta.title} - NIO地图平台`;
});

// export { attemptedUrl }; // Export attemptedUrl

export default router;
