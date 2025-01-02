<!-- 停车场管理 -> 停车场资料 -->
<template>
  <div id="ParkingLotFile" class="component">
    <!-- 面包屑 停车场管理 -> 停车场资料 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">PN/PSP管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem active-breadcrumb-item">建图资料管理</div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏 -->
    <div class="psTool">
      <el-form inline :data="parking_lot_search" label-position="right" ref="form" id="formDiv" @submit.prevent="search">
        <el-form-item label="业务类型:" name="businessType">
          <el-select v-model.trim="parking_lot_search.businessType" placeholder="请选择业务类型（必填）"
            @change="chageSearchBusinessType" style="width: 200px" clearable>
            <el-option v-for="item in businessTypeOptions" :key="item.name" :label="item.desc" :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="业务场景ID：">
          <el-input v-model.trim="parking_lot_search.parkingLotId" placeholder="请输入业务场景id" style="width: 160px"
            clearable></el-input>
        </el-form-item>
        <el-form-item label="业务场景中文名：">
          <el-input v-model.trim="parking_lot_search.parkingLotNameCn" placeholder="请输入中文名" style="width: 160px"
            clearable></el-input>
        </el-form-item>
        <el-form-item label="业务场景英文名：">
          <el-input v-model.trim="parking_lot_search.parkingLotNameEn" placeholder="请输入英文名" style="width: 160px"
            clearable></el-input>
        </el-form-item>
        <el-form-item label="业务场景deviceId：">
          <el-input v-model.trim="parking_lot_search.deviceId" placeholder="请输入deviceId" style="width: 180px"
            clearable></el-input>
        </el-form-item>
        <div style="height: 36px">
          <el-button :icon="Search" type="primary" native-type="submit">查询</el-button>
          <el-button :icon="Refresh" @click="resetForm">重置</el-button>
          <el-button :icon="FolderAdd" type="success" @click="openUploadDialog">上传原始资料</el-button>
          <el-button type="success" @click="exportDetail">下载列表</el-button>
        </div>
      </el-form>
    </div>
    <!-- 外部container -->
    <div class="table">
      <!-- 表格 -->
      <div id="TableContainer" class="table-container" v-loading="loading" element-loading-text="拼命加载中..."
        :element-loading-spinner="svg" element-loading-svg-view-box="-10, -10, 50, 50">
        <el-table :data="table.tableData" :max-height="table.tableHeight" :border="true">
          <el-table-column fixed="left" align="center" prop="materialVersionId" label="资料版本ID" key="materialVersionId"
            width="100"></el-table-column>
          <el-table-column fixed="left" align="center" prop="materialId" label="资料ID" key="materialId"
            width="100"></el-table-column>
          <el-table-column fixed="left" align="center" prop="versionNum" label="资料版本号" key="materialId"
            width="100"></el-table-column>
          <el-table-column fixed="left" align="center" prop="businessId" label="业务场景ID" key="businessId"
            min-width="100"></el-table-column>
          <el-table-column fixed="left" align="center" prop="businessType" label="业务场景类型" key="businessType"
            min-width="120">
            <template #default="{ row }">
              <el-tag v-if="row.businessType == 'PN'">停车场</el-tag>
              <el-tag v-else-if="row.businessType == 'PSP'">换电站</el-tag>
              <el-tag v-else-if="row.businessType == 'RAMP'">匝道</el-tag>
              <el-tag v-else-if="row.businessType == 'KX'">快修</el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="left" align="center" prop="businessNameCn" label="业务场景中文名" key="businessNameCn"
            min-width="320">
            <template #default="scope">
              <el-tag type="success">{{ scope.row.businessNameCn }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="businessNameEn" label="业务场景英文名" key="businessNameEn"
            width="140"></el-table-column>
          <el-table-column align="center" prop="deviceId" label="业务场景deviceId" key="deviceId"
            width="160"></el-table-column>
          <el-table-column align="center" prop="trajectoryId" label="轨迹ID" key="trajectoryId"
            min-width="160"></el-table-column>
          <el-table-column align="center" prop="uploadTaskId" label="上传任务ID" key="uploadTaskId"
            min-width="160"></el-table-column>
          <el-table-column align="center" prop="materialStatus" label="资料状态" key="materialStatus" min-width="120">
            <template #default="{ row }">
              <el-tag :type="getMaterialStatus(row.materialStatus, true)">{{
                getMaterialStatus(row.materialStatus)
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="materialVersionStatus" label="资料版本状态" key="materialVersionStatus"
            min-width="180">
            <template #default="{ row }">
              <el-tag :type="getMaterialVersionStatus(row['materialVersionStatus'], true)">
                {{ getMaterialVersionStatus(row['materialVersionStatus'], false) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="materialStorePath" label="原始资料路径" key="materialStorePath" min-width="120">
            <template #default="{ row }">
              <el-link v-if="row.materialStorePath" type="primary" class="link-btn" :underline="false"
                @click="showJsonViewer('点云旋转矩阵', row.materialStorePath)">查看</el-link>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="locationGeofence" label="定位地理围栏" key="locationGeofence" min-width="120">
            <template #default="{ row }">
              <el-link v-if="row.locationGeofence" type="primary" class="link-btn" :underline="false"
                @click="showJsonViewer('定位地理围栏', row.locationGeofence)">查看</el-link>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="rotationMatrix" label="点云旋转矩阵" key="rotationMatrix" min-width="120">
            <template #default="{ row }">
              <el-link v-if="row.rotationMatrix" type="primary" class="link-btn" :underline="false"
                @click="showJsonViewer('点云旋转矩阵', row.rotationMatrix)">查看</el-link>
            </template>
          </el-table-column>

          <el-table-column align="center" prop="refFile" label="站心坐标" key="refFile" min-width="120">
            <template #default="{ row }">
              <el-link v-if="row.refFile" type="primary" class="link-btn" :underline="false"
                @click="showJsonViewer('站心坐标', row.refFile)">查看</el-link>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="autoAnnotationFilePath" label="点云自动化成果文件" key="refFile" min-width="120">
            <template #default="{ row }">
              <el-link v-if="row.refFile" type="primary" class="link-btn" :underline="false"
                :href="row.autoAnnotationFilePath">下载</el-link>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="relationHdProductName" label="资料版本关联的HD产品库名称" key="relationHdProductName"
            width="220"></el-table-column>
          <el-table-column align="center" prop="materialCreateTime" label="资料上传时间" key="materialCreateTime"
            width="120"></el-table-column>
          <el-table-column align="center" prop="materialUpdateTime" label="资料更新时间" key="materialUpdateTime"
            width="120"></el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <div style="padding-top: 10px" class="tPaginationContainer">
        <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page.sync="table.currentPage" :page-sizes="[5, 10, 20, 50]" :page-size="table.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="table.total">
        </el-pagination>
      </div>
    </div>
    <!-- 上传原始资料弹框 -->
    <el-dialog title="上传原始资料" v-model="materialData.dialogShow" :show-close="false" @close="closeMaterialDialog"
      :width="600">
      <el-form style="margin-left: 40px" ref="materialRef" label-position="right" label-width="130px"
        :model="materialData.form" :rules="materialData.rules">
        <!-- 停车场名称动态列表 -->
        <el-form-item label="业务类型:" name="businessType">
          <el-select v-model.trim="materialData.form.businessType" placeholder="请选择业务类型（必填）" style="width: 200px"
            clearable>
            <el-option v-for="item in businessTypeOptions" :key="item.name" :label="item.desc" :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="parkingId"
          v-if="materialData.form.businessType == 'PN' || materialData.form.businessType == 'PSP'" label="业务场景名称：">
          <el-select v-model="materialData.form.businessId" placeholder="请选择一个业务场景" remote filterable clearable
            :remote-method="remoteQuery" loading-text="查询中" no-match-text="没有匹配的业务场景" no-data-text="没有匹配的业务场景"
            :loading="materialData.loading" style="width: 300px">
            <el-option v-for="item in materialData.options" :key="item.businessId" :label="item.businessNameCn"
              :value="item.businessId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="s3Bucket" label="s3 bucket：">
          <el-input v-model="materialData.form.s3Bucket" placeholder="请输入s3Bucket" clearable
            style="width: 300px"></el-input>
        </el-form-item>
        <el-form-item prop="s3Key" label="s3 key：">
          <el-input v-model="materialData.form.s3Key" placeholder="请输入s3Key" clearable style="width: 300px"></el-input>
        </el-form-item>
        <el-form-item v-if="materialData.form.businessType == 'PSP'" prop="pointCloudVersion" label="点云入库版本：">
          <el-input v-model="materialData.form.pointCloudVersion" placeholder="请输入点云入库版本" clearable
            style="width: 300px"></el-input>
        </el-form-item>
        <el-form-item v-if="(materialData.form.businessType == 'PN' || materialData.form.businessType == 'PSP') &&
          materialData.form.businessId
          " prop="businessId" label="业务场景Id：" style="font-weight: bold">
          <span style="font-weight: normal">{{ materialData.form.businessId }}</span>
        </el-form-item>
        <el-form-item v-if="(materialData.form.businessType == 'PN' || materialData.form.businessType == 'PSP') &&
          materialData.form.businessId
          " prop="businessNameEn" label="英文名：" style="font-weight: bold">
          <span style="font-weight: normal">{{ materialData.form.businessNameEn }}</span>
        </el-form-item>
        <el-form-item v-if="(materialData.form.businessType == 'PN' || materialData.form.businessType == 'PSP') &&
          materialData.form.businessId
          " prop="mesh" label="图幅号：" style="font-weight: bold">
          <span style="font-weight: normal">{{ materialData.form.mesh }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="materialData.dialogShow = false">取消</el-button>
        <el-button type="primary" @click="uploadMaterial" :loading="materialData.uploading">上传</el-button>
      </template>
    </el-dialog>
    <!-- 查看json内容 -->
    <JsonView :title="jsonViewData.title" v-model:visible="jsonViewData.visible" :data="jsonViewData.data"> </JsonView>
  </div>
</template>
<script>
import { Search, Refresh, ArrowRight, FolderAdd } from "@element-plus/icons-vue";
import { nextTick, onMounted, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { svg } from "@/js/loading_data.js";
import axios from "axios";
import JsonView from "@/jsonView/JsonView.vue";

const nioPowerSwapURL = window.api.nioPowerSwapURL;
// const nioPowerSwapURL = 'http://nmap-power-swap-station.tencent-dev.nioint.com'

export default {
  name: "ParkingLotFile",
  data() {
    return {
      businessTypeOptions: [
        {
          "desc": "停车场",
          "name": "PN"
        }, {
          "desc": "换电站",
          "name": "PSP"
        }, {
          "desc": "匝道",
          "name": "RAMP"
        }, {
          "desc": "快修",
          "name": "KX"
        }
      ],
    }
  },
  components: { JsonView },
  setup() {
    // 0. 搜索  数据/逻辑
    const parking_lot_search = reactive({
      businessType: 'PN',
      parkingLotId: '',
      parkingLotNameCn: '',
      parkingLotNameEn: '',
      deviceId: ''
    })
    function search() {
      table.currentPage = 1;
      loadingPage();
    }
    function resetForm() {
      Object.assign(parking_lot_search, {
        businessType: 'PN',
        parkingLotId: '',
        parkingLotNameCn: '',
        parkingLotNameEn: '',
        deviceId: ''
      });
    }

    // 1. 表格  数据/逻辑
    const loading = ref(false)
    const table = reactive({
      tableData: [],
      tableHeight: 0,
      currentPage: 1,
      pageSize: 20,
      total: 0,
    });
    function loadingPage() {
      loading.value = true
      axios({
        url: nioPowerSwapURL + '/nio/material/list',
        method: 'post',
        data: {
          "businessType": parking_lot_search.businessType,
          "businessId": parking_lot_search.parkingLotId,        // 停车场id
          "businessNameEn": parking_lot_search.parkingLotNameEn,    // 停车场英文名
          "businessNameCn": parking_lot_search.parkingLotNameCn,    // 停车场中文名
          "deviceId": parking_lot_search.deviceId,
          "pageNum": table.currentPage - 1,                   // 页码
          "pageSize": table.pageSize                           // 页大小
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then((res) => {
        if (res.data.code === 0) {
          table.total = res.data.totalCount;
          table.tableData = res.data.data;
        } else {
          table.tableData = []
        }
        // console.log(res.data);
      }).catch((err) => {
        ElMessage.error({
          message: err,
          showClose: true,
        });
      }).finally(() => {
        loading.value = false;
      })
    }
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
    function getMaterialStatus(status, isTag) {
      switch (status) {
        case 'NO_PUT_DB':
          return isTag ? 'info' : '待入库';
        case 'IS_PUT_DB':
          return isTag ? 'warning' : '已入库';
        case 'PUT_DB_FAILED':
          return isTag ? 'danger' : '入库失败';
        case 'CHECKING':
          return isTag ? 'info' : '验收中';
        case 'CHECKED_SUCCESS':
          return isTag ? 'success' : '验收通过';
        case 'CHECKED_FAILED':
          return isTag ? 'danger' : '验收失败';
        case 'MAKING_SUCCESS':
          return isTag ? 'warning' : '推送生产成功';
        case 'MAKING_FAILED':
          return isTag ? 'danger' : '推送生产失败';
        default:
          return isTag ? 'danger' : '未知状态';
      }
    };
    // 2. 查看json内容 数据/逻辑
    const jsonViewData = reactive({
      visible: false,
      title: '',
      data: '{}',
    });
    function showJsonViewer(title, json) {
      jsonViewData.title = title;
      jsonViewData.data = json;
      jsonViewData.visible = true;
    };

    //  3. 分页  逻辑
    function handleSizeChange(pageSize) {
      table.pageSize = pageSize;
      loadingPage();
    }
    function handleCurrentChange(page) {
      table.currentPage = page;
      loadingPage();
    }
    //  4. 上传原始资料 数据/逻辑
    const materialData = reactive({
      loading: false,
      options: [],
      dialogShow: false,
      uploading: false,
      rules: {
        // parkingLotId: [
        // {required: true, message: '停车场名称必选', trigger: 'blur'},
        // ],
        s3Bucket: [
          { required: true, message: '轨迹ID必填', trigger: 'blur' },
        ],
        s3Key: [
          { required: true, message: '点云名称必填', trigger: 'blur' },
        ]
      },
      form: {
        businessType: 'PN',
        businessId: '',
        s3Bucket: '',
        s3Key: '',
        mesh: '',
        businessNameEn: '',
      }
    });
    const materialRef = ref(null); //用于类似于vue2一样引用dom
    function openUploadDialog() {
      materialData.dialogShow = true;
    }
    function chageSearchBusinessType(selection) {
      parking_lot_search.businessType = selection;
      loadingPage();
    }
    function uploadMaterial() {
      materialRef.value.validate((valid, filed) => {
        let url = "/nio/material/submit";
        if (materialData.form.businessType == 'RAMP') {
          url = "/nio/material/batch/submit"
        }
        // 验证成功
        if (valid) {
          materialData.uploading = true;
          axios.post(nioPowerSwapURL + url, {
            businessType: materialData.form.businessType,
            businessId: materialData.form.businessId,
            s3Bucket: materialData.form.s3Bucket,
            s3Key: materialData.form.s3Key,
            businessInfo: JSON.stringify({ "pointCloudVersion": materialData.form.pointCloudVersion }),
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
      })
    }
    function closeMaterialDialog() {
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
    // 动态名称列表 - 远程查询
    function remoteQuery(query) {
      if (materialData.form.businessType == null || materialData.form.businessType == '') {
        ElMessage.warning({
          message: '请选择业务类型',
          showClose: false,
          grouping: true,
        });
        materialData.options = [];
        return;
      }
      materialData.loading = true;
      axios.get(nioPowerSwapURL + `/nio/business/getMeshByBusinessName?businessType=${materialData.form.businessType}&businessName=${query ? query : 'null'}`)
        .then(res => {
          // console.log(res.data.data)
          if (res.data.code === 0) {
            materialData.options = res.data.data ?? [];
            console.log(materialData.options)
          } else {
            throw new Error();
          }
        }).catch(err => {
          ElMessage.error({
            message: '远程查询业务场景失败',
            showClose: false,
            grouping: true,
          });
        }).finally(() => {
          materialData.loading = false;
        });
    };

    function exportDetail() {
      axios({
        url: nioPowerSwapURL + '/nio/material/list',
        method: 'post',
        data: {
          "businessType": parking_lot_search.businessType,
          "businessId": parking_lot_search.parkingLotId,        // 停车场id
          "businessNameEn": parking_lot_search.parkingLotNameEn,    // 停车场英文名
          "businessNameCn": parking_lot_search.parkingLotNameCn,    // 停车场中文名
          "deviceId": parking_lot_search.deviceId,
          "pageNum": table.currentPage - 1,                   // 页码
          "pageSize": table.pageSize                           // 页大小
        },
        headers: {
          'content-type': 'application/json'
        }
      })
        .then((res) => {
          if (res.data.code === 0) {
            if (res.data.totalCount == 0) {
              ElMessage.error({
                message: '暂无下载内容',
                showClose: true,
                grouping: true,
              });
              return;
            }
            console.log(res.data.data)
            const data = jsonToCsv(res.data.data);
            downloadFile('下载.csv', data);
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

    };

    //下载文件
    function downloadFile(fileName, data) {
      // 保存 string 到 文本文件
      //创建一个a链接，用于触发下载事件的载体
      let aLink = document.createElement('a');
      //将实参字符串转二进制对象，如果不是文本可以通过添加第二个参数指定编码
      let blob = new Blob([data]);
      //指定要下载的文件名(浏览器下载时，会根据文件后缀名指定解码)
      aLink.download = fileName;
      //给a链接配置href指向刚才的二进制对象
      aLink.href = URL.createObjectURL(blob);
      //触发事件
      aLink.click();
    };

    function jsonToCsv(jsonData) {
      const csvRows = [];
      const headers = Object.keys(jsonData[0]);
      csvRows.push(headers.join(','));

      for (const row of jsonData) {
        const values = headers.map((header, index) => {
          if (typeof row[header] === 'object') {
            let rowValue = JSON.stringify(row[header]).replace(/,/g, '，').replace(/\n/g, "");
            return `"${rowValue}"`;
          } else if (Array.isArray(row[header])) {
            // 如果该字段是数组，我们将其转换为CSV格式的字符串
            let Value = row[header].map((value) => {
              return JSON.stringify(value).replace(/,/g, '，').replace(/\n/g, "");
            });
            return `"${Value}"`;
          } else {
            // 对于非数组字段，我们只需将值转换为字符串
            return `${('' + row[header]).replace(/,/g, '，').replace(/\n/g, "")}`;

          }
        });
        csvRows.push(values.join(','));
      }

      return csvRows.join('\n');
    };
    // 监听id =》 更新表单后半部分
    watch(() => materialData.form.businessId, (newVal, oldVal) => {
      if (newVal) {
        for (let i = materialData.options.length - 1; i >= 0; i--) {
          if (materialData.options[i].businessId === newVal) {
            materialData.form.businessNameEn = materialData.options[i].businessNameEn;
            materialData.form.mesh = materialData.options[i].mesh;
          }
        }
      } else {
        materialData.form.businessNameEn = '';
        materialData.form.mesh = '';
      }
    })
    // 5. 生命周期函数
    const adaptiveTableHeight = () => {
      table.tableHeight = document.getElementById('TableContainer') === null ? 0 : document.getElementById('TableContainer').offsetHeight;
    };
    onMounted(() => {
      loadingPage();
      nextTick(() => {
        adaptiveTableHeight();
      });
      window.addEventListener('resize', adaptiveTableHeight, false);
    });

    return {
      // 图标
      Search, Refresh, ArrowRight, FolderAdd,
      // 搜索 数据/逻辑函数
      parking_lot_search, search, resetForm,
      // 表格 数据/逻辑
      svg, loading, table, getMaterialStatus, getMaterialVersionStatus,
      // 查看json
      jsonViewData, showJsonViewer,
      // 分页 逻辑
      handleSizeChange, handleCurrentChange, chageSearchBusinessType,
      // 上传资料 数据/逻辑
      materialData, openUploadDialog, uploadMaterial,
      closeMaterialDialog, remoteQuery, materialRef,
      //下载列表
      exportDetail, downloadFile, jsonToCsv
    }
  }
}
</script>
<style scoped>
/* 工具栏样式 */
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

:deep(.link-column) {
  width: 400px !important;
  min-width: 400px !important;
  transition: width 0.3s;
}

:deep(.link-column:hover) {
  width: 300px;
}

.el-divider__text,
.el-link {
  font-weight: normal;
}
</style>
