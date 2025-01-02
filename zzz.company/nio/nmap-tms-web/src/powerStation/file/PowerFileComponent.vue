<!--suppress JSValidateTypes -->
<template>
  <div id="PowerSettingComponent" class="component">
    <!-- 面包屑：展示产品的产品详情 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">换电站管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem" @click="powerFileShow('powerMaterial')"
          :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1}">换电站资料
        </div>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="breadcrumbPowerShow==='powerFileDetailPerPS'">
        <div class="breadcrumbItem" @click="powerFileShow('powerFileDetailPerPS')"
          :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 2}">换电站详情
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏 -->
    <div v-if="breadcrumbPowerShow==='powerMaterial'" class="psTool">
      <el-form inline :data="station_search" label-position="right" ref="form" id="formDiv" @submit.prevent="search">
        <el-form-item label="换电站ID：">
          <el-input v-model.trim="station_search.powerSwapStationId" placeholder="请输入换电站id" style="width: 160px;"
                    clearable></el-input>
        </el-form-item>
        <el-form-item label="换电站中文名：">
          <el-input v-model.trim="station_search.powerSwapStationNameCn" placeholder="请输入中文名"
                    style="width: 160px;"
                    clearable></el-input>
        </el-form-item>
        <el-form-item label="换电站英文名：">
          <el-input v-model.trim="station_search.powerSwapStationNameEn" placeholder="请输入英文名" style="width: 160px"
                    clearable></el-input>
        </el-form-item>
        <el-form-item label="换电站deviceId：">
          <el-input v-model.trim="station_search.deviceId" placeholder="请输入换电站deviceId" style="width: 180px"
                    clearable></el-input>
        </el-form-item>
        <div style="height: 36px;">
          <el-button :icon="Search" type="primary" native-type="submit">查询</el-button>
          <el-button :icon="Refresh" @click="resetForm">重置</el-button>
          <el-button :icon="FolderAdd" type="success" @click="openUploadDialog">上传原始资料</el-button>
        </div>
      </el-form>
    </div>
    <!-- 主表格 -->
    <div v-if="breadcrumbPowerShow==='powerMaterial'" id="StationTableContainer" class="table">
      <!-- 表格 -->
      <div class="table-container"
           v-loading="loading"
           element-loading-text="拼命加载中..."
           :element-loading-spinner="svg"
           element-loading-svg-view-box="-10, -10, 50, 50"
      >
        <el-table
            :data="table.tableData"
            border
            :max-height="table.tableHeight"
        >
          <el-table-column fixed="left" align="center" prop="id" label="资料ID" key="id"
                           width="100"></el-table-column>
          <el-table-column fixed="left" align="center" prop="powerSwapStationId" label="换电站ID"
                           key="powerSwapStationId" min-width="90"></el-table-column>
          <el-table-column fixed="left" align="center" prop="powerSwapStationNameCn" label="换电站中文名"
                           key="powerSwapStationNameCn" min-width="320">
            <template #default="scope">
              <el-button @click="powerFileDetail(scope.row)" link type="primary">
                {{ scope.row.powerSwapStationNameCn }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="powerSwapStationNameEn" label="换电站英文名"
                           key="powerSwapStationNameEn" width="140"></el-table-column>
          <el-table-column align="center" prop="deviceId" label="换电站deviceID" key="deviceId"
                           min-width="240"></el-table-column>
          <el-table-column align="center" prop="trajectoryId" label="轨迹ID" key="trajectoryId"
                           min-width="160"></el-table-column>
          <el-table-column align="center" prop="materialStatus" label="资料状态" key="materialStatus" min-width="120">
            <template #default="{row}">
              <el-tag :type="getMaterialStatus(row.materialStatus, true)">{{ getMaterialStatus(row.materialStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="locationGeofence" label="定位地理围栏" key="locationGeofence"
                           min-width="120">
            <template #default="{row}">
              <el-link v-if="row.locationGeofence" type="primary" class="link-btn" :underline="false"
                       @click="showJsonViewer('定位地理围栏', row.locationGeofence)">查看
              </el-link>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="rotationMatrix" label="点云旋转矩阵" key="rotationMatrix"
                           min-width="120">
            <template #default="{row}">
              <el-link v-if="row.rotationMatrix" type="primary" class="link-btn" :underline="false"
                       @click="showJsonViewer('点云旋转矩阵', row.rotationMatrix)">查看
              </el-link>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="ndtFile" label="NDT点云交付文件" key="ndtFile" min-width="140">
            <template #default="{row}">
              <el-link v-if="row.ndtFile" type="primary" class="link-btn" :underline="false" @click="downLoadNdt(row)">
                下载
              </el-link>
              <el-link v-else-if="row.pointcloudNdtId" type="primary" class="link-btn" :underline="false"
                       @click="confirmTransform(row)">转换
              </el-link>
              <el-tag v-else type="warning">未作业</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="ndtTransitionStatus" label="NDT点云转换状态" key="ndtTransitionStatus"
                           min-width="140">
            <template #default="{row}">
              <el-tag :type="getNdtStatus(row['ndtTransitionStatus'], true)">
                {{ getNdtStatus(row['ndtTransitionStatus'], false) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="autoAnnotationFilePath" label="点云自动化成果文件"
                           key="autoAnnotationFilePath" min-width="160">
            <template #default="{row}">
              <el-popover v-if="row.autoAnnotationFileId" :width="350" placement="left" trigger="hover" :show-after="300">
                <div>{{ row.autoAnnotationFilePath }}</div>
                <template #reference>
                  <el-link type="primary" class="link-btn" :underline="false" :href="row.autoAnnotationFilePath">下载
                  </el-link>
                </template>
              </el-popover>
              <!-- <el-popover v-else :width="350" placement="left" trigger="hover" :show-after="300">
                <div>{{ row.autoAnnotationFilePath }}</div>
                <template #reference>
                  <div class="single-line-ellipsis">{{ row.autoAnnotationFilePath }}</div>
                </template>
              </el-popover> -->
            </template>
          </el-table-column>
          <el-table-column align="center" prop="createTime" label="创建时间" key="createTime"
                           min-width="180"></el-table-column>
          <el-table-column align="center" prop="materialVersionUpdateTime" label="资料版本更新时间"
                           key="materialVersionUpdateTime" min-width="180"></el-table-column>
          <el-table-column align="center" prop="materialVersionId" label="资料版本ID" key="materialVersionId"
                           min-width="180"></el-table-column>
          <el-table-column align="center" prop="materialVersionNum" label="资料版本号" key="materialVersionNum"
                           min-width="180"></el-table-column>
          <el-table-column align="center" prop="materialVersionStatus" label="资料版本状态" key="materialVersionStatus"
                           min-width="180">
            <template #default="{row}">
              <el-tag :type="getMaterialVersionStatus(row['materialVersionStatus'], true)">
                {{ getMaterialVersionStatus(row['materialVersionStatus'], false) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="relationHdProductName" label="关联HD产品库名称"
                           key="relationHdProductName"
                           min-width="180"></el-table-column>
          <el-table-column align="center" prop="autoAnnotationCreateTime" label="点云自动化成功创建时间"
                           key="autoAnnotationCreateTime" min-width="180"></el-table-column>
          <el-table-column align="center" prop="locationGeofenceCreateTime" label="定位地理围栏创建时间"
                           key="locationGeofenceCreateTime" min-width="180"></el-table-column>
          <el-table-column align="center" prop="rotationMatrixCreateTime" label="点云旋转矩阵创建时间"
                           key="rotationMatrixCreateTime" min-width="180"></el-table-column>
          <el-table-column align="center" prop="ndtCreateTime" label="NDT点云转换时间" key="ndtCreateTime"
                           min-width="180"></el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <div style="padding-top: 10px" class="tPaginationContainer">
        <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="table.currentPage"
            :page-sizes="[5, 10, 20, 50, 200]"
            :page-size="table.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="table.total">
        </el-pagination>
      </div>
    </div>
    <!-- 编辑分支 -->
    <PowerEditionDetailPerPs
      v-if="breadcrumbPowerShow==='powerFileDetailPerPS'"
      :pssId="pssId"
    ></PowerEditionDetailPerPs>
    <!-- 上传原始资料对话框 -->
    <el-dialog
        title="上传原始资料"
        v-model="materialData.dialogShow"
        :show-close="false"
        @close="closeMaterialDialog"
        :width="600"
    >
      <el-form style="margin-left: 40px" ref="materialRef" :model="materialData.form" label-position="right"
               label-width="130px"
               :rules="materialData.rules">
        <el-form-item prop="powerSwapStationId" label="换电站名称：">
          <el-select
              v-model="materialData.form.powerSwapStationId"
              placeholder="请选择一个换电站"
              remote
              filterable
              clearable
              :remote-method="remoteQuery"
              loading-text="查询中"
              no-match-text="没有匹配的换电站"
              no-data-text="没有匹配的换电站"
              :loading="materialData.loading"
              style="width: 300px"
          >
            <el-option
                v-for="item in materialData.options"
                :key="item.powerSwapStationId"
                :label="item.powerSwapStationCnName"
                :value="item.powerSwapStationId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="s3Bucket" label="s3 bucket：">
          <el-input v-model="materialData.form.s3Bucket" placeholder="请输入s3Bucket" clearable
                    style="width: 300px;"></el-input>
        </el-form-item>
        <el-form-item prop="s3Key" label="s3 key：">
          <el-input v-model="materialData.form.s3Key" placeholder="请输入s3Key" clearable
                    style="width: 300px;"></el-input>
        </el-form-item>
        <el-form-item prop="pointCloudVersion" label="点云入库版本：">
          <el-input v-model="materialData.form.pointCloudVersion" placeholder="请输入点云入库版本" clearable
                    style="width: 300px;"></el-input>
        </el-form-item>
        <el-form-item style="font-weight: bold" prop="powerSwapStationId" label="换电站Id："
                      v-if="materialData.form.powerSwapStationId">
          <span style="font-weight: normal">{{ materialData.form.powerSwapStationId }}</span>
        </el-form-item>
        <el-form-item style="font-weight: bold" prop="powerSwapStationEnName" label="英文名："
                      v-if="materialData.form.powerSwapStationId">
          <span style="font-weight: normal">{{ materialData.form.powerSwapStationEnName }}</span>
        </el-form-item>
        <el-form-item style="font-weight: bold" prop="mesh" label="图幅号：" v-if="materialData.form.powerSwapStationId">
          <span style="font-weight: normal">{{ materialData.form.mesh }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="materialData.dialogShow = false">取消</el-button>
        <el-button type="primary" @click="uploadMaterial" :loading="materialData.uploading">上传</el-button>
      </template>
    </el-dialog>
    <!-- 查看JSON内容 -->
    <JsonView
      :title="jsonViewData.title"
      v-model:visible="jsonViewData.visible"
      :data="jsonViewData.data"
    >
    </JsonView>
  </div>
</template>

<script>
import {Search, Refresh, ArrowRight, FolderAdd} from "@element-plus/icons-vue";
import {nextTick, onMounted, reactive, ref, watch} from "vue";
import axios from "axios";
import {ElMessage, ElMessageBox} from "element-plus";
import {svg} from "@/js/loading_data.js";
import JsonView from "@/jsonView/JsonView.vue";
import store from "../../store/index.js";
import PowerEditionDetailPerPs from "../release/PowerEditionDetailPerPS.vue";

const nioPowerSwapURL = window.api.nioPowerSwapURL;
export default {
  name: "PowerFileComponent",
  components: {JsonView, PowerEditionDetailPerPs},

  data() {
      return {
          breadcrumbPowerShow: 'powerMaterial',
          pssId: '10',
      }
  },

  setup() {
    const loading = ref(false);
    const station_search = reactive({
      powerSwapStationId: '',
      powerSwapStationNameCn: '',
      powerSwapStationNameEn: '',
      deviceId: '',
    });
    
    const table = reactive({
      tableData: [],
      tableHeight: 0,
      currentPage: 1,
      pageSize: 20,
      total: 0,
    });
    const materialData = reactive({
      loading: false,
      options: [],
      dialogShow: false,
      uploading: false,
      rules: {
        powerSwapStationId: [
          {required: true, message: '换电站名称必选', trigger: 'blur'},
        ],
        s3Bucket: [
          {required: true, message: '轨迹ID必填', trigger: 'blur'},
        ],
        s3Key: [
          {required: true, message: '点云名称必填', trigger: 'blur'},
        ],
        pointCloudVersion: [
          {required: true, message: '点云入库版本必填', trigger: 'blur'},
        ]
      },
      form: {
        powerSwapStationId: '',
        s3Bucket: '',
        s3Key: '',
        pointCloudVersion: '',
        mesh: '',
        powerSwapStationEnName: '',
      }
    });
    const materialRef = ref(null);
    const jsonViewData = reactive({
      visible: false,
      title: '',
      data: '{}',
    });

    const openUploadDialog = function () {
      materialData.dialogShow = true;
    };
    //远程搜索查询
    const remoteQuery = function (query) {
      materialData.loading = true;
      axios.get(nioPowerSwapURL + `/nio/power-swap-station/getMeshBySwapName/${query ? query : 'null'}`).then(res => {
        if (res.data.code === 0) {
          materialData.options = res.data.data ?? [];
        } else {
          throw new Error();
        }
      }).catch(err => {
        ElMessage.error({
          message: '远程查询换电站失败',
          showClose: false,
          grouping: true,
        });
      }).finally(() => {
        materialData.loading = false;
      });
    };
    watch(() => materialData.form.powerSwapStationId, (newVal, oldVal) => {
      if (newVal) {
        for (let i = materialData.options.length - 1; i >= 0; i--) {
          if (materialData.options[i].powerSwapStationId === newVal) {
            materialData.form.powerSwapStationEnName = materialData.options[i].powerSwapStationEnName;
            materialData.form.mesh = materialData.options[i].mesh;
          }
        }
        console.log(materialData.options);
      } else {
        materialData.form.powerSwapStationEnName = '';
      }
    });
    //提交原始资料
    const uploadMaterial = function () {
      materialRef.value.validate((valid, filed) => {
        if (valid) {
          materialData.uploading = true;
          axios.post(nioPowerSwapURL + '/nio/power-swap-station/material/submit', {
            powerSwapStationId: materialData.form.powerSwapStationId,
            s3Bucket: materialData.form.s3Bucket,
            s3Key: materialData.form.s3Key,
            pointCloudVersion: materialData.form.pointCloudVersion,
          }).then(res => {
            if (res.data.code === 0) {
              ElMessage.success({
                message: '上传成功',
                showClose: false,
                grouping: true,
              });
              materialData.dialogShow = false;
            } else {
              throw new Error(res.data.msg);
            }
          }).catch(err => {
            ElMessage.error({
              message: '原始资料上传失败:' + err.message,
              showClose: false,
              grouping: true,
            });
          }).finally(() => {
            materialData.uploading = false;
          });
        }
      });
    };
    const closeMaterialDialog = function () {
      materialRef.value.clearValidate();
      materialData.dialogShow = false;
      nextTick(() => {
        Object.assign(materialData.form, {
          powerSwapStationId: '',
          s3Bucket: '',
          s3Key: '',
        });
      });
    };

    const search = () => {
      table.currentPage = 1;
      loadingPage();
    };
    const resetForm = () => {
      Object.assign(station_search, {
        powerSwapStationId: '',
        powerSwapStationNameCn: '',
        powerSwapStationNameEn: '',
        deviceId: '',
      });
    };
    const handleSizeChange = (pageSize) => {
      table.pageSize = pageSize;
      loadingPage();
    };
    const handleCurrentChange = (page) => {
      table.currentPage = page;
      loadingPage();
    };
    const loadingPage = () => {
      loading.value = true;
      axios({
        url: nioPowerSwapURL + '/nio/power-swap-station/material/list',
        method: 'post',
        data: {
          powerSwapStationId: station_search.powerSwapStationId,
          powerSwapStationNameCn: station_search.powerSwapStationNameCn,
          powerSwapStationNameEn: station_search.powerSwapStationNameEn,
          deviceId: station_search.deviceId,
          pageNum: table.currentPage - 1,
          pageSize: table.pageSize,
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        if (res.data.code === 0) {
          table.total = res.data.totalCount;
          table.tableData = res.data.data;
        } else {
          table.tableData = [];
        }
      }).catch((err) => {
        ElMessage.error({
          message: err,
          showClose: true,
        });
      }).finally(() => {
        loading.value = false;
      })
    };

    const showJsonViewer = function (title, json) {
      jsonViewData.title = title;
      jsonViewData.data = json;
      jsonViewData.visible = true;
    };
    const getNdtStatus = function (status, isTag) {
      switch (status) {
        case 'CREATED':
          return isTag ? 'info' : '待执行';
        case 'RUNNING':
          return isTag ? 'warning' : '转换中';
        case 'SUCCESS':
          return isTag ? 'success' : '转换成功';
        case 'FAILURE':
          return isTag ? 'danger' : '转换失败';
        default:
          return isTag ? 'warning' : '未作业';
      }
    };
    const getMaterialVersionStatus = function (status, isTag) {
      switch (status) {
        case 'CREATED':
          return isTag ? 'info' : '初始化';
        case 'VALID':
          return isTag ? 'success' : '已生效';
        case 'INVALID':
          return isTag ? 'warning' : '未生效';
      }
    };
    const getMaterialStatus = function (status, isTag) {
      switch (status) {
        case 'NO_PUT_DB':
          return isTag ? 'info' : '入库中';
        case 'IS_PUT_DB':
          return isTag ? 'warning' : '已入库';
        case 'CHECKED_SUCCESS':
          return isTag ? 'success' : '验收通过';
        case 'CHECKED_FAILED':
          return isTag ? 'danger' : '验收不通过';
        case 'PUT_DB_FAILED':
          return isTag ? 'danger' : '入库失败';
        default:
          return isTag ? 'danger' : '未知状态';
      }
    };
    const confirmTransform = function (row) {
      ElMessageBox.confirm(
          `确认为记录ID<span class="box-confirm-title">${row.id}</span> 转换吗？`,
          '即将转换',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            showClose: false,
            dangerouslyUseHTMLString: true,
          }
      ).then(res => {
        ElMessage.info({
          message: '开始转换',
          showClose: false,
          grouping: true,
        });
        ndtTransform(row);
      }).catch(err => {
      });
    };
    const ndtTransform = function (row) {
      axios.post(nioPowerSwapURL + '/nio/power-swap-station/material/ndt/transition', {
        materialId: row.id.toString(), //资料Id
        pointcloudNdtId: row.pointcloudNdtId, //轨迹
      }).then(res => {
        if (res.data.code === 0) {
          ElMessage.success({
            message: '转换成功',
            showClose: false,
            grouping: true,
          });
        } else {
          throw new Error(res.data.msg);
        }
      }).catch(err => {
        ElMessage.warning({
          message: '转换失败',
          showClose: false,
          grouping: true,
        });
      });
    };
    const downLoadNdt = function (row) {
      axios.post(nioPowerSwapURL + '/nio/power-swap-station/material/ndt/download', {
        materialId: row.id.toString(), //资料Id
        pointcloudNdtId: row.pointcloudNdtId, //轨迹
      }, {
        responseType: 'blob',
      }).then(res => {
        let blob = new Blob([res.data]);
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = `${row.powerSwapStationId}-${row.powerSwapStationNameEn}.zip`;
        a.click();
        URL.revokeObjectURL(url);
      }).catch(err => {
        ElMessage.warning({
          message: '下载失败:' + err.message,
          showClose: false,
          grouping: true,
        });
      });
    };

    const adaptiveTableHeight = () => {
      table.tableHeight = document.getElementById('StationTableContainer') === null ? 0 : document.getElementById('StationTableContainer').offsetHeight;
    };

    onMounted(() => {
      loadingPage();
      nextTick(() => {
        adaptiveTableHeight();
      });
      window.addEventListener('resize', adaptiveTableHeight, false);
    });

    return {
      station_search,
      table,
      Search,
      Refresh,
      ArrowRight,
      loading,
      svg,
      FolderAdd,
      materialData,
      materialRef,
      jsonViewData,
      search,
      resetForm,
      handleSizeChange,
      handleCurrentChange,
      openUploadDialog,
      remoteQuery,
      uploadMaterial,
      closeMaterialDialog,
      showJsonViewer,
      confirmTransform,
      getNdtStatus,
      getMaterialVersionStatus,
      downLoadNdt,
      getMaterialStatus
    }
  },

  methods: {
    // 面包屑显示节点
    powerFileShow(val) {

      console.log("abc", val);

      this.breadcrumbPowerShow = val;
      if (val === 'powerMaterial') {
          store.commit('breadChange', 1);
      } else if (val === 'powerFileDetailPerPS') {
          store.commit('breadChange', 2);
      }
      else{
        console.log("empty");
      }
    }, 

    powerFileDetail(row) {
      this.pssId = row.powerSwapStationId;
      store.commit('breadChange', 2);
      this.breadcrumbPowerShow = 'powerFileDetailPerPS';
    },
  }
}
</script>

<style scoped>
.table{
  overflow: hidden;
}
.psTool {
  padding: 5px 0 5px 20px;
  text-align: left;
  color: black;
  font-size: 15px;
}

:deep(.link-column) {
  width: 400px !important;
  min-width: 400px !important;
  transition: width .3s;
}

:deep(.link-column:hover) {
  width: 300px;
}

.psTool .el-form-item {
  margin-bottom: 10px;
  margin-right: 20px;
}

.el-divider__text, .el-link {
  font-weight: normal;
}

.single-line-ellipsis {
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

</style>
