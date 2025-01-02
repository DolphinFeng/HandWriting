<template>
  <!-- 主表格信息组件 -->
  <div id="VersionTable" class="table">
    <div id="VersionTableContainer"
         class="table-container"
         v-loading="loading"
         element-loading-text="拼命加载中..."
         :element-loading-spinner="svg"
         element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-table :data="tableData" border :max-height="tableHeight" @selection-change="selectionChange">
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column prop="productIdentity" key="productIdentity" label="产品名称" align="center"
                         min-width="180"></el-table-column>
        <el-table-column prop="releaseVersion" key="releaseVersion" label="版本号" align="center"
                         min-width="220">
          <template #default="scope">
            <!-- 点击进入套餐详情页面 -->
            <el-button @click="handleDetail(scope.row)" link type="primary" size="small">
              {{ scope.row.releaseVersion }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="tag" key="tag" label="tag" align="center" min-width="160">
          <template #default="scope">
            <el-tag v-if="scope.row.tag">{{ scope.row.tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="referenceStr" key="referenceStr" label="版本适配" align="center"
                         min-width="200"></el-table-column>
        <el-table-column prop="checkStatus" key="checkStatus" label="检查状态" align="center" min-width="150">
          <template #default="scope">
            <el-tag :type="getCheckTagType(scope.row.checkStatus)">{{ scope.row.checkStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="compileStatus" key="compileStatus" label="编译状态" align="center" min-width="150">
          <template #default="scope">
            <el-tag :type="getCompileTagType(scope.row.compileStatus)">{{ scope.row.compileStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" key="createTime" label="创建时间" align="center"
                         min-width="190"></el-table-column>
        <el-table-column prop="releaseStatus" key="createTime" label="点云发版状态" align="center" min-width="120">
          <template #default="{row}">
            <el-tag effect="light" :type="getReleaseTagType(row.releaseStatus)">
              {{ releaseStatusFormatter(row.releaseStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column key="createTime" label="点云明细" align="center" min-width="100">
          <template #default="{row}">
            <el-link v-if="['SUCCESS', 'FAILED'].includes(row.releaseStatus)"
                     type="primary" :href="row.releaseDetailFile">
              <span class="link-btn">下载</span>
            </el-link>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="130">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleUpdate(scope.row)">快修</el-button>
            <el-button link type="primary" size="small" @click="handleHotFixReleaseFormShow(scope.row)">hotfix发版</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <div style="padding-top: 10px" class="pagination-container">
      <el-pagination
          background
          :total="total"
          :page-size="pageSize"
          v-model="currentPage"
          :page-sizes="[5,10,20,50]"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          layout="total,sizes,prev,pager,next,jumper"
      ></el-pagination>
    </div>
  </div>
  <el-dialog
      title="发版历史"
      v-model="timeline"
      show-close
      @close="()=>{this.timeline = false}"
      width="700px">
    <div class="block">
      <el-timeline>
        <el-timeline-item timestamp="2023/6/3" placement="top">
          <el-card>
            <h4>版本号：nio_base_hd_20230603_1</h4>
            <h4>tag：t_release_20230603</h4>
            <h4>nds版本号：20230603_1</h4>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="2023/6/2" placement="top">
          <el-card>
            <h4>版本号：nio_base_hd_20230602_1</h4>
            <h4>tag：t_release_20230602</h4>
            <h4>nds版本号：20230602_1</h4>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="2023/6/1" placement="top">
          <el-card>
            <h4>版本号：nio_base_hd_20230601_1</h4>
            <h4>tag：t_release_20230601</h4>
            <h4>nds版本号：20230601_1</h4>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </el-dialog>

  <el-dialog
      title="HotFix发版"
      v-model="hotFixReleaseFormShow"
      :show-close="true"
      @close="()=>{this.hotFixReleaseFormShow=false}"
      width="500px">
    <div>
      <el-form :data="hotfixForm" label-position="right" label-width="150px" ref="form">
        <el-form-item label="产品库名称：">
          <el-input v-model.trim="hotfixForm.productIdentity" style="width: 200px" disabled></el-input>
        </el-form-item>
        <el-form-item label="基础版本：">
          <el-input v-model.trim="hotfixForm.baseReleaseVersion" placeholder="基础版本(必填)" style="width: 582px;" disabled></el-input>
        </el-form-item>
        <el-form-item prop="isCompile" label="是否到编译：">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="hotfixForm.isCompile" placeholder="是否到编译阶段" class="lineClass"></el-switch>
        </el-form-item>
        <el-form-item prop="isRelease" label="是否发布线上：">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="hotfixForm.isRelease" placeholder="是否发布线上" class="lineClass"></el-switch>
        </el-form-item>
        <el-form-item label="编译信息(可选)">
          <el-input v-model.trim="hotfixForm.compileMeta" placeholder="编译信息(可选)" style="width: 582px;" ></el-input>
        </el-form-item>
        <el-form-item label="描述：">
          <el-input v-model.trim="hotfixForm.descName" placeholder="描述" style="width: 582px;" ></el-input>
        </el-form-item>
        <el-form-item prop="specification" label="数据规格：" name="numberStatus">
          <el-select v-model="hotfixForm.specification" placeholder="请选择数据规格" clearable style="width: 150px">
            <el-option
                v-for="item in specificationCsOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <template #footer class="dialog-footer">
      <el-button @click="hotFixReleaseFormShow = false" center>取 消</el-button>
      <el-button type="primary" @click="handelHotFix">提 交</el-button>
    </template>
  </el-dialog>
</template>

<script>
import {svg} from "@/js/loading_data.js";

const nioCheckURL = window.api.nioCheckURL;
export default {
  name: "VersionTable",
  emits: ['handleSizeChange', 'handleCurrentChange', 'handelHotFix'],
  // 接收父组件传来的参数
  props: {
    loading: Boolean,
    tableData: Array,
    total: Number,
    selectionRows: Object,
    hotfixForm: Object,
    specificationCsOptions: Array,
  },
  data() {
    return {
      // 表格的最大高度
      tableHeight: 0,
      // 每次表格展示多少条信息
      pageSize: 20,
      // 表格当前页码
      currentPage: 1,
      svg: svg,
      timeline: false,
      hotFixReleaseFormShow: false
    }
  },
  methods: {
    Search() {
      return Search
    },
    //点云发版状态字段格式化
    releaseStatusFormatter(releaseStatus) {
      switch (releaseStatus) {
        case 'CREATE':
          return '已创建';
        case 'RELEASING':
          return '发布中';
        case 'FAILED':
          return '发布失败';
        case 'SUCCESSFUL':
          return '发布成功';
        default:
          return '未发布';
      }
    },
    getReleaseTagType(releaseStatus) {
      switch (releaseStatus) {
        case 'CREATE':
          return 'info';
        case 'RELEASING':
          return 'warning';
        case 'FAILED':
          return 'danger';
        case 'SUCCESSFUL':
          return 'success';
        default:
          return 'info';
      }
    },
    handleDetail() {
      this.timeline = true
    },
    handleHotFixReleaseFormShow(row) {
      this.hotfixForm.productIdentity = row.productIdentity;
      this.hotfixForm.baseReleaseVersion = row.releaseVersion;
      this.hotFixReleaseFormShow = true
    },
    selectionChange(rows) {
      this.selectionRows.list = rows;
    },
    handelHotFix(){
      this.$emit('handelHotFix')
    },
    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.currentPage = page;
      this.$emit('handleCurrentChange', page)
    },
    // 表格size改变时触发函数
    handleSizeChange(page_size) {
      this.pageSize = page_size;
      this.$emit('handleSizeChange', page_size)
    },
    getCheckTagType(checkTag) {
      if (checkTag === '检查未完成') return 'warning';
      else if (checkTag === '检查通过') return 'success';
      else if (checkTag === '检查未通过') return 'danger';
    },
    getCompileTagType(compileTag) {
      if (compileTag === '编译未完成') return 'warning';
      else if (compileTag === '编译通过') return 'success';
      else if (compileTag === '编译未通过') return 'danger';
    },
    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.tableHeight = document.getElementById('VersionTableContainer') === null ? 0 : document.getElementById('VersionTableContainer').offsetHeight;
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.adaptiveTableHeight()
    })
    window.addEventListener('resize', this.adaptiveTableHeight, false)
  },
}
</script>
