<template>
  <el-config-provider :locale="local">
    <div id="app">
      <div class="tdesign-demo-item--layout">
        <section style="width: 100%; height: 100vh;">
          <header v-if="refreshHeader" style="height: 64px;" id="refreshHeader">
            <div class="top-head">
              <div id="nioTitle">
                <el-icon style="line-height: 1" :title="collapse ? '打开菜单' : '折叠菜单'"
                  :class="collapse ? 'collapseRotate' : ''" class="menu-collapse" @click="collapseMenu">
                  <Fold class="menu-animate" />
                </el-icon>
                <span style="margin-left: 14px;user-select: none">NIO地图平台</span>
              </div>
              <div id="accountDiv">
                <div class="header-icon-item" style="margin-right: 10px;" @click="fullScreen" @mouseenter="iconAnimate"
                  @mouseleave="iconAnimateEnd">
                  <div ref="fullTag" class="animate__animated">
                    <el-icon v-if="!fullState">
                      <FullScreen />
                    </el-icon>
                    <i v-else class="iconfont icon-Exitfullscreenminimizeshrink"></i>
                  </div>
                </div>
                <!--                <div class="header-icon-item" style="margin-right: 10px;width: 160px">-->
                <!--                  <span style="font-size: 12px;" @click.stop="toggleDark()">暗黑模式</span>-->
                <!--                  <el-switch size="small" v-model="isDark"></el-switch>-->
                <!--                </div>-->
                <el-popover popper-class="el-popover-self" trigger="hover" placement="bottom-end" :width="100">
                  <template #reference>
                    <div id="accountUser" slot="reference">
                      <el-avatar src="static/img/avator.jpeg" :size="28" fit="cover"></el-avatar>
                      <div style="margin: 0 6px;">{{ realName }}</div>
                      <el-icon>
                        <ArrowDown />
                      </el-icon>
                    </div>
                  </template>
                  <template #default>
                    <div class="avatar-pop-menu">
                      <div @click="router40x('404')">404</div>
                      <div title="退出登录" @click.stop="outLogin">退出登录</div>
                    </div>
                  </template>
                </el-popover>
              </div>
            </div>
          </header>

          <section class="nio-body">
            <aside v-if="refreshAside" :style="aside_style" class="aside_class" id="refreshAside">
              <el-menu router :default-active="$store.state.menuItem" class="el-menu-vertical-demo"
                style="height: 100%;overflow: auto;-ms-overflow-style: none;" background-color="#545c64" text-color="#fff"
                active-text-color="#ffd04b" :collapse="collapse">
                <el-sub-menu index="/Task">
                  <template #title>
                    <el-icon>
                      <Menu />
                    </el-icon>
                    <span>量产任务中心</span>
                  </template>
                  <el-menu-item index="/TaskPage">任务管理</el-menu-item>
                  <el-menu-item index="/WorkPage">作业管理</el-menu-item>
                  <el-menu-item index="/TaskTypePage">任务类型管理</el-menu-item>
                  <el-menu-item index="/drafter">任务编排</el-menu-item>
                  <el-menu-item index="/MeshOccupation">占图服务</el-menu-item>
                  <el-menu-item index="/HDMapIssue">HdMap Issue</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="/Publish">
                  <template #title>
                    <el-icon>
                      <Memo />
                    </el-icon>
                    <span>发布管理</span>
                  </template>
                  <el-menu-item index="/PublishPage">发布版本管理</el-menu-item>
                  <el-menu-item index="/ProjectPage">项目管理</el-menu-item>
                  <!-- <el-menu-item index="/ConfigurePage">项目配置管理</el-menu-item> -->
                </el-sub-menu>

                <el-sub-menu index="/Process">
                  <template #title>
                    <el-icon>
                      <Histogram />
                    </el-icon>
                    <span>工作流引擎</span>
                  </template>
                  <el-menu-item index="/FunctionPage">接口管理</el-menu-item>
                  <el-menu-item index="/ExecutionEnginePage">引擎管理</el-menu-item>
                  <el-menu-item index="/JobPage">Job管理</el-menu-item>
                  <el-menu-item index="/ProcessPage">流程管理</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="/">
                  <template #title>
                    <el-icon>
                      <Edit />
                    </el-icon>
                    <span>数据管理平台</span>
                  </template>
                  <el-menu-item index="/ProductPagePms">产品管理</el-menu-item>
                  <el-menu-item index="/DifferenceFile">差分管理</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="/Material">
                  <template #title>
                    <el-icon>
                      <Document />
                    </el-icon>
                    <span>资料管理</span>
                  </template>
                  <el-menu-item index="/MaterialPage">任务管理</el-menu-item>
                  <el-menu-item index="/CollectionMaterialPage">采集资料管理</el-menu-item>
                </el-sub-menu>

                <!-- <el-menu-item index="/MaterialPage">
                  <el-icon><Document /></el-icon>
                  <template #title>资料管理</template>
                </el-menu-item> -->

                <el-sub-menu index="/Check">
                  <template #title>
                    <el-icon>
                      <Stamp />
                    </el-icon>
                    <span>检查服务</span>
                  </template>
                  <el-menu-item index="/RulesPage">规则管理</el-menu-item>
                  <el-menu-item index="/CheckPage">套餐管理</el-menu-item>
                  <el-menu-item index="/ExecutionPage">执行记录</el-menu-item>
                  <el-menu-item index="/ResultsPage">检查结果</el-menu-item>
                  <el-menu-item index="/ExceptionPage">例外管理</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="/PowerStation">
                  <template #title>
                    <el-icon>
                      <OfficeBuilding />
                    </el-icon>
                    <span>换电站管理</span>
                  </template>
                  <el-menu-item index="/PowerStation/File">换电站资料</el-menu-item>
                  <el-menu-item index="/PowerStation/Setting">换电站清单</el-menu-item>
                  <el-menu-item index="/PowerStation/Cloud">点云发版管理</el-menu-item>
                  <el-menu-item index="/PowerStation/Release">换电站发版</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="/ParkingLot">
                  <template #title>
                    <el-icon>
                      <Guide />
                    </el-icon>
                    <span>PN/PSP管理</span>
                  </template>
                  <el-menu-item index="/ParkingLot/Detail">业务场景详情</el-menu-item>
                  <el-menu-item index="/ParkingLot/collectionTask">采集任务管理</el-menu-item>
                  <el-menu-item index="/ParkingLot/parkingCollection">采集资料管理</el-menu-item>
                  <el-menu-item index="/ParkingLot/parkingMappingList">建图任务列表</el-menu-item>
                  <el-menu-item index="/ParkingLot/File">建图资料管理</el-menu-item>
                  <el-menu-item index="/ParkingLot/autoQAPackage">autoQA套餐管理</el-menu-item>
                  <el-menu-item index="/ParkingLot/autoQAApprove">autoQA准出</el-menu-item>
                  <el-menu-item index="/ParkingLot/release">停车场发版</el-menu-item>
                </el-sub-menu>

                <el-menu-item index="/diff-source/index">
                  <el-icon>
                    <ScaleToOriginal />
                  </el-icon>
                  <template #title>变化源管理</template>
                </el-menu-item>

                <el-menu-item index="/VersionPage">
                  <el-icon>
                    <Setting />
                  </el-icon>
                  <template #title>版本管理</template>
                </el-menu-item>

                <el-sub-menu index="/Case">
                  <template #title>
                    <el-icon>
                      <Guide />
                    </el-icon>
                    <span>Case管理</span>
                  </template>
                  <el-menu-item index="/Case/CasePage">case页面</el-menu-item>
                  <el-menu-item index="/Case/CaseProjectPage">项目页面</el-menu-item>
                  <el-menu-item index="/Case/CollectionPage">采集建图</el-menu-item>
                </el-sub-menu>

                <el-menu-item index="/AccountPage">
                  <el-icon>
                    <UserFilled />
                  </el-icon>
                  <template #title>账户设置</template>
                </el-menu-item>

                <el-sub-menu index="/Config">
                  <template #title>
                    <el-icon>
                      <Tools />
                    </el-icon>
                    <span>配置管理</span>
                  </template>
                  <el-menu-item index="/UserPage">用户管理</el-menu-item>
                  <el-menu-item index="/RolePage">角色管理</el-menu-item>
                  <el-menu-item index="/MenuPage">菜单管理</el-menu-item>
                </el-sub-menu>
                <el-menu-item index="/TrueValueSystem">
                  <el-icon>
                    <Setting />
                  </el-icon>
                  <template #title>真值评测系统</template>
                </el-menu-item>
              </el-menu>
            </aside>
            <div id="main-wrapper">
              <router-view #default="{ Component }">
                <transition name="fade" mode="out-in">
                  <component style="height: 100%;" :is="Component" />
                </transition>
              </router-view>
            </div>
          </section>
        </section>
      </div>
    </div>
  </el-config-provider>
