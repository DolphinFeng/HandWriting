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
                <span style="margin-left: 14px;user-select: none">NIO先验事件平台</span>
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
                <el-menu-item index="/DataCollectPage">
                  <el-icon>
                    <Menu />
                  </el-icon>
                  <template #title>数据收集</template>
                </el-menu-item>

                <el-sub-menu index="/Issue">
                  <template #title>
                    <el-icon>
                      <Menu />
                    </el-icon>
                    <span>事件制作</span>
                  </template>
                  <el-menu-item index="/BindPage">绑定</el-menu-item>
                  <el-menu-item index="/ClusterPage">聚合</el-menu-item>
                  <el-menu-item index="/InheritPage">继承</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="/Task">
                  <template #title>
                    <el-icon>
                      <Menu />
                    </el-icon>
                    <span>成果管理</span>
                  </template>
                  <el-menu-item index="/GeneratePage">批量生成</el-menu-item>
                  <el-menu-item index="/DriveTestPage">路测取反</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="/Operation">
                  <template #title>
                    <el-icon>
                      <Menu />
                    </el-icon>
                    <span>线上运营</span>
                  </template>
                  <el-menu-item index="/GrayManagePage">灰度管理</el-menu-item>
                  <el-menu-item index="/ShowPage">可视化展示</el-menu-item>
                  <el-menu-item index="/RecordPage">上下线记录</el-menu-item>
                  <el-menu-item index="/DataPage">数据监控</el-menu-item>
                  <el-menu-item index="/ServicePage">服务监控</el-menu-item>
                  <el-menu-item index="/EffectPage">效果监控</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="/Tool">
                  <template #title>
                    <el-icon>
                      <Menu />
                    </el-icon>
                    <span>常用工具</span>
                  </template>
                  <el-menu-item index="/AnalysePage">统计分析</el-menu-item>
                  <el-menu-item index="/TransPage">数据转换</el-menu-item>
                  <el-menu-item index="/SearchPage">数据查询</el-menu-item>
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

import { useRoute, useRouter } from 'vue-router';
import { nextTick, onBeforeMount, onMounted, provide, reactive, ref } from "vue";
import axios from "axios";
import zhCn from 'element-plus/dist/locale/zh-cn';
import { useDark, useToggle } from '@vueuse/core';
import { DOMAIN_MAP_TMS } from "./api/index";
let Domain = DOMAIN_MAP_TMS[window.location.hostname];
if (Domain === undefined) {
  Domain = 'http://nmap-tms-rbac.idc-uat.nioint.com';
}

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
      GeneratePageShow: false,
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
    const initMenu = ref("GeneratePage");

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
      refreshHeader.value = false;
      refreshAside.value = false;
      nextTick(() => {
        Object.assign(menuShow, {
          GeneratePageShow: false,
          workPageShow: false,
          accountPageShow: false,
          configTitleShow: false,
          userPageShow: false,
          rolePageShow: false,
          menuPageShow: false,
        });
        promission.push(...sessionStorage.getItem("promission"));
        setTimeout(() => {
          isShow();
          refreshHeader.value = true;
          refreshAside.value = true;
          realName.value = sessionStorage.getItem("realName");
        }, 5);
      });
    }

    function isShow() {
      // 判断是否显示标签页
      if (promission.length !== 0) {
        if (promission.indexOf(12) !== -1) {
          menuShow.GeneratePageShow = true;
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
          menuShow.GeneratePageShow = true;
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
      initMenu.value = "GeneratePage";
      // 退出登录接口
      axios({
        url: Domain + "/user/v1/loginOut",
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
          // 清空sessionStorage
          sessionStorage.clear();
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
      initMenu.value = (curPath === '' || curPath === '/' ? '/GeneratePage' : curPath);
    });

    onMounted(() => {
      //设置高度
      const app_div = document.getElementById("app");
      app_div.style.height = "100%";
      aside_style.height = window.outerHeight;
      if (window.location.hash > 2) {
        reLoad();
      } else {
        refreshHeader.value = false;
        refreshAside.value = false;
      }
      if (sessionStorage.length === 0) {
        routerPush("login");
      } else {
        // this.token = sessionStorage.getItem("token");
        reLoad();
        realName.value = sessionStorage.getItem("realName");
      }
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
