<template>
  <!-- 地图页面：底图众包切换按钮 -->
  <div class="change-source">
    <el-switch
      :disabled="disabled"
      v-model="srcState"
      active-text="底图"
      inactive-text="众包"
      active-value="1"
      inactive-value="2"
      @change="switchSource"
    />
  </div>
</template>

<script>
export default {
  name: 'ChangeSource',
  // 接收父组件传来的参数
  props: {
    localSrcState: String,
    disabled: Boolean,
  },
  data() {
    return {
      // 切换按钮绑定的值
      srcState: localStorage.getItem(this.localSrcState) || '1',
    };
  },
  methods: {
    // 切换按钮功能
    switchSource() {
      this.$emit('switchSource',  Number(this.srcState));
      localStorage.setItem(this.localSrcState, Number(this.srcState));
    },
  },
};
</script>

<style lang="scss" scoped>
.change-source {
  position: absolute;
  top: 18px;
  right: -20px;
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
