<template>
  <!-- 地图页面的搜索栏组件 -->
  <div class="MapSearch">
    <div
      class="MapSearchContainer"
      :style="`width: ${searchOptions.width};`"
    >
      <el-input
        v-model="tileInput"
        :placeholder="searchOptions.tilePlaceholder"
        clearable
        @keyup.enter.native="searchData.search"
      >
        <template slot="append">
          <i
            class="el-icon-search"
            @click="searchData.search"
          />
        </template>
      </el-input>
    </div>
    <div
      class="MapSearchContainer"
      :style="`width: ${searchOptions.width};`"
    >
      <el-input
        v-model="taskInput"
        :placeholder="searchOptions.taskPlaceholder"
        clearable
        @keyup.enter.native="searchData.searchByTask"
      >
        <template slot="append">
          <i
            class="el-icon-search"
            @click="searchData.searchByTask"
          />
        </template>
      </el-input>
    </div>
  </div>

</template>

<script>
export default {
  name: 'MapSearch',
  // 组件注册
  components: {},
  // 接收父组件传来的参数
  props: {
    searchOptions: {
      width: String,
      tilePlaceholder: String,
      taskPlaceholder: String,
    },
    searchData: Object,
  },
  data() {
    return {
      tileInput: '',
      taskInput: '',
    };
  },
  computed: {},
  watch: {
    // eslint-disable-next-line no-unused-vars
    tileInput(val, oldval) {
      this.searchData.input(val);
    },
    taskInput(val, oldval) {
      this.searchData.input(val);
    },
  },
  mounted() {},
  methods: {},
};
</script>

<style lang='scss' scoped>
.MapSearch{
  display: inline-block;
  margin-top: 8px;
}
.MapSearchContainer {
  display: inline-block;
  margin-left: 10px;
  :deep(.el-input__inner) {
    border: 1px solid #dddede;
    border-right: 0;
    height: 28px;
    padding-right: 10px;
    font-size: 12px;
  }
  :deep(.el-input-group__append) {
    border: 1px solid #dddede;
    border-left: 0;
    background: #fff;
    padding-left: 5px;
    padding-right: 10px;
    color: #999;
    font-size: 18px;
  }
  :deep(.el-input__icon) {
    margin-top: -4px;
  }
}
</style>
