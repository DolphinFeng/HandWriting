<template>
  <el-config-provider :locale="zhCn">
    <router-view #default="{ Component }">
      <transition name="fade" mode="out-in">
        <keep-alive>
          <Component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>
  </el-config-provider>
</template>

<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn';

//版本功能替换
if (localStorage.getItem('v1') === null) {
  localStorage.removeItem('searchList');
  localStorage.setItem('v1', 'v1');
}
</script>
<style lang="scss">
* {
  box-sizing: border-box;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}

#app {
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  will-change: opacity, transform;
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
