<template>
  <!-- 搜索工具栏组件 -->
  <div id="DiffSourceTool">
    <el-form inline :data="diffSourceForm" ref="form" @submit.prevent="onSearch">
      <el-form-item label="版本：" name="version">
        <el-select v-model="diffSourceForm.version" placeholder="请输入版本" remote filterable clearable
          :remote-method="remoteQuery" loading-text="查询中" no-match-text="没有匹配的版本" no-data-text="没有匹配的版本信息"
          :loading="versionLoading" style="width: 160px">
          <el-option v-for="item in versionQueryList" :key="item.version" :label="item.name" :value="item.version"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="查询最新：" name="isLatest">
        <el-switch v-model="diffSourceForm.isLatest"></el-switch>
      </el-form-item>
      <el-form-item label="变化源id：" name="id">
        <el-input v-model="diffSourceForm.id" placeholder="请输入变化源id" style="width: 160px;" clearable></el-input>
      </el-form-item>
      <el-form-item label="图幅：" id="meshList" name="meshList">
        <el-select
          v-model="diffSourceForm.meshList"
          multiple
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="请输入图幅"
          @paste="handlePasteMeshList"
          style="width: 200px"
        >
          <el-option
            v-for="item in meshListOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="valId：" id="batchIdList" name="batchIdList">
        <el-select
          v-model="diffSourceForm.batchIdList"
          multiple
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="请输入valId"
          @paste="handlePasteBatchIdList"
          style="width: 200px"
        >
          <el-option
            v-for="item in batchIdListOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="检查状态：" name="checkStatus">
        <el-select v-model="diffSourceForm.checkStatus" multiple placeholder="请选择检查状态" style="width: 160px" clearable>
          <el-option
            v-for="item in checkStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="最新融合状态：" name="mergeStatus">
        <el-select v-model="diffSourceForm.mergeStatus" multiple placeholder="请选择最新融合状态" style="width: 200px" clearable>
          <el-option
            v-for="item in mergeStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数据路径：" name="source">
        <el-input v-model="diffSourceForm.source" placeholder="请输入数据路径" style="width: 200px;" clearable></el-input>
      </el-form-item>
      <el-form-item label="业务对象标识：" name="businessKey">
        <el-input v-model="diffSourceForm.businessKey" placeholder="请输入业务对象标识" style="width: 200px;" clearable></el-input>
      </el-form-item>
      <el-form-item label="推理算法版本：" name="engineVersionList">
        <el-select
          v-model="diffSourceForm.engineVersionList"
          multiple
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="请输入推理算法版本"
          style="width: 200px"
        >
          <el-option
            v-for="item in emptyOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="业务类型：" name="businessType">
        <el-select v-model="diffSourceForm.businessType" placeholder="请选择检查状态" style="width: 160px" clearable>
          <el-option
            v-for="item in businessTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间：" name="createTimeRange">
        <el-date-picker
          v-model="createTimeRange"
          type="datetimerange"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 380px"
          range-separator="至"
          start-placeholder="创建时间区间开始"
          end-placeholder="创建时间区间结束"
          @change="onCreateTimeChange">
          </el-date-picker>
      </el-form-item>
      <el-form-item label="更新时间：" name="updateTimeRange">
        <el-date-picker
          v-model="updateTimeRange"
          type="datetimerange"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 380px"
          range-separator="至"
          start-placeholder="更新时间区间开始"
          end-placeholder="更新时间区间结束"
          @change="onUpdateTimeChange">
          </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button :icon="Search" type="primary" :loading="loading" native-type="submit" class="button_style">查询</el-button>
        <el-button :icon="Refresh" @click="reSet" class="button_style">重置</el-button>
        <el-button :icon="Plus" type="success" @click="createVersion" class="button_style">添加版本</el-button>
        <el-button :icon="Files" type="primary" @click="showVersionList" class="button_style">查看所有版本</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
const nioDiffSourceURL = window.api.nioDiffSourceURL;
import axios from "axios";
import { Search, Refresh, Plus, Files } from "@element-plus/icons-vue";
import { checkStatusOptions, businessTypeOptions, mergeStatusOptions } from "@/js/diffsource_data.js";

