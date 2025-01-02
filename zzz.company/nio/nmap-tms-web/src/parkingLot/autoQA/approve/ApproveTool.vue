<template>
  <!-- 搜索工具栏组件 -->
  <div id="PackagesTool" :loading="isLoading">
    <el-form inline :data="approveForm" ref="form" @submit.prevent="onSearch">
      <el-form-item label="批次id:" name="mapId">
        <el-input v-model="approveForm.mapId" placeholder="请输入批次id" style="width: 160px;" clearable></el-input>
      </el-form-item>
      <el-form-item label="autoQA套餐:" name="autoqaConfigId">
        <el-select v-model="approveForm.autoqaConfigId" placeholder="请输入autoQA套餐名称" remote filterable clearable
          :remote-method="remoteQuery" loading-text="查询中" no-match-text="没有匹配的autoQA套餐" no-data-text="没有匹配的autoQA套餐"
          :loading="autoqaConfigLoading" style="width: 200px">
          <el-option v-for="item in configNameQueryList" :key="item.id" :label="item.configName" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="业务场景id:" name="businessId">
        <el-input v-model="approveForm.businessId" placeholder="请输入业务场景id" style="width: 160px;" clearable></el-input>
      </el-form-item>
      <el-form-item label="准出情况:" name="permit">
        <el-select v-model="approveForm.permit" placeholder="请选择准出情况" style="width: 160px" clearable>
          <el-option
            v-for="item in approveStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="资料id:" name="materialId">
        <el-input v-model="approveForm.materialId" placeholder="请输入资料id" style="width: 160px;" clearable></el-input>
      </el-form-item>
      <el-form-item label="创建时间:">
        <el-date-picker
          v-model="createTimeRange"
          type="datetimerange"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 420px"
          range-separator="至"
          start-placeholder="任务创建时间区间开始"
          end-placeholder="任务创建时间区间结束"
          @change="onCreateTimeChange">
          </el-date-picker>
      </el-form-item>
      <div>
        <el-button :icon="Search" type="primary" native-type="submit" class="button_style">查询</el-button>
        <el-button :icon="Refresh" @click="reSet" class="button_style">重置</el-button>
        <el-button type="success" :disabled="selectionRows.length === 0" @click="downloadSelect" class="button_style">下载</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
const nioPowerSwapURL = window.api.nioPowerSwapURL;
import axios from "axios";
import { Search, Refresh } from "@element-plus/icons-vue";
import { downloadFileByContent, tableDataToCsvContent } from "@/utils";
import { approveTableColumns } from "@/js/autoqa_data.js";

export default {
  name: "PackagesTool",
  // 接收父组件传来的参数
  props: {
    isLoading: Boolean,
    approveStatusOptions: Array,
    selectionRows: Array
  },
  data() {
    return {
      autoqaConfigLoading: false,
      autoqaConfigName: '',
      configNameQueryList: [],
      createTimeRange: [],
      approveForm: {
        businessType: null,
        businessId: null,
        mapId: null,
        autoqaConfigId: null,
        materialId: null,
        parkingLotId: null,
        permit: null,
        createTimeBegin: null,
        createTimeEnd: null
      }
    }
  },
  setup() {
    return {
      Search, Refresh
    }
  },
  methods: {
    onSearch() {
      this.$emit('onSearch', this.approveForm)
    },
    reSet() {
      this.approveForm = {
        businessType: null,//"PN"
        businessId: null,
        mapId: null,
        autoqaConfigId: null,
        materialId: null,
        permit: null,
        createTimeBegin: null,
        createTimeEnd: null
      };
      this.createTimeRange = []
    },
    remoteQuery(query) {
      if (query == null || query === '') {
        this.configNameQueryList = [];
        return;
      }
      this.autoqaConfigLoading = true;
      axios({
        url: nioPowerSwapURL + '/nio/autoqa/config/list',
        method: 'post',
        data: {
          ...{
            configName: query,
            configDesc: null,
            algVsn: null,
            operator: null
          },
          pageSize: this.pageSize,
          pageNum: this.currentPage - 1,
        }
      }).then(response => {
        if (response.data.code === 0) {
          this.configNameQueryList = response.data.data;
        }
        this.autoqaConfigLoading = false;
      }).catch((err) => {
        this.autoqaConfigLoading = false;
        ElMessage.error({
          message: err,
        });
      });
    },
    downloadSelect() {
      if (this.selectionRows.length === 0) {
        return;
      }
      const csvContent = tableDataToCsvContent(this.selectionRows, approveTableColumns);
      downloadFileByContent('autoQA准出.csv', csvContent);
    },
    onCreateTimeChange(selTimes) {
      this.approveForm = Object.assign(this.approveForm, {
        createTimeBegin: selTimes[0],
        createTimeEnd: selTimes[1]
      });
    }
  }
}
</script>

<style scoped>
#PackagesTool {
  padding: 5px 0 5px 20px;
  text-align: left;
  color: black;
  font-size: 15px;
}

.el-form-item {
  margin-bottom: 10px;
}
</style>