</template>

<script>
import { ElMessage, ElMessageBox } from "element-plus";

const detectBack = {
  initialize: function () {
    //监听 hashchange 事件
    window.addEventListener(
      "hashchange",
      () => {
        // 在搜索框删除路由名称
        if (window.location.hash === "#/") {
          // 设置Header不显示
          let refreshHeader = document.getElementById("refreshHeader");
          refreshHeader.style.display = "none";
          // 侧边栏隐藏显示
          let refreshAside = document.getElementById("refreshAside");
          refreshAside.style.display = "none";
        }
        //先判断，避免报错；为当前导航页附加一个 tag
        if (history !== undefined) {
          history.replaceState("hasHash", "", "");
        }
      },
      false
    );
  },
};
detectBack.initialize();

const nioUrl = window.api.apiNioURL;
import { useRoute, useRouter } from 'vue-router';
import { nextTick, onBeforeMount, onMounted, provide, reactive, ref } from "vue";
import axios from "axios";
import zhCn from 'element-plus/dist/locale/zh-cn';
import { useDark, useToggle } from '@vueuse/core';

export default {
  name: "App",
  setup() {
    const isDark = useDark();
    const toggleDark = useToggle(isDark);
    const router = useRouter();
    const route = useRoute();

    const fullState = ref(false);

    const refreshHeader = ref(true);
    const refreshAside = ref(true);

    const asideWidth = ref(231);

    const fullTag = ref(null);

    const aside_style = reactive({
      height: "100%",
    });
    const promission = reactive([]);
    const collapse = ref(localStorage.getItem("collapse") !== "false");
    const menuShow = reactive({
      mapPageShow: false,
      TaskPageShow: false,
      workPageShow: false,
      InformationTitleShow: false,
      InfoUploadPageShow: false,
      InfoCheckPageShow: false,
      ProductTitleShow: false,
      ProductPrePageShow: false,
      ProductPageShow: false,
      accountPageShow: false,
      configTitleShow: false,
      userPageShow: false,
      rolePageShow: false,
      menuPageShow: false,
    });
    const expanded = reactive(['task']);
    const realName = ref("");
    const initMenu = ref("TaskPage");

    function router40x(path) {
      router.push(path);
      initMenu.value = '';
    }
    function outLogin() {
      ElMessageBox.confirm('确认要退出登录吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        showClose: false,
        customStyle: {
          zIndex: 99999999,
        }
      }).then(res => {
        handleExit();
      }).catch(() => {
      });
    }
    //进入or退出全屏
    function fullScreen() {
      if (fullState.value) {
        //退出全屏
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document['mozCancelFullScreen']) {
          document['mozCancelFullScreen']();
        } else if (document['webkitCancelFullScreen']) {
          document['webkitCancelFullScreen']();
        } else if (document['msExitFullscreen']) {
          document['msExitFullscreen']();
        } else {
          ElMessage.error({
            message: "退出失败，请联系开发人员",
            showClose: true,
          });
        }
      } else {
        //进入全屏
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
          document.documentElement.webkitRequestFullScreen();
        } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen();
        } else {
          ElMessage({
            type: 'error',
            message: "您的浏览器不支持全屏浏览",
            showClose: true,
          });
        }
      }
      fullState.value = !fullState.value;
    }

    function iconAnimate() {
      fullTag.value.classList.add('animate__bounceIn');
    }

    function iconAnimateEnd() {
      fullTag.value.classList.remove('animate__bounceIn');
    }

    function routerPush(val) {
      router.push({ name: val, }).catch((err) => { });
    }

    provide('reLoad', reLoad);

    function reLoad() {
      refreshHeader.value = true;
      refreshAside.value = true;
      nextTick(() => {
        Object.assign(menuShow, {
          TaskPageShow: false,
          workPageShow: false,
          accountPageShow: false,
          configTitleShow: false,
          userPageShow: false,
          rolePageShow: false,
          menuPageShow: false,
        });
        promission.push(...localStorage.getItem("promission"));
        setTimeout(() => {
          isShow();
          refreshHeader.value = true;
          refreshAside.value = true;
          realName.value = localStorage.getItem("realName");
        }, 5);
      });
    }

    function isShow() {
      // 判断是否显示标签页
      if (promission.length !== 0) {
        if (promission.indexOf(12) !== -1) {
          menuShow.taskPageShow = true;
        }
        if (promission.indexOf(13) !== -1) {
          menuShow.userPageShow = true;
          menuShow.configTitleShow = true;
        }
        if (
          promission.indexOf(14) !== -1 ||
          promission.indexOf(27) !== -1
        ) {
          menuShow.accountPageShow = true;
        }
        if (promission.indexOf(15) !== -1) {
          menuShow.rolePageShow = true;
          menuShow.configTitleShow = true;
        }
        if (promission.indexOf(16) !== -1) {
          menuShow.menuPageShow = true;
          menuShow.configTitleShow = true;
        }
        if (promission.indexOf(43) !== -1) {
          menuShow.ProductPageShow = true;
          menuShow.ProductTitleShow = true;
        }
        if (promission.indexOf(52) !== -1) {
          menuShow.ProductPrePageShow = true;
          menuShow.ProductTitleShow = true;
        }
        if (promission.indexOf(50) !== -1) {
          menuShow.mapPageShow = true;
        }
        if (promission.indexOf(56) !== -1) {
          menuShow.TaskPageShow = true;
        }
        // 情报管理
        if (promission.indexOf(66) !== -1) {
          menuShow.InfoUploadPageShow = true;
          menuShow.InformationTitleShow = true;
        }
        if (promission.indexOf(69) !== -1) {
          menuShow.InfoCheckPageShow = true;
          menuShow.InformationTitleShow = true;
        }
        if (promission.indexOf(72) !== -1) {
          menuShow.workPageShow = true;
        }
      }
    }

    function handleExit() {
      //重置默认菜单
      initMenu.value = "TaskPage";
      // 退出登录接口
      axios({
        url: nioUrl + "/user/v1/loginOut",
        method: "post",
        data: {
          username: realName.value,
        },
      }).then((response) => {
        if (response.data.code === 0) {
          // 设置Header不显示
          let refreshHeader = document.getElementById("refreshHeader");
          refreshHeader.style.display = "none";
          // 设置侧边栏不显示
          let refreshAside = document.getElementById("refreshAside");
          refreshAside.style.display = "none";
          // 跳转路由
          setTimeout(() => {
            routerPush("login");
          }, 5);
          // 清空 localStorage 中的 realName
          localStorage.clear();
          ElMessage.success({
            message: "安全退出成功！",
            showClose: true,
          });
        } else {
          ElMessage.error({
            message: "退出失败",
            showClose: true,
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: "退出失败",
          showClose: true,
        });
      });
    }

    function collapseMenu() {
      collapse.value = !collapse.value;
      localStorage.setItem("collapse", collapse.value.toString());
    }

    onBeforeMount(() => {
      if (window.location.hash > 2) {
        reLoad();
      } else {
        // 当时登录页面'#/'时，不显示header、侧边栏
        refreshHeader.value = false;
        refreshAside.value = false;
      }
      let curPath = route.path;
      initMenu.value = (curPath === '' || curPath === '/' ? '/TaskPage' : curPath);
    });

    onMounted(() => {
      // 初始化 localStorage 数据
      if (!localStorage.getItem('promission')) {
        const promissionFromLocalStorage = localStorage.getItem('promission');
        if (promissionFromLocalStorage) {
          localStorage.setItem('promission', promissionFromLocalStorage);
        } else {
          localStorage.setItem('promission', JSON.stringify([]));
        }
      }
      if (!localStorage.getItem('realName')) {
        const realNameFromLocalStorage = localStorage.getItem('realName');
        if (realNameFromLocalStorage) {
          localStorage.setItem('realName', realNameFromLocalStorage);
        } else {
          localStorage.setItem('realName', '');
        }
      }

      // 其他初始化逻辑
      if (!localStorage.getItem('token')) {
        routerPush("login");
      } else {
        reLoad();
        realName.value = localStorage.getItem("realName");
        refreshHeader.value = true;
        refreshAside.value = true;
      }

      // 设置高度
      const app_div = document.getElementById("app");
      app_div.style.height = "100%";
      aside_style.height = window.outerHeight;
    });

    return {
      local: zhCn,
      fullTag, realName, fullState, refreshAside, aside_style, collapse, refreshHeader, isDark, toggleDark,
      handleExit, collapseMenu, iconAnimate, iconAnimateEnd, fullScreen, router40x, outLogin,
    }
  },
};
</script>

<style></style>
