<template>
  <div id="VersionComponent" class="component">
    <div style="display: inline-block">
      <!-- 面包屑：展示地图发布的版本管理 -->
      <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
        <el-breadcrumb-item>
          <div class="breadcrumbItem">地图发布</div>
        </el-breadcrumb-item>
        <el-breadcrumb-item>
          <div @click="versionFun" class="breadcrumbItem" :class="{'active-breadcrumb-item':$store.state.activeBreadcrumbIndex === 1}">版本管理</div>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-if="breadcrumbVersionShow">
          <div class="breadcrumbItem" :class="{'active-breadcrumb-item':$store.state.activeBreadcrumbIndex === 2}">新建底图</div>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-if="breadcrumbServiceShow">
          <div class="breadcrumbItem" :class="{'active-breadcrumb-item':$store.state.activeBreadcrumbIndex === 3}">新建服务区</div>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-if="breadcrumbCSVersionShow">
          <div class="breadcrumbItem" :class="{'active-breadcrumb-item':$store.state.activeBreadcrumbIndex === 4}">新建众包底图</div>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!-- 搜索工具栏组件 -->
    <VersionTool
        :key="VersionToolKey"
        v-if="!breadcrumbVersionShow && !breadcrumbServiceShow && !breadcrumbCSVersionShow"
        :VersionForm="VersionForm"
        @versionCheck="versionCheck"
        @createPointCloud="createPointCloud"
        @createCSVersion="createCSVersion"
        @onSearch="onSearch"
        @reSet="reSet"
    ></VersionTool>
    <!-- 主表格信息组件 -->
    <VersionTable
        :key="VersionTableKey"
        :loading="loading"
        v-if="!breadcrumbVersionShow && !breadcrumbServiceShow && !breadcrumbCSVersionShow"
        :tableData="tableData"
        :total="total"
        :selectionRows="selectionRows"
        :hotfixForm="hotfixForm"
        :specificationCsOptions="specificationCsOptions"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
        @handelHotFix="handelHotFix"
    ></VersionTable>
    <!--  新建底图组件  -->
    <VersionDetail
        v-if="breadcrumbVersionShow"
        :detailForm="detailForm"
        @handelVersion="handelVersion"
    ></VersionDetail>
    <!-- 新建服务区组件 -->
    <VersionService
        v-if="breadcrumbServiceShow"
        :service-form="serviceForm"
        @handelService="handelService"
    ></VersionService>
    <!-- 新建众包底图组件 -->
    <VersionCS
        v-if="breadcrumbCSVersionShow"
        :crowdsourcingForm="crowdsourcingForm"
        :specificationCsOptions="specificationCsOptions"
        @handelCS="handelCS"
    ></VersionCS>
  </div>
</template>

<script>
// 引入需要的组件
import VersionTool from "./VersionTool.vue";
import VersionTable from "./VersionTable.vue";
import VersionDetail from "./VersionDetail.vue";
import VersionService from "./VersionService.vue";
import VersionCS from "./VersionCS.vue";
import {ArrowRight} from "@element-plus/icons-vue";
// 引入js数据
import {dateToString} from "../utils";
import {checkStatusOptions, compileStatusOptions, specificationCsOptions} from "../js/version_data";
import store from "../store/index.js";
import {ElMessage, ElMessageBox} from "element-plus";
import axios from "axios";
import {watch} from "vue";
import {useRouter} from "vue-router";
import router from "@/router/index.js";

const nioReleaseURL = window.api.nioReleaseURL;
const nioPowerSwapURL = window.api.nioPowerSwapURL;
const nioDataURL = window.api.nioDataURL;

