<template>
  <!-- 地图页面：卫星地图切换按钮 -->
  <div class="change-basemap">
    <el-switch
      v-model="isOpen"
      active-text="卫星"
      inactive-text="地图"
      @change="switchBaseMap"
    />
  </div>
</template>

<script>
export default {
  name: 'ChangeBaseMap',
  data() {
    return {
      // 切换按钮绑定的值
      isOpen: localStorage.getItem('isOpen') !== 'false',
    };
  },
  methods: {
    // 切换按钮功能
    switchBaseMap() {
      this.$emit('switchBaseMap', this.isOpen);
      localStorage.setItem('isOpen', JSON.stringify(this.isOpen));
    },
  },
};
</script>

<style lang="scss" scoped>
.change-basemap {
  position: absolute;
  top: 18px;
  right: 60px;
  display: inline-block;
  z-index: 1000;
  :deep(.el-switch) {
    pointer-events: none;
    .el-switch__core {
      width: 60px !important;
      pointer-events: auto;
    }
    .el-switch__label *{
      font-size: 12px;
      letter-spacing: 3px;
    }
    .el-switch__label--left{
        position: relative;
        left: 62px;
        color: #fff;
        z-index: -1111;
    }
    .el-switch__label--right{
        position: relative;
        right: 62px;
        color: #fff;
        z-index: -1111;
    }
    .el-switch__label--right.is-active{
        z-index: 1001;
        color: #fff !important;
    }
    .el-switch__label--left.is-active{
        z-index: 1001;
        color: #9c9c9c !important;
    }
  }
}
</style>
