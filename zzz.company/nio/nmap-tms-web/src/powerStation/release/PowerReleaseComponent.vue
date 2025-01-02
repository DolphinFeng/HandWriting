<template>
  <div id="PowerReleaseComponent" class="component">
    <!-- 面包屑：展示换电站发版详情 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">换电站管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem" @click="PowerReleaseShow('powerEdition')"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }">版本列表
        </div>
      </el-breadcrumb-item>
      <el-breadcrumb-item
        v-if="breadcrumbPowerShow === 'powerEditionDetail' || breadcrumbPowerShow === 'powerEditionDetailPerPS'">
        <div class="breadcrumbItem" @click="PowerReleaseShow('powerEditionDetail')"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 2 }">版本详情
        </div>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="breadcrumbPowerShow === 'powerEditionDetailPerPS'">
        <div class="breadcrumbItem" :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 3 }">换电站详情
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <PowerSearch 
      :power-search-form="powerSearchForm" 
      :show-power-search-form="showPowerSearchForm"
      :loading="loading"
      @powerSearchHandler="powerSearchHandler" 
      @resetPowerHandler="resetPowerHandler"></PowerSearch>
    <!-- 主表格信息组件 -->
    <PowerEditionTable 
      v-if="breadcrumbPowerShow === 'powerEdition'" 
      :tableData="tableData" 
      @handleDetail="handleDetail"
      @handleDescName="handleDescName" 
      @handleSizeChange="handleSizeChange" 
      @handleCurrentChange="handleCurrentChange">
    </PowerEditionTable>
    <!--产品详情-->
    <PowerEditionDetail 
      v-if="breadcrumbPowerShow === 'powerEditionDetail'" 
      :powerEditionDetailForm="powerEditionDetailForm"
      :productId="productId" 
      :releaseVersion="releaseVersion" 
      @PowerReleaseShow="PowerReleaseShow"
      @handleSkip="handleSkip"></PowerEditionDetail>
    <!-- 编辑分支 -->
    <PowerEditionDetailPerPs 
      v-if="breadcrumbPowerShow === 'powerEditionDetailPerPS'" 
      :pssId="pssId">
    </PowerEditionDetailPerPs>
    <StringListDialog 
      :showDialog="showDescNameDetail" 
      title="换电站名称" 
      :listData="curDescNameDetail" 
      @close="handleCloseDescName"/>
  </div>
</template>

<script>
// 引入需要的组件
import PowerEditionTable from "./PowerEditionTable.vue";
import PowerSearch from "./PowerSearch.vue";
import PowerEditionDetail from "./PowerEditionDetail.vue";
import PowerEditionDetailPerPs from "./PowerEditionDetailPerPS.vue";
import StringListDialog from "@/components/FieldDetail/StringListDialog.vue";
import { ArrowRight, Refresh } from "@element-plus/icons-vue";
// 引入js数据
import { powerEditionDetailForm } from "@/js/power_release_data.js";
import { ElMessage } from "element-plus";
import axios from "axios";
import store from "../../store/index.js";
import { reactive, ref } from "vue";

const nioReleaseURL = window.api.nioReleaseURL;
const nioPowerSwapURL = window.api.nioPowerSwapURL;

const pssProductName = 'cloud_hd_version_yanshou';

let CNNameIdMap = new Map();

