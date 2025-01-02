import { createRouter, createWebHashHistory } from "vue-router";
import login from "../components/login.vue";
import BatchGenerates from "../resultManage/BatchGenerates.vue";
import AccountSetup from "../account/AccountSetup.vue";
import UserSet from "../users/UserSet.vue";
import RoleManagement from "../role/RoleManagement.vue";
import MenuManagement from "../menu/MenuManagement.vue";
import DriveTest from "../resultManage/DriveTest.vue";

import store from "@/store";
import IssueBind from "@/issue/IssueBind.vue";
import IssueCluster from "@/issue/IssueCluster.vue";
import IssueInherit from "@/issue/IssueInherit.vue";
import DataCollect from "@/dataCollect/DataCollect.vue";
import VisibleShow from "@/onlineOperate/VisibleShow.vue";
import OnlineOutlineRecord from "@/onlineOperate/OnlineOutlineRecord.vue";
import DataMonitor from "@/onlineOperate/DataMonitor.vue";
import ServiceMonitor from "@/onlineOperate/ServiceMonitor.vue";
import EffectMonitor from "@/onlineOperate/EffectMonitor.vue";
import StatisticsAnalyse from "@/tool/StatisticsAnalyse.vue";
import DataTrans from "@/tool/DataTrans.vue";
import DataSearch from "@/tool/DataSearch.vue";
import GrayManage from "@/onlineOperate/GrayManage.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", redirect: "/login" },
    {
      path: "/login",
      name: "login",
      meta: { title: "登录" },
      component: login,
    },
    {
      path: "/DataCollectPage",
      name: "DataCollectPage",
      meta: { title: "数据收集" },
      component: DataCollect,
    },
    {
      path: "/BindPage",
      name: "BindPage",
      meta: { title: "绑定" },
      component: IssueBind,
    },
    {
      path: "/ClusterPage",
      name: "ClusterPage",
      meta: { title: "聚合" },
      component: IssueCluster,
    },
    {
      path: "/InheritPage",
      name: "InheritPage",
      meta: { title: "继承" },
      component: IssueInherit,
    },
    {
      path: "/GeneratePage",
      name: "GeneratePage",
      meta: { title: "批量生成" },
      component: BatchGenerates,
      props: (route) => ({ 
        productBranchIds: route.query.ids 
      })
    },
    {
      path: "/DriveTestPage",
      name: "DriveTestPage",
      meta: { title: "路测用反" },
      component: DriveTest,
    },
    {
      path: "/GrayManagePage",
      name: "GrayManagePage",
      meta: { title: "灰度管理" },
      component: GrayManage,
    },
    {
      path: "/ShowPage",
      name: "ShowPage",
      meta: { title: "可视化展示" },
      component: VisibleShow,
    },
    {
      path: "/RecordPage",
      name: "RecordPage",
      meta: { title: "上下线记录" },
      component: OnlineOutlineRecord,
    },
    {
      path: "/DataPage",
      name: "DataPage",
      meta: { title: "数据监控" },
      component: DataMonitor,
    },
    {
      path: "/ServicePage",
      name: "ServicePage",
      meta: { title: "服务监控" },
      component: ServiceMonitor,
    },
    {
      path: "/EffectPage",
      name: "EffectPage",
      meta: { title: "效果监控" },
      component: EffectMonitor,
    },
    {
      path: "/AnalysePage",
      name: "AnalysePage",
      meta: { title: "统计分析" },
      component: StatisticsAnalyse,
    },
    {
      path: "/TransPage",
      name: "TransPage",
      meta: { title: "数据转换" },
      component: DataTrans,
    },
    {
      path: "/SearchPage",
      name: "SearchPage",
      meta: { title: "数据查询" },
      component: DataSearch,
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
    }
  ],
});
router.beforeEach((to, from, next) => {
  store.commit("menuChange", to.path);
  store.commit("breadChange", 1);
  next();
});
router.afterEach((to, from) => {
  document.title = `${to.meta.title} - NIO先验事件平台`;
});

export default router;
