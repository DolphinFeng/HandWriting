<!-- 采集建图页面 -->
<template>
  <div class="component">
    <!-- 面包屑 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">Case管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem active-breadcrumb-item">采集建图</div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏 -->
    <div class="psTool">
      <el-form inline :data="collectionSearch" label-position="right" ref="form" id="formDiv">
        <el-form-item label="批次：" prop="batch">
          <el-select v-model="collectionSearch.batch" style="width: 160px" placeholder="请选择" multiple>
            <el-option v-for="item in batchOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="采集任务开始时间：">
          <el-input v-model.trim="collectionSearch.collectionStartTime" style="width: 160px" clearable></el-input>
        </el-form-item> -->
        <el-form-item prop="collectionStartTime" label="采集任务开始时间：" name="collectionStartTime">
          <el-date-picker v-model="collectionSearch.collectionStartTime" type="datetime" format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss" style="width: 300px" placeholder="请选择">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="核实结果：">
          <el-select v-model="collectionSearch.verifyResult" style="width: 160px" placeholder="请选择">
            <el-option v-for="item in verifyResultOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="height: 36px">
        <el-button :icon="Search" type="primary" @click.stop="search">查询</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
        <el-button :icon="Refresh" @click="exportDetail">导出</el-button>
      </div>
    </div>
    <!-- 主表格 -->
    <div class="table">
      <!-- 表格 -->
      <div id="StationTableContainer" class="table-container" v-loading="loading" element-loading-text="拼命加载中..."
        :element-loading-spinner="svg" element-loading-svg-view-box="-10, -10, 50, 50">
        <el-table :data="tableData" :border="true" :max-height="tableHeight" @selection-change="handleSelectionChange">
          <el-table-column fixed="left" align="center" type="selection" width="55"></el-table-column>
          <el-table-column fixed="left" align="center" prop="caseId" label="caseId" key="caseId" min-width="100"></el-table-column>
          <el-table-column align="center" prop="batch" label="case批次" key="batch" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="businessKey" label="case上游业务标识" key="businessKey" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="mapVersion" label="地图版本" key="mapVersion" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="projectMapVersion" label="项目名称" key="projectMapVersion" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="collectionBatch" label="采集批次" key="collectionBatch" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="collectionTicketNumber" label="采集工单" key="collectionTicketNumber" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="collectionStatus" label="采集状态" key="collectionStatus" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="collectionStartTime" label="采集开始时间" key="collectionStartTime" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="collectionEndTime" label="采集结束时间" key="collectionEndTime" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="mappingStatus" label="建图状态" key="mappingStatus" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="mappingStartTime" label="建图开始时间" key="mappingStartTime" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="mappingEndTime" label="建图结束时间" key="mappingEndTime" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="verifyTaskId" label="核实任务id" key="verifyTaskId" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="verifyResult" label="核实结果" key="verifyResult" min-width="150">
          </el-table-column>        
          <el-table-column align="center" prop="verifyStartTime" label="核实开始时间" key="verifyStartTime" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="verifyEndTime" label="核实结束时间" key="verifyEndTime" min-width="150">
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
  </div>
</template>

<script>
import { Search, Refresh, FolderOpened, FolderAdd, ArrowRight } from '@element-plus/icons-vue';
import store from '../store/index.js';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { svg } from '@/js/loading_data.js';
import { caseStatusMap } from './case-data.js';
import { downloadFileByContent, tableDataToCsvContent } from "@/utils";

const nioCaseService = window.api.nioCaseService;

export function emptyToUndefined(str) {
  return str === '' ? undefined : str;
}

