<template>
  <!-- 任务管理发起任务：地图预览 -->
  <div class="nio-map">
    <MapView
      :select-tile-ids="preSelectTileIds"
      map-id="EditorMap"
      :is-show-tile-count="true"
      :is-show-tile-detail="true"
      :map-state="mapState"
      local-src-state="srcState"
      @getSelectIds="getSelectIds"
    />
    <div
      class="dialog-footer"
      style="border-top: 1px solid #999; height: 80px"
    >
      <el-button @click="lastStep">
        上一步
      </el-button>
      <el-button
        type="primary"
        @click="nextStep"
      >
        下一步
      </el-button>
    </div>
  </div>
</template>

<script>
import MapView from '../MapView';

export default {
  name: 'EditorMap',
  // 组件注册
  components: {
    MapView,
  },
  // 接收父组件传来的参数
  props: {
    preSelectTileIds: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      mapState: 2, // 可编辑地图
      selectTileIds: [],
    };
  },
  methods: {
    getSelectIds(selectIds) {
      this.selectTileIds = selectIds;
    },
    // 下一步按钮方法
    nextStep() {
      const srcState = localStorage.getItem('srcState') || 1
      const options = {
        selectTileIds: this.selectTileIds,
        srcState: Number(srcState),
        stepCount: 4
      };
      this.$emit('nextStep', options);
    },
    // 上一步按钮方法
    lastStep() {
      this.$emit('lastStep');
    },
  },
};
</script>

<style lang="less" scoped>
@import '../MapView/index.less';
.dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