export default {
  name: "VersionComponent",
  // 组件注册
  components: {
    VersionService,
    VersionTool,
    VersionTable,
    VersionDetail,
    VersionCS
  },
  data() {
    return {
      loading: false,
      selectionRows: {
        list: [],
      },
      VersionToolKey: 0,
      VersionTableKey: 10,
      breadcrumbVersionShow: false,
      breadcrumbServiceShow: false,
      breadcrumbCSVersionShow: false,
      VersionForm: {
        productIdentity: '',
        releaseVersion: '',
        checkStatus: ['UNCHECKED', 'CHECK_PASS', 'CHECK_FAILED'],
        compileStatus: ['NOT_COMPILED', 'SUCCESS', 'FAILED'],
        sortDirection: true,
      },
      // 表格数据
      tableData: [],
      // 表格总条数
      total: 0,
      // 表格当前页码
      currentPage: 1,
      // 每次表格展示多少条信息
      pageSize: 20,
      offset: 0,
      // 执行检查form表单
      detailForm: {
        productIdentity: '',
        descName: '',
        branch: '',
        owner: '',
        isCompile: false,
        isFullCheck: true,
        isRunBatchProcess: true,
        isOddRefresh: false,
        isSpdRefresh: false,
        isRampMerge: false,
        rampProductName: '',
        rampProductBranch: '',
      },
      serviceForm: {
        productIdentity: '',
        descName: '',
        branch: '',
        owner: '',
        referenceProduct: '',
        isCompile: false,
      },
      crowdsourcingForm: {
        productIdentity: '',
        descName: '',
        branch: '',
        owner: '',
        isCompile: false,
        isRampMerge: false,
        isMergeSd: false,
        specification: '',
        rampProductName: '',
        rampProductBranch: '',
        compileMeta: '',
        baseNdsReleaseVersion: ''
      },
      hotfixForm: {
        productIdentity: '',
        productType: 'CS',
        specification: '',
        descName: '',
        isCompile: false,
        isRelease: false,
        compileMeta: '{"isHotFix":"1"}',
        releaseEnv: 'stg',
        releaseType: 'cs_map',
        baseReleaseVersion: '',
        lineCode: 'cs_hd_release_hot_fix',
        postLineCode: 'cs_hd_release_compile_post',
        compileOnFailureStages: [
          {
            "stageName": "updateCompileStatus",
            "dependStages": [],
            "stageDesc": "更新编译状态为失败"
          }
        ],
        compileOnSuccessStages: [
          {
            "stageName": "refCheckOnReleaseSuccess",
            "dependStages": [],
            "stageDesc": "对依赖这个底图的所有产品库，用最新的发布进行依赖检测"
          },
          {
            "stageName": "updateCompileStatus",
            "dependStages": [],
            "stageDesc": "更新编译状态为成功"
          }
        ],
        compileOnSuccessStagesWithPost: [
            {
              "stageName": "refCheckOnReleaseSuccess",
              "dependStages": [],
              "stageDesc": "对依赖这个底图的所有产品库，用最新的发布进行依赖检测"
            },
            {
              "stageName": "updateCompileStatus",
              "dependStages": [],
              "stageDesc": "更新编译状态为成功"
            },
            {
              "stageName": "startPostRelease",
              "dependStages": [],
              "stageDesc": "触发底图发布的后处理流程，传入指定参数"
            }
        ],
        pmsOnFailureStages: [
          {
            "stageName": "checkOnFail",
            "stageDesc": "监听到pms流程返回失败后执行的步骤."
          }
        ],
        pmsOnSuccessStages: [
          {
            "stageName": "checkSuccess",
            "dependStages": [],
            "stageDesc": "pms顺利通过，编译前检测成功"
          },
          {
            "stageName": "notifyCompile",
            "dependStages": [
              "checkSuccess"
            ],
            "stageDesc": "触发底图发布的编译流程，传入指定参数."
          }
        ],
        releaseStages: [
          {
            "stageName": "createRelease",
            "dependStages": [],
            "stageDesc": "按照日期生成版本号，然后按照参数生成新的发布版本."
          },
          {
            "stageName": "retrieveBaseBranch",
            "dependStages": [],
            "stageDesc": "try to retrieve branch in which baseRelease released"
          },
          {
            "stageName": "retrieveBaseNdsVersion",
            "dependStages": []
          },
          {
            "stageName": "startBasicPmsProcess",
            "dependStages": [
              "createRelease"
            ],
            "stageDesc": "触发底图发布的pms流程，传入指定参数."
          }
        ],
      },
      dateToString: dateToString,
      checkStatusOptions: checkStatusOptions,
      compileStatusOptions: compileStatusOptions,
      specificationCsOptions: specificationCsOptions
    }
  },
  setup() {
    const router = useRouter();
    return {
      ArrowRight, router,
    }
  },
  watch: {
    breadcrumbServiceShow(newVal, oldVal) {
      store.commit('breadChange', newVal ? 3 : 1);
    },
    breadcrumbVersionShow(newVal, oldVal) {
      store.commit('breadChange', newVal ? 2 : 1);
    },
    breadcrumbCSVersionShow(newVal, oldVal) {
      store.commit('breadChange', newVal ? 4 : 1);
    }

  },
  methods: {
    // 页面跳转至详情页面
    versionCheck() {
      this.breadcrumbVersionShow = true
      this.detailForm = {
        productIdentity: '',
        descName: '',
        branch: '',
        owner: '',
        isCompile: false,
        isFullCheck: true,
        isRunBatchProcess: true,
        isOddRefresh: false,
        isSpdRefresh: false,
        isRampMerge: false,
        rampProductName: '',
        rampProductBranch: '',
      };
    },
    createCSVersion() {
      this.breadcrumbCSVersionShow = true;
      this.crowdsourcingForm = {
        productIdentity: '',
        descName: '',
        branch: '',
        owner: '',
        isCompile: false,
        isRampMerge: false,
        specification: '',
        rampProductName: '',
        rampProductBranch: ''
      };
    },
    createServiceArea() {
      this.breadcrumbServiceShow = true;
      this.serviceForm = {
        productIdentity: '',
        descName: '',
        branch: '',
        owner: '',
        isCompile: false,
      };
    },
    createPointCloud() {
      let list = this.selectionRows.list;
      const warning = function (message) {
        ElMessage.warning({
          message: message,
          showClose: false,
          grouping: true,
        });
      };
      if (list.length === 0) {
        warning('请选择HD版本');
      } else if (list.length > 1) {
        warning('只能选择一个HD版本');
      } else if (list[0].compileStatus === '编译通过') {
        ElMessageBox.confirm(
            `确认为<span class="box-confirm-title">${list[0].releaseVersion}</span>发版点云吗？`,
            '确认',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              showClose: false,
              dangerouslyUseHTMLString: true,
            }
        ).then(() => {
          const formData = new FormData();
          formData.append('productIdentity', list[0].productIdentity);
          formData.append('limit', 1e7);
          formData.append('offset', 0);
          formData.append('tag', list[0].tag);
          axios.post( nioDataURL + '/data/get-partition/v2', formData).then(res => {
            if (res.data.code === 200) {
              let meshList = res.data.data.partitionsByLayer[0].partitions.map(item => item.partitionName);
              return Promise.resolve(meshList);
            } else {
              throw new Error(res.data.msg);
            }
          }).catch(err => {
            ElMessage.warning({
              message: err.message,
              showClose: false,
              grouping: true,
            });
          }).then(res => {
            if (res instanceof Array) {
              axios.post(nioPowerSwapURL + '/nio/power-swap-station/release/create', {
                hdReleaseVersion: list[0].releaseVersion,
                meshList: res,
              }).then(res => {
                if (res.data.code === 0) {
                  ElMessage.success({
                    message: '发版成功',
                    showClose: false,
                    grouping: true,
                  });
                } else {
                  throw new Error();
                }
              }).catch(err => {
                ElMessage.warning({
                  message: '点云发版失败！请检查网络情况',
                  showClose: false,
                  grouping: true,
                });
              });
            }
          });
        }).catch(err => {});
      } else {
        warning('该版本未通过编译');
      }
    },
    // 执行函数接口
    handelVersion() {
      let commitData = new FormData();
      commitData.append("productIdentity", this.detailForm.productIdentity);
      commitData.append("descName", this.detailForm.descName);
      commitData.append("branch", this.detailForm.branch);
      commitData.append("owner", sessionStorage.getItem('realName'));
      commitData.append("isCompile", this.detailForm.isCompile);
      commitData.append("isFullCheck", this.detailForm.isFullCheck);
      commitData.append("isRunBatchProcess", this.detailForm.isRunBatchProcess);
      commitData.append("isOddRefresh", this.detailForm.isOddRefresh);
      commitData.append("isSpdRefresh", this.detailForm.isSpdRefresh);
      commitData.append("isRampMerge", this.detailForm.isRampMerge);
      if (this.detailForm.isRampMerge) {
        if (this.detailForm.rampProductName && this.detailForm.rampProductBranch){
          commitData.append("rampProductName", this.detailForm.rampProductName);
          commitData.append("rampProductBranch", this.detailForm.rampProductBranch);
        } else {
          ElMessage.warning({
            message: '匝道信息不全',
            showClose: true,
          });
        }
      }
      if (this.detailForm.productIdentity) {
        axios({
          url: nioReleaseURL + '/release-version/create',
          method: 'post',
          data: commitData
        }).then(response => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: '创建release版本成功',
              showClose: true,
            });
            this.breadcrumbVersionShow = false
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '创建release版本失败',
            showClose: true,
          });
        });
      } else {
        ElMessage.warning({
          message: '数据不全',
          showClose: true,
        });
      }
    },
    //新建众包底图发布接口
    handelCS() {
      let commitData = new FormData();
      commitData.append("productIdentity", this.crowdsourcingForm.productIdentity);
      commitData.append("descName", this.crowdsourcingForm.descName);
      commitData.append("branch", this.crowdsourcingForm.branch);
      commitData.append("owner", this.crowdsourcingForm.owner);
      commitData.append("compileMeta", this.crowdsourcingForm.compileMeta);
      commitData.append("baseNdsReleaseVersion", this.crowdsourcingForm.baseNdsReleaseVersion);
      commitData.append("isCompile", this.crowdsourcingForm.isCompile);
      commitData.append("isRampMerge", this.crowdsourcingForm.isRampMerge);
      commitData.append("isMergeSd", this.crowdsourcingForm.isMergeSd);
      commitData.append("rampProductBranch", this.crowdsourcingForm.rampProductBranch);
      commitData.append("rampProductName", this.crowdsourcingForm.rampProductName);
      commitData.append("specification", this.crowdsourcingForm.specification);
      if (this.crowdsourcingForm.productIdentity && this.crowdsourcingForm.branch) {
        axios({
          url: nioReleaseURL + '/release-cs',
          method: 'post',
          data: commitData,
        }).then(response => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: '新建众包底图成功',
              showClose: true,
            });
            this.breadcrumbCSVersionShow = false;
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '新建众包底图失败',
            showClose: true,
          });
        });
      } else {
        ElMessage.warning({
          message: '数据不全',
          showClose: true,
        });
      }
    },
    //新建服务区接口
    handelService() {
      let commitData = new FormData();
      commitData.append("productIdentity", this.serviceForm.productIdentity);
      commitData.append("descName", this.serviceForm.descName);
      commitData.append("branch", this.serviceForm.branch);
      commitData.append("owner", this.serviceForm.owner);
      commitData.append("referenceProduct", this.serviceForm.referenceProduct);
      commitData.append("isCompile", this.serviceForm.isCompile);
      if (this.serviceForm.productIdentity && this.serviceForm.referenceProduct) {
        axios({
          url: nioReleaseURL + '/park-release-version/create',
          method: 'post',
          data: commitData,
        }).then(response => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: '新建服务区成功',
              showClose: true,
            });
            this.breadcrumbServiceShow = false;
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '新建服务区失败',
            showClose: true,
          });
        });
      } else {
        ElMessage.warning({
          message: '数据不全',
          showClose: true,
        });
      }
    },
    //hotfix发布接口
    handelHotFix() {
      let releaseParams ={
        productIdentity: this.hotfixForm.productIdentity,
        productType: this.hotfixForm.productType,
        descName: this.hotfixForm.descName,
        compileMeta: this.hotfixForm.compileMeta,
        isCompile: this.hotfixForm.isCompile,
        releaseEnv: "prod",
        releaseType: "cs_map",
        baseReleaseVersion: this.hotfixForm.baseReleaseVersion,
        lineCode: this.hotfixForm.lineCode,
        postLineCode: this.hotfixForm.postLineCode,
        specification: "NAD2.06",
        isHotFix: "1"
      }
      let pmsParams = {
        productName: "productIdentity",
        specification: "specification",
        isHotFix: "isHotFix",
        productBranch:"productBranch",
        baseNdsReleaseVersion: "parentNdsReleaseVersion"
      }
      let compileOnSuccessStages = this.hotfixForm.compileOnSuccessStages;
      if(this.hotfixForm.isRelease){
        compileOnSuccessStages =  this.hotfixForm.compileOnSuccessStagesWithPost
      }

      if (this.hotfixForm.productIdentity && this.hotfixForm.baseReleaseVersion) {
        axios({
          url: nioReleaseURL + '/release-version/create/v2',
          method: 'post',
          data: {
            releaseParams: releaseParams,
            pmsParams: pmsParams,
            releaseStages: this.hotfixForm.releaseStages,
            pmsOnSuccessStages: this.hotfixForm.pmsOnSuccessStages,
            pmsOnFailureStages: this.hotfixForm.pmsOnFailureStages,
            compileOnSuccessStages: compileOnSuccessStages,
            compileOnFailureStages: this.hotfixForm.compileOnFailureStages,
            postReleaseOnCompleteStages: [],
            productDependency: []
          },
          headers: {
            'content-type': 'application/json'
          },
        }).then(response => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: 'hotfix启动成功',
              showClose: true,
            });
            this.breadcrumbCSVersionShow = false;
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: 'hotfix启动失败',
            showClose: true,
          });
        });
      } else {
        ElMessage.warning({
          message: '数据不全',
          showClose: true,
        });
      }
    },
    // 筛选查询功能
    onSearch() {
      this.currentPage = 1;
      this.loadingPage();
    },
    // 重置功能
    reSet() {
      this.VersionForm = {
        productIdentity: '',
        releaseVersion: '',
        checkStatus: ['UNCHECKED', 'CHECK_PASS', 'CHECK_FAILED'],
        compileStatus: ['NOT_COMPILED', 'SUCCESS', 'FAILED'],
        sortDirection: true,
      }
    },
    // 面包屑按钮跳转
    versionFun() {
      this.breadcrumbVersionShow = false;
      this.breadcrumbServiceShow = false;
      this.breadcrumbCSVersionShow = false;
      this.loadingPage();
      store.commit('breadChange', 1);
    },
    // 获取表格信息功能
    loadingPage() {
      let commitData = new FormData();
      commitData.append("productIdentity", this.VersionForm.productIdentity);
      commitData.append("releaseVersion", this.VersionForm.releaseVersion);
      commitData.append("checkStatus", this.VersionForm.checkStatus);
      commitData.append("compileStatus", this.VersionForm.compileStatus);
      commitData.append("sortDirection", this.VersionForm.sortDirection === true ? 'desc' : 'asc');
      commitData.append("limit", this.pageSize);
      commitData.append("offset", this.offset);
      this.loading = true;
      axios({
        url: nioReleaseURL + '/release-version/list',
        method: 'post',
        data: commitData,
      }).then(response => {
        if (response.data.code === 200) {
          this.total = response.data.data.totalCount;
          this.tableData = response.data.data.versionList;
          // 整理表格中的数据
          for (let i in this.tableData) {
            // 整理表格数据中的序号
            this.tableData[i].exceptionNum = parseInt(i) + 1;
            this.tableData[i].createTime = this.dateToString(this.tableData[i].createTime);
            this.tableData[i].referenceStr = this.tableData[i].referenceList.join(',');
            for (let v of this.checkStatusOptions) {
              if (this.tableData[i].checkStatus === v.value) {
                this.tableData[i].checkStatus = v.label;
              }
            }
            for (let v of this.compileStatusOptions) {
              if (this.tableData[i].compileStatus === v.value) {
                this.tableData[i].compileStatus = v.label;
              }
            }
          }
          //根据HD版本查询点云发版状态
          const hdReleaseVersion = this.tableData.map(item => {
            return item.releaseVersion
          });
          axios.post(nioPowerSwapURL + '/nio/power-swap-station/release/query', hdReleaseVersion).then(res => {
            //O2时间复杂度，量也不大懒得优化
            res.data.data.forEach(item => {
              for (let i = 0; i < this.tableData.length; i++) {
                if (item.hdReleaseVersion === this.tableData[i].releaseVersion) {
                  this.tableData[i].releaseStatus = item.releaseStatus;
                  this.tableData[i].releaseDetailFile = item.releaseDetailFile;
                  break;
                }
              }
            });
          });
        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '没有获取到数据',
          showClose: true,
        });
      }).finally(() => {
        this.loading = false;
      });
    },
    // 表格size改变时触发函数
    handleSizeChange(page_size) {
      this.pageSize = page_size;
      this.loadingPage()
    },
    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.currentPage = page;
      this.offset = (page - 1) * this.pageSize;
      this.loadingPage();
    },
  },
  mounted() {
    // 页面加载时调用函数
    this.loadingPage()
  }
}
</script>

<style scoped>
#breadcrumb {
  padding: 6px 0 2px 20px;
  font-size: 15px;
  font-weight: bold;
}
</style>
