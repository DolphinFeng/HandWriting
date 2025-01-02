<!-- case--项目页面 -->
<template>
  <div class="component">
    <!-- 面包屑 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">Case管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem active-breadcrumb-item">Case页面</div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏 -->
    <div class="psTool">
      <el-form inline :data="projectSearch" label-position="right" ref="form" id="formDiv" @submit.prevent="search">
        <el-form-item label="项目版本：" prop="mapVersion">
          <el-select v-model="projectSearch.mapVersion" placeholder="请选择" style="width: 160px">
            <el-option v-for="item in mapVersionOptions" :key="item.value" :label="item.label" :value="item.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目状态：" prop="status">
          <el-select v-model="projectSearch.status" placeholder="请选择" style="width: 160px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间：" prop="createTime">
          <el-select v-model="projectSearch.createTime" placeholder="请选择" style="width: 160px">
            <el-option v-for="item in createTimeOptions" :key="item.value" :label="item.label" :value="item.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="更新时间：" prop="updateTime">
          <el-select v-model="projectSearch.updateTime" placeholder="请选择" style="width: 160px">
            <el-option v-for="item in updateTimeOptions" :key="item.value" :label="item.label" :value="item.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目来源：" prop="source">
          <el-select v-model="projectSearch.source" placeholder="请选择" style="width: 160px">
            <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.label" />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="height: 36px">
        <el-button :icon="Search" type="primary" native-type="submit" @click="search">查询</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
        <el-button type="success" @click="createCase">新增</el-button>
        <el-button type="success" @click="modifyCase">修改</el-button>
        <el-button type="success" @click="start">启动</el-button>
        <el-button type="success" @click="stop">结束</el-button>
      </div>
    </div>
    <!-- 主表格 -->
    <div class="table">
      <!-- 表格 -->
      <div id="StationTableContainer" class="table-container" v-loading="loading" element-loading-text="拼命加载中..."
        :element-loading-spinner="svg" element-loading-svg-view-box="-10, -10, 50, 50">
        <el-table :data="tableData" :border="true" :max-height="tableHeight" @selection-change="handleSelectionChange">
          <el-table-column fixed="left" align="center" type="selection" width="55"></el-table-column>
          <el-table-column fixed="left" align="center" prop="id" label="序号" key="id" min-width="100"></el-table-column>
          <el-table-column align="center" prop="mapVersion" label="项目版本" key="mapVersion" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="productName" label="产品库" key="productName" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="productBranch" label="分支" key="productBranch" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="description" label="说明" key="description" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="status" label="项目状态" key="status" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="createTime" label="创建时间" key="createTime" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="updateTime" label="更新时间" key="updateTime" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="source" label="来源" key="source" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="caseStatus" label="case状态统计" key="caseStatus" min-width="150">
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <div style="padding-top: 10px" class="tPaginationContainer">
        <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
          v-model="currentPage" :page-sizes="[20, 50, 100, 1000, 9999]" :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
    </div>
    <!-- 任务对话框 -->
    <el-dialog :title="'创建'" v-model="showCreateDlg" show-close @close="closeCreateCase" width="600px">
      <el-form ref="createForm" :model="createDlgData" :rules="rulesCreate" label-position="right" label-width="160px"
        style="margin: 0 30px 0 10px">
        <el-form-item label="版本：" prop="mapVersion">
          <el-input v-model.trim="createDlgData.mapVersion" placeholder="" style="width: 90%"></el-input>
        </el-form-item>
        <el-form-item label="内容：" prop="content">
          <el-input v-model.trim="createDlgData.content" placeholder="" style="width: 90%"></el-input>
        </el-form-item>
        <el-form-item label="项目类型：" prop="type">
          <el-select v-model="createDlgData.type" placeholder="请选择">
            <el-option v-for="item in createType" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品库：" prop="product">
          <el-input v-model.trim="createDlgData.product" placeholder="" style="width: 90%"></el-input>
        </el-form-item>
        <el-form-item label="分支：" prop="branch">
          <el-input v-model.trim="createDlgData.branch" placeholder="" style="width: 90%"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeCreateCase">取消</el-button>
        <el-button type="primary" @click="doCreateCase">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog :title="'修改'" v-model="showModifyDlg" show-close @close="closeModifyCase" width="600px">
      <el-form ref="modifyForm" :model="modifyDlgData" :rules="rulesModify" label-position="right" label-width="160px"
        style="margin: 0 30px 0 10px">
        <el-form-item label="项目版本：" prop="mapVersion">
          <el-input v-model.trim="modifyDlgData.mapVersion" placeholder="" style="width: 90%"></el-input>
        </el-form-item>
        <el-form-item label="产品库：" prop="productName">
          <el-input v-model.trim="modifyDlgData.productName" placeholder="" style="width: 90%"></el-input>
        </el-form-item>
        <el-form-item label="分支：" prop="productBranch">
          <el-input v-model.trim="modifyDlgData.productBranch" placeholder="" style="width: 90%"></el-input>
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input v-model.trim="modifyDlgData.remark" placeholder="" style="width: 90%"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeModifyCase">取消</el-button>
        <el-button type="primary" @click="doModifyCase">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Search, Refresh, FolderOpened, FolderAdd, ArrowRight } from '@element-plus/icons-vue';