export default {
  name: "DiffSourceTool",
  props: {
    loading: Boolean,
    curVersionId: Number | String
  },
  watch: {
    curVersionId: {
      immediate: true,
      handler(value) {
        this.handleVersion(value)
      }
    }
  },
  data() {
    return {
      checkStatusOptions,
      businessTypeOptions,
      mergeStatusOptions,
      versionLoading: false,
      versionQueryList: [],
      createTimeRange: [],
      updateTimeRange: [],
      diffSourceForm: {
        id: null,
        version: null,
        isLatest: true,
        meshList: null,
        batchIdList: null,
        checkStatus: null,
        mergeStatus: null,
        source: null,
        businessType: null,
        businessKey: null,
        engineVersionList: null,
        businessType: null,
        createTimeFrom: null,
        createTimeTo: null,
        updateTimeFrom: null,
        updateTimeTo: null,
        includeDiffSourceResult: true
      },
      batchIdListOptions: [],
      meshListOptions: [],
      emptyOptions: [
      ]
    }
  },
  setup() {
    return {
      Search, Refresh, Plus, Files
    }
  },
  methods: {
    onSearch() {
      this.$emit('onSearch', this.diffSourceForm)
    },
    reSet() {
      this.diffSourceForm = {
        id: null,
        version: null,
        isLatest: true,
        meshList: null,
        batchIdList: null,
        checkStatus: null,
        mergeStatus: null,
        source: null,
        businessType: null,
        businessKey: null,
        engineVersionList: null,
        businessType: null,
        createTimeFrom: null,
        createTimeTo: null,
        updateTimeFrom: null,
        updateTimeTo: null,
        includeDiffSourceResult: true
      };
      this.createTimeRange = []
      this.updateTimeRange = []
    },
    remoteQuery(query) {
      this.versionLoading = true;
      axios({
        url: nioDiffSourceURL + '/diff-source/version-tag/list?name=' + query ?? ''
      }).then(response => {
        if (response.data.code === 0 || response.data.code === 200) {
          this.versionQueryList = response.data.data;
        }
        this.versionLoading = false;
      }).catch((err) => {
        this.versionLoading = false;
        ElMessage.error({
          message: err,
        });
      });
    },
    pasteToTags(event) {
      event.preventDefault();
      const text = (event.clipboardData || window.clipboardData).getData('text');
      return text.split(/[,]+/);
    },
    handlePasteBatchIdList(event) {
      const labels = this.pasteToTags(event);
      labels.forEach(label => {
        if (label && !this.batchIdListOptions.some(option => option.label === label)) {
          this.batchIdListOptions.push({ value: label, label });
        }
        if (!this.diffSourceForm.batchIdList.includes(label)) {
          this.diffSourceForm.batchIdList.push(label);
        }
      });
    },
    handlePasteMeshList(event) {
      const labels = this.pasteToTags(event);
      labels.forEach(label => {
        if (label && !this.meshListOptions.some(option => option.label === label)) {
          this.meshListOptions.push({ value: label, label });
        }
        if (!this.diffSourceForm.meshList.includes(label)) {
          this.diffSourceForm.meshList.push(label);
        }
      });
    },
    onCreateTimeChange(selTimes) {
      this.diffSourceForm = Object.assign(this.diffSourceForm, {
        createTimeFrom: selTimes[0],
        createTimeTo: selTimes[1]
      });
    },
    onUpdateTimeChange(selTimes) {
      this.diffSourceForm = Object.assign(this.diffSourceForm, {
        updateTimeFrom: selTimes[0],
        updateTimeTo: selTimes[1]
      });
    },
    createVersion() {
      this.$emit('createVersion');
    },
    showVersionList() {
      this.$emit('showVersionList');
    },
    handleVersion(value) {
      this.remoteQuery('')
      if (!value) {
        this.diffSourceForm.version = null;
      } else {
        this.diffSourceForm.version = value;
      }
    }
  },
  mounted() {
  }
}
</script>

<style scoped>
#DiffSourceTool {
  padding: 5px 0 5px 20px;
  text-align: left;
  color: black;
  font-size: 15px;
}

.el-form-item {
  margin-bottom: 10px;
}
:deep(div.el-form-item__label) {
  font-weight: 700;
}
:deep(#batchIdList .el-tooltip__trigger) {
  max-height: 80px;
  overflow-y: hidden;
}
:deep(#batchIdList .el-select__tags) {
  max-height: 42px;
  overflow-y: hidden;
}
:deep(#meshList .el-tooltip__trigger) {
  max-height: 80px;
  overflow-y: hidden;
}
:deep(#meshList .el-select__tags) {
  max-height: 42px;
  overflow-y: hidden;
}
</style>
