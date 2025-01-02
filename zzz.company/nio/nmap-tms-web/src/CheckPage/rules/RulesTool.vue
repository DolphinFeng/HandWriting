<template>
  <!-- 搜索工具栏组件 -->
  <div id="RulesTool" class="tool">
    <el-form inline :data="RulesForm" ref="form" @submit.prevent="onSearch">
      <el-form-item label="目标要素：" name="targetTables">
        <el-select
            v-model="RulesForm.tables"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择目标要素"
            clearable
            style="width: 160px"
        >
          <el-option
              v-for="target in targets"
              :label="target"
              :key="target"
              :value="target"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="重要等级：" name="impLevels">
        <el-checkbox-group v-model="RulesForm.impLevels">
          <el-checkbox-button v-for="level in LevelsList" :label="level" :key="level">{{level}}</el-checkbox-button>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="规则编号：" name="ruleCode">
        <el-input v-model="RulesForm.ruleCode" placeholder="请输入规则编号" style="width: 160px" clearable></el-input>
      </el-form-item>
      <el-form-item label="错误描述：" name="errDesc">
        <el-input v-model="RulesForm.errDesc" placeholder="请输入错误描述" style="width: 160px" clearable></el-input>
      </el-form-item>
      <div style="height: 36px;">
        <el-button :icon="Search" type="primary" native-type="submit">查询</el-button>
        <el-button :icon="Refresh" @click="reSet">重置</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
  // 引入js数据
  import {targetsList, LevelsList} from "../../js/check_data";
  import {Search, Refresh} from "@element-plus/icons-vue";

  export default {
    name: "RulesTool",
    // 接收父组件传来的参数
    props: {
      RulesForm: Object,
    },
    data() {
      return {
        // 初始化目标要素数据集
        targets: ['Road', 'Name', 'NameRelation', 'RoadAttribute', 'RoadNode', 'RoadConnectivity', 'CSH', 'HSRelation', 'JunctionArea', 'LaneMarking', 'LaneMarkingAttribute', 'Lane', 'LaneConnectivity', 'FeaturePoint', 'RoadMark', 'TrafficSign', 'SubTrafficSign', 'RestrictionGroup', 'RestrictionPoint', 'RestrictionLine', 'LineFacility', 'TrafficLight', 'StopLine', 'TrafficControl', 'ObjectRelation', 'Tile', 'Admin', 'SourceInfo', 'LaneAttribute', 'Lamp', 'Toll', 'SiteArea',],
        // 标识展开：true 或 收回：false
        is_target: true,
        // 重要等级数据集
        LevelsList: LevelsList
      }
    },
    setup() {
      return {
        Search, Refresh,
      }
    },
    methods: {
      // 重要等级：全部按钮功能
      getAllLevel() {
        this.RulesForm.impLevels = LevelsList;
      },
      // 筛选查询功能
      onSearch() {
        this.$emit('onSearch');
      },
      // 重置功能
      reSet() {
        this.$emit('reSet');
      }
    },
  }
</script>

<style scoped>
  .el-form-item {
    margin-bottom: 10px;
  }

</style>