import store from '../store/index.js';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { svg } from '@/js/loading_data.js';
import { caseStatusMap, statusMap } from './case-data.js';

const nioCaseService = window.api.nioCaseService;

export function emptyToUndefined(str) {
  return str === '' ? undefined : str;
}

export default {
  name: 'casePage',

  data() {
    return {
      loading: false,
      // 搜索内容
      projectSearch: {
        mapVersion: '',
        status: '',
        createTime: '',
        updateTime: '',
        source: '',
      },

      showCreateDlg: false,
      createDlgData: {
        mapVersion: '',
        product: '',
        content: '',
        branch: '',
        type: '',
      },
      rulesCreate: {
        name: [{ required: true, message: '请输入', trigger: 'change' }],
        product: [{ required: true, message: '请输入', trigger: 'change' }],
        content: [{ required: true, message: '请输入', trigger: 'change' }],
        branch: [{ required: true, message: '请输入', trigger: 'change' }],
      },

      showModifyDlg: false,
      modifyDlgData: {
        mapVersion: "",
        productName: "",
        productBranch: "",
        remark: ""
      },
      createType: [
        { key: 'nmap_cs_mapping_release', value: '众包建图发布' },
        { key: 'nmap_hotfix_merge_release', value: '补融快修发布' },
        { key: 'nmap_hotfix_release', value: '快修快发' },
        { key: 'nmap_release', value: '大版发布' },
        { key: 'nmap_road_test_release', value: '路测发布' },
        { key: 'cs_p2p_release', value: '点到点发布' },
      ],
      rulesModify: {
        name: [{ required: true, message: '请输入', trigger: 'change' }],
        product: [{ required: true, message: '请输入', trigger: 'change' }],
        content: [{ required: true, message: '请输入', trigger: 'change' }],
        branch: [{ required: true, message: '请输入', trigger: 'change' }],
      },

      tableData: [],
      multipleSelection: [], //当前表格选中行
      tableHeight: 0,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      svg: svg,

      mapVersionOptions: [],
      statusOptions: [],
      createTimeOptions: [],
      updateTimeOptions: [],
      sourceOptions: [],
    };
  },
  methods: {
    //选择项发生变化时触发
    handleSelectionChange(selection) {
      this.multipleSelection = selection;
    },

    startProject(id) {

    },

    //带条件查询搜索
    search() {
      this.currentPage = 1;
      this.loadingPage();
    },
    //重置条件查询表单
    resetForm() {
      this.projectSearch = {
        mapVersion: '',
        status: '',
        createTime: '',
        updateTime: '',
        source: '',
      };
    },

    createCase() { this.showCreateDlg = true; },
    modifyCase() {
      if (this.multipleSelection.length != 1) {
        ElMessage.info({ message: '请仅选择一个项目', showClose: true, });
        return;
      }
      this.showModifyDlg = true;
    },

    async start() {
      if (this.multipleSelection.length != 1) {
        ElMessage.info({ message: '请仅选择一个项目', showClose: true, });
        return;
      }

      this.loading = true;

      try {
        let res = await axios.post(nioCaseService + '/case/project/start', {
          projectId: this.multipleSelection[0].id,
          userName: localStorage.getItem('realName'),
        });

        this.loadingPage();
      } catch (error) {
        ElMessage.info({ message: error + '', showClose: true, });
      }
      finally {
        this.loading = false;
      }
    },
    async stop() {
      if (this.multipleSelection.length != 1) {
        ElMessage.info({ message: '请仅选择一个项目', showClose: true, });
        return;
      }

      this.loading = true;

      try {
        let res = await axios.post(nioCaseService + '/case/project/finish', {
          projectId: this.multipleSelection[0].id,
          userName: localStorage.getItem('realName'),
        });

        this.loadingPage();
      } catch (error) {
        ElMessage.info({ message: error + '', showClose: true, });
      }
      finally {
        this.loading = false;
      }
    },

    closeCreateCase() { this.showCreateDlg = false; },
    closeModifyCase() { this.showModifyDlg = false; },

    async doCreateCase() {
      try {
        let res = await axios.post(nioCaseService + '/case/project/create', {
          mapVersion: this.createDlgData.mapVersion,
          productName: this.createDlgData.product,
          productBranch: this.createDlgData.branch,
          remark: this.createDlgData.content,
          type: this.createDlgData.type,
        });

        if (res.data.code != 200) {
          throw res.data.msg;
        }

        this.loadingPage();
        this.showCreateDlg = false;
        ElMessage.success("创建成功");

      } catch (error) {
        ElMessage.error({ message: error + '', showClose: true, });
      }
    },
    async doModifyCase() {
      try {
        let res = await axios.post(nioCaseService + '/case/project/update', {
          id: this.multipleSelection[0].id,
          mapVersion: this.modifyDlgData.mapVersion,
          productName: this.modifyDlgData.productName,
          productBranch: this.modifyDlgData.productBranch,
          remark: this.modifyDlgData.remark,
          type: this.multipleSelection[0].source,
        });

        if (res.data.code != 200) {
          throw res.data.msg;
        }

        this.loadingPage();
        this.showCreateDlg = false;
        ElMessage.success("修改成功");

      } catch (error) {
        ElMessage.error({ message: error + '', showClose: true, });
      }
    },

    //更换表格单页显示条数
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.currentPage = 1;
      this.loadingPage();
    },
    //切换页码
    handleCurrentChange(page) {
      this.currentPage = page;
      this.loadingPage();
    },
    // 加载表格内容
    async loadingPage() {

      this.loading = true;
      this.statusOptions = [];
      Object.entries(statusMap).forEach(([key, value]) => {
        this.statusOptions.push({ value: key, label: value })
      });
      try {
        let response = await axios.post(nioCaseService + '/case/project/query-by-page', {
          fromCreateTime: emptyToUndefined(this.projectSearch.createTime),
          toCreateTime: emptyToUndefined(this.projectSearch.updateTime),
          mapVersion: emptyToUndefined(this.projectSearch.mapVersion),
          type: emptyToUndefined(this.projectSearch.source),
          status: emptyToUndefined(this.projectSearch.status),
          pageNo: this.currentPage,
          pageSize: this.pageSize
        });

        if (response.data.code != 200) {
          ElMessage.error({ message: response.data.msg, showClose: true, });
        }

        this.tableData = response.data.data.result.map((item) => {
          let statSummary = {};
          Object.entries(item.statSummary).forEach(([key, value]) => {
            statSummary[caseStatusMap[key]] = value;
          });

          return {
            id: item.id,
            name: item.remark,
            mapVersion: item.mapVersion,
            productName: item.productName,
            productBranch: item.productBranch,
            status: statusMap[item.status],
            createTime: item.createTime,
            updateTime: item.updateTime,
            source: item.type,
            caseStatus: JSON.stringify(statSummary),
          }
        });
      } catch (error) {
        ElMessage.error({ message: error + '', showClose: true, });
      }
      finally {
        this.loading = false;
      }
    },

    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.tableHeight = document.getElementById('StationTableContainer') === null ? 0 : (document.getElementsByClassName("table")[0].offsetHeight - 42);
    },

    loadingMapVersion() {
      axios({
        url: nioCaseService + '/case/project/query-by-page',
        method: 'post',
        data: {
          pageNo: 1,
          pageSize: 1000
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        this.mapVersionOptions = res.data.data.result.map((item) => {
          return {
            label: item.mapVersion, value: item.id
          }
        })
      }).catch((err) => {
        ElMessage.error({ message: err, showClose: true, });
      })
    },

    // loadingStatus() {
    //   axios({
    //     url: nioCaseService + '/case/project/query-by-page',
    //     method: 'post',
    //     data: {
    //       pageNo: 1,
    //       pageSize: 1000
    //     },
    //     headers: {
    //       'content-type': 'application/json'
    //     }
    //   }).then(res => {
    //     this.statusOptions = res.data.data.result.map((item) => {
    //       return {
    //         label: item.status, value: item.id
    //       }
    //     })
    //   }).catch((err) => {
    //     ElMessage.error({ message: err, showClose: true, });
    //   })
    // },

    loadingCreateTime() {
      axios({
        url: nioCaseService + '/case/project/query-by-page',
        method: 'post',
        data: {
          pageNo: 1,
          pageSize: 1000
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        this.createTimeOptions = res.data.data.result.map((item) => {
          return {
            label: item.createTime, value: item.id
          }
        })
      }).catch((err) => {
        ElMessage.error({ message: err, showClose: true, });
      })
    },

    loadingUpdateTime() {
      axios({
        url: nioCaseService + '/case/project/query-by-page',
        method: 'post',
        data: {
          pageNo: 1,
          pageSize: 1000
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        this.updateTimeOptions = res.data.data.result.map((item) => {
          return {
            label: item.updateTime, value: item.id
          }
        })
      }).catch((err) => {
        ElMessage.error({ message: err, showClose: true, });
      })
    },

    loadingSource() {
      axios({
        url: nioCaseService + '/case/project/query-by-page',
        method: 'post',
        data: {
          pageNo: 1,
          pageSize: 1000
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        this.sourceOptions = res.data.data.result.map((item) => {
          return {
            label: item.source, value: item.id
          }
        })
      }).catch((err) => {
        ElMessage.error({ message: err, showClose: true, });
      })
    },
  },
  setup() {
    return {
      Search, Refresh, FolderOpened, FolderAdd, ArrowRight,
    }
  },
  mounted() {
    this.loadingMapVersion();
    // this.loadingStatus();
    this.loadingCreateTime();
    this.loadingUpdateTime();
    this.loadingSource();
    this.loadingPage();
    this.$nextTick(() => {
      this.adaptiveTableHeight();
    });
    window.addEventListener('resize', this.adaptiveTableHeight);
  },
  unmounted() {
    window.removeEventListener('resize', this.adaptiveTableHeight)
  }
}
</script>

<style scoped>
.table {
  overflow: hidden;
}

.psTool {
  padding: 5px 0 5px 20px;
  text-align: left;
  color: black;
  font-size: 15px;
}

.psTool .el-form-item {
  margin-bottom: 10px;
  margin-right: 20px;
}
</style>