export default {
  name: 'casePage',

  data() {
    return {
      loading: false,
      batchOptions: [],
      verifyResultOptions: [
        {value: 0, label: 'MODIFIABLE'},
        {value: 1, label: 'RECOLLECT'},
        {value: 2, label: 'CORRECT'}
      ],
      // 搜索内容
      collectionSearch: {
        batch: '',
        collectionStartTime: '',
        verifyResult: '',
      },

      tableData: [],
      multipleSelection: [], //当前表格选中行
      tableHeight: 0,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      svg: svg,
    };
  },
  methods: {
    //选择项发生变化时触发
    handleSelectionChange(selection) {
      this.multipleSelection = selection;
    },

    loadingBatchs() {
      axios({
        url: nioCaseService + '/case/batch/query-by-page',
        method: 'post',
        data: {
          pageNo: 1,
          pageSize: 1000
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        this.batchOptions = res.data.data.result.map((item) => {
          return {
            label: item.name, value: item.id
          }
        })
      }).catch((err) => {
        ElMessage.error({ message: err, showClose: true, });
      })
    },

    startProject(id) {

    },

    //带条件查询搜索
    search() {
      console.log('search ln...');
      this.currentPage = 1;
      this.loadingPage();
    },
    //重置条件查询表单
    resetForm() {
      this.collectionSearch = {
        batch: '',
        collectionStartTime: '',
        verifyResult: '',
      };
    },

    // exportDetail() {
    //   axios({
    //     url: nioCaseService + '/case/collection/query',
    //     method: 'post',
    //     data: {
    //       batchIdList: this.collectionSearch.batch == '' ? undefined : this.collectionSearch.batch,
    //       fromCollectionStartTime: emptyToUndefined(this.collectionSearch.collectionStartTime),
    //       verifyResult: emptyToUndefined(this.collectionSearch.verifyResult),
    //       pageNo: this.currentPage,
    //       pageSize: this.pageSize
    //     },
    //     headers: {
    //       'content-type': 'application/json',
    //     },
    //   })
    //     .then((res) => {
    //       console.log(res)
    //       debugger
    //       var textContent = 'caseId,核实任务id,采集工单号,issueId,项目名称,批次,采集任务开始时间,采集任务结束时间,建图开始时间,建图结束时间,建图任务状态,核实开始时间,核实结束时间,核实状态\n';
    //       for(let line of res.data.data.result){
    //         let lineContent = line.caseId + ',' + line.verifyTaskId + ','+ line.collectionTicketNumber + ',' + line.businessKey + ',' + line.projectMapVersion + ',' + line.batch + ',' +
    //         line.collectionStartTime + ',' + line.collectionEndTime + ',' + line.mappingStartTime + ',' + line.mappingEndTime + ',' + line.mappingStatus + ',' + line.verifyStartTime + ',' +
    //         line.verifyEndTime + ',' + line.verifyResult + '\n';
    //         textContent += lineContent;
    //       }     
    //       if (res.data.code === 200) {
    //         if (res.data.data.total == 0) {
    //           ElMessage.error({
    //             message: '暂无下载内容',
    //             showClose: true,
    //             grouping: true,
    //           });
    //           return;
    //         }
    //         if (textContent.length > 0) {
    //           downloadFileByContent('采集建图.csv', textContent);
    //         } else {
    //           ElMessage.warning({
    //             message: '无下载内容',
    //             showClose: true,
    //             grouping: true,
    //           });
    //         }
    //       } else {
    //         ElMessage.warning({
    //           message: '请求失败',
    //           showClose: true,
    //           grouping: true,
    //         });
    //         return;
    //       }
    //     }).catch(() => {
    //       ElMessage.error({
    //         message: '下载失败',
    //         showClose: true,
    //         grouping: true,
    //       });
    //     })

    // },

    exportDetail() {
      axios({
        url: nioCaseService + '/case/collection/export',
        method: 'post',
        data: {
          batchIdList: this.collectionSearch.batch == '' ? undefined : this.collectionSearch.batch,
          fromCollectionStartTime: emptyToUndefined(this.collectionSearch.collectionStartTime),
          verifyResult: emptyToUndefined(this.collectionSearch.verifyResult),
          // pageNo: this.currentPage,
          // pageSize: this.pageSize
        },
        headers: {
          'content-type': 'application/json',
        },
      })
        .then((res) => {
          downloadFileByContent('采集建图.csv', res.data);
          return;

          if (res.data.code === 0) {
            if (res.data.totalCount == 0) {
              ElMessage.error({
                message: '暂无下载内容',
                showClose: true,
                grouping: true,
              });
              return;
            }
            let toDownList = [];
            if (this.multipleSelection.length > 0) {
              this.multipleSelection.map((sel) => {
                const selData = res.data.data.find((line) => line.businessId === sel.id);
                if (selData) {
                  toDownList.push(selData)
                }
              })
            } else {
              toDownList = res.data.data;
            }
            if (toDownList.length > 0) {
              const data = this.jsonToCsv(toDownList);

              downloadFileByContent('业务场景.csv', data);
            } else {
              ElMessage.warning({
                message: '无下载内容',
                showClose: true,
                grouping: true,
              });
            }
          } else {
            ElMessage.warning({
              message: '请求失败',
              showClose: true,
              grouping: true,
            });
            return;
          }
        }).catch(() => {
          ElMessage.error({
            message: '下载失败',
            showClose: true,
            grouping: true,
          });
        })

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
      try {
        let response = await axios.post(nioCaseService + '/case/collection/query-by-page', {
          batchIdList: this.collectionSearch.batch == '' ? undefined : this.collectionSearch.batch,
          fromCollectionStartTime: emptyToUndefined(this.collectionSearch.collectionStartTime),
          verifyResult: emptyToUndefined(this.collectionSearch.verifyResult),
          pageNo: this.currentPage,
          pageSize: this.pageSize
        });

        if (response.data.code != 200) {
          ElMessage.error({ message: response.data.msg, showClose: true, });
        }
        this.tableData = response.data.data.result;
        this.total = response.data.data.total;
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
  },
  setup() {
    return {
      Search, Refresh, FolderOpened, FolderAdd, ArrowRight,
    }
  },
  mounted() {
    this.loadingPage();
    this.loadingBatchs();
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