export default {
  name: "PowerReleaseComponent",
  // 组件注册
  components: {
    PowerSearch,
    PowerEditionTable,
    PowerEditionDetail,
    PowerEditionDetailPerPs,
    StringListDialog
  },
  data() {
    return {
      loading: false,
      breadcrumbPowerShow: 'powerEdition',
      productId: '',
      branchTagId: '',
      releaseVersion: '',
      pssId: '',
      // 存储是分支还是tag
      typeId: '',
      powerEditionDetailForm: {
        ...powerEditionDetailForm
      },
      showDescNameDetail: false,
      curDescNameDetail: null
    }
  },
  setup() {
    const tableData = reactive({
      list: [],
      pageSize: 20,
      total: 0,
      currentPage: 1,
    });
    // 不带搜索的查询
    const loadingPage = function (stationIds, releaseStatus, releaseVersions) {
      if (this.loading) {
        return;
      }
      if (stationIds === undefined) {
        stationIds = [];
      }

      if (releaseStatus === undefined) {
        releaseStatus = [];
      }

      if (releaseVersions === undefined) {
        releaseVersions = [];
      }

      this.loading = true;
      axios({
        url: nioReleaseURL + '/stations/releases/query',
        method: 'post',
        data: {
          stationIds: stationIds,
          releaseStatus: releaseStatus,
          releaseVersions: releaseVersions,
          limit: tableData.pageSize,
          offset: tableData.pageSize * (tableData.currentPage - 1)
        }
      }).then(response => {
        if (response.data.code === 200) {
          if (response.data.msg !== 'success') {
            ElMessage.warning({
              message: '没有数据',
              showClose: true,
            });
            this.loading = false;
            return;
          }

          tableData.list = [];
          tableData.total = response.data.data.totalCount;
          const listStationRelease = response.data.data.stationRelease;
          let pcList = [];
          listStationRelease.map((station) => {
            station.pointCloudDtoList.map((pointCloundDto) => {
              pcList.push(pointCloundDto);
              return pointCloundDto;
            });
            return station;
          });

          axios({
            url: nioPowerSwapURL + '/nio/material/batch/queryVersionInfo',
            method: 'post',
            data: pcList,
            headers: {
              'content-type': 'application/json'
            }
          }).then(response2 => {

            this.loading = false;
            if (response2.data.msg === 'SUCCESS') {
              let pcMap = new Map();
              let businessIdMap = new Map();
              for (let i = 0; i < response2.data.data.length; i++) {
                pcMap.set(JSON.stringify(pcList[i]), response2.data.data[i]);
                businessIdMap.set(pcList[i].businessId, response2.data.data[i]);
                CNNameIdMap.set(response2.data.data[i].businessCn, response2.data.data[i].businessId)
              }

              let stationRelease = response.data.data.stationRelease;
              for (let i = 0; i < stationRelease.length; i++) {
                let stationReferences = stationRelease[i].stationReferences;
                let pointCloudDtoList = stationRelease[i].pointCloudDtoList;

                let descNameList = [];
                for (let j = 0; j < pointCloudDtoList.length; j++) {
                  let str = JSON.stringify(pointCloudDtoList[j]);
                  if (pcMap.has(str)) {
                    descNameList.push(pcMap.get(str).businessCn);
                  }
                }

                let stg = '';
                let prod = '';

                if (stationRelease[i].releaseEnv === 'prod') {
                  prod = stationRelease[i].releaseStatus;
                } else if (stationRelease[i].releaseEnv === 'stg') {
                  stg = stationRelease[i].releaseStatus;
                }

                if (stationReferences === null || stationReferences.length === 0) {
                  tableData.list.push({
                    productIdentity: stationRelease[i].productIdentity,
                    productTag: stationRelease[i].productTag,
                    releaseVersion: stationRelease[i].releaseVersion,
                    baseMapVersion: '',
                    descNameList: descNameList,
                    descName: descNameList.join(";"),
                    prod: prod,
                    stg: stg,
                    edgeCheckFailed: '',
                    releaseTime: stationRelease[i].releaseTime,
                    baseMapReleaseTime: '',
                  });

                  //按时间排序
                  tableData.list.sort((a, b) => {
                    return new Date(b.releaseTime) - new Date(a.releaseTime);
                  });
                } else {
                  for (let j = 0; j < stationReferences.length; j++) {
                    let edgeCheckFailed = '';

                    let edgeCheckFailedStations = stationReferences[j].edgeCheckFailedStations;
                    for (let k = 0; k < edgeCheckFailedStations.length; k++) {
                      if (businessIdMap.has(edgeCheckFailedStations[k])) {
                        edgeCheckFailed += businessIdMap.get(edgeCheckFailedStations[k]).businessCn + ';';
                      }
                    }

                    tableData.list.push({
                      productIdentity: stationRelease[i].productIdentity,
                      productTag: stationRelease[i].productTag,
                      releaseVersion: stationRelease[i].releaseVersion,
                      baseMapVersion: stationReferences[j].releaseVersion,
                      descNameList: descNameList,
                      descName: descNameList.join(";"),
                      prod: prod,
                      stg: stg,
                      edgeCheckFailed: edgeCheckFailed,
                      releaseTime: stationRelease[i].releaseTime,
                      baseMapReleaseTime: stationReferences[j].releaseTime,
                    });

                    //按时间排序
                    tableData.list.sort((a, b) => {
                      return new Date(b.releaseTime) - new Date(a.releaseTime);
                    });
                  }
                }
              }
            }
          })

        } else {
          this.loading = false;
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch((err) => {
        this.loading = false;
        ElMessage.error({
          message: '没有获取到数据' + err.message,
          showClose: true,
        });
      });
    };

    //搜索内容
    const powerSearchForm = reactive({
      id: '',
      chineseName: '',
      releaseStatus: '',
      psVersion: '',
      mapId: '',
    });
    //查询事件
    const powerSearchHandler = function () {
      let stationIds = [];
      if (powerSearchForm.id !== '') {
        stationIds = [powerSearchForm.id];
      } else if (powerSearchForm.chineseName !== '') {
        for (let [key, val] of CNNameIdMap.entries()) {
          if (key.indexOf(powerSearchForm.chineseName) != -1) {
            stationIds = stationIds.concat(val);
          }
        }
      }

      loadingPage(stationIds,
        powerSearchForm.releaseStatus !== '' ? [powerSearchForm.releaseStatus] : [],
        powerSearchForm.psVersion !== '' ? [powerSearchForm.psVersion] : []
      );
    };
    const resetPowerHandler = function () {
      powerSearchForm.id = '';
      powerSearchForm.chineseName = '';
      powerSearchForm.releaseStatus = '';
      powerSearchForm.psVersion = '';
      powerSearchForm.mapId = '';
    };
    const showPowerSearchForm = ref(true);
    return {
      ArrowRight, Refresh, powerSearchForm, showPowerSearchForm, tableData, loadingPage,
      powerSearchHandler, resetPowerHandler,
    }
  },
  methods: {
    // 面包屑显示节点
    PowerReleaseShow(val) {
      this.breadcrumbPowerShow = val;
      if (val === 'powerEdition') {
        this.powerSearchHandler();
        this.showPowerSearchForm = true;
        store.commit('breadChange', 1);
      } else if (val === 'powerEditionDetail') {
        store.commit('breadChange', 2);
      } else {
        store.commit('breadChange', 3);
      }
    },
    handleSkip(row) {
      this.pssId = row.businessId;
    },
    handleDetail(row) {
      store.commit('breadChange', 2);
      this.showPowerSearchForm = false;
      this.productId = row.productIdentity;
      this.releaseVersion = row.releaseVersion;

      for (let i in this.powerEditionDetailForm) {
        for (let j in row) {
          if (i === j) {
            this.powerEditionDetailForm[i] = row[j]
          }
        }
      }
      this.breadcrumbPowerShow = 'powerEditionDetail'
    },
    handleDescName(row) {
      this.curDescNameDetail = row.descNameList;
      this.showDescNameDetail = true;
    },
    handleCloseDescName() {
      this.showDescNameDetail = false;
      this.curDescNameDetail = [];
    },
    // 表格size改变时触发函数
    handleSizeChange(pageSize) {
      this.tableData.pageSize = pageSize;
      this.tableData.currentPage = 1;
      this.loadingPage();
    },
    // 表格当前页码改变时触发函数
    handleCurrentChange(curPage) {
      this.tableData.currentPage = curPage;
      this.loadingPage();
    },
  },

  mounted() {
    this.loadingPage();
  }
}
</script>
<style scoped>
:deep(.el-form-item) {
  margin-bottom: 0;
}
</style>
