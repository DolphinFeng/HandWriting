<!-- 停车场管理 -> 停车场详情页面 -->
<template>
  <div class="component">
    <!-- 面包屑 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">PN/PSP管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem active-breadcrumb-item">业务场景详情</div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏 -->
    <div class="psTool">
      <el-form inline :data="parking_lot_search" label-position="right" ref="form" id="formDiv" @submit.prevent="search">
        <el-form-item label="业务类型:" name="businessType">
          <el-select v-model.trim="parking_lot_search.businessType" @change="chageSearchBusinessType"
            placeholder="请选择业务类型（必填）" style="width: 200px">
            <el-option v-for="item in businessTypeOptions" :key="item.name" :label="item.desc" :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="ID：">
          <el-input v-model.trim="parking_lot_search.id" placeholder="请输入业务场景id" style="width: 160px"
            clearable></el-input>
        </el-form-item>
        <el-form-item v-if="parking_lot_search.businessType == 'RAMP'" label="rampId：">
          <el-input v-model.trim="parking_lot_search.rampId" placeholder="请输入rampId" style="width: 160px"
            clearable></el-input>
        </el-form-item>
        <el-form-item v-if="parking_lot_search.businessType == 'PN' || parking_lot_search.businessType == 'PSP'"
          label="mapId：">
          <el-input v-model.trim="parking_lot_search.mapId" placeholder="请输入mapId" style="width: 160px"
            clearable></el-input>
        </el-form-item>
        <el-form-item label="业务场景中文名：">
          <el-input v-model.trim="parking_lot_search.chineseName" placeholder="请输入中文名" style="width: 160px"
            clearable></el-input>
        </el-form-item>
        <el-form-item label="业务场景英文名：">
          <el-input v-model.trim="parking_lot_search.englishName" placeholder="请输入英文名" style="width: 160px"
            clearable></el-input>
        </el-form-item>
        <el-form-item label="图幅号：">
          <el-input v-model.trim="parking_lot_search.mesh" placeholder="请输入图幅号" style="width: 140px" clearable></el-input>
        </el-form-item>
        <div style="height: 36px">
          <el-button :icon="Search" type="primary" native-type="submit">查询</el-button>
          <el-button :icon="Refresh" @click="resetForm">重置</el-button>
          <el-button type="warning" :icon="FolderOpened" @click="modifyStation">修改</el-button>
          <el-button type="success" :icon="FolderAdd" @click="createStation">新增业务场景</el-button>
          <el-button type="success" @click="openDistribute" :disabled="multipleSelection.length !== 1">下发采集任务</el-button>
          <el-button type="success" @click="exportDetail">下载</el-button>
        </div>
      </el-form>
    </div>
    <!-- 主表格 -->
    <div class="table">
      <!-- 表格 -->
      <div id="StationTableContainer" class="table-container" v-loading="loading" element-loading-text="拼命加载中..."
        :element-loading-spinner="svg" element-loading-svg-view-box="-10, -10, 50, 50">
        <el-table :data="tableData" :border="true" :max-height="tableHeight" @selection-change="handleSelectionChange">
          <el-table-column fixed="left" align="center" type="selection" width="55"></el-table-column>
          <el-table-column fixed="left" align="center" prop="id" label="业务场景ID" key="id"
            min-width="100"></el-table-column>
          <el-table-column v-if="parking_lot_search.businessType == 'PN' || parking_lot_search.businessType == 'PSP'"
            fixed="left" align="center" prop="mapId" label="mapId" key="mapId" min-width="150">
          </el-table-column>
          <el-table-column v-if="parking_lot_search.businessType == 'RAMP'" fixed="left" align="center" prop="rampId"
            label="rampId" key="rampId" min-width="150">
          </el-table-column>
          <el-table-column fixed="left" align="center" prop="businessType" label="业务场景类型" key="businessType"
            min-width="120">
            <template #default="{ row }">
              <el-tag v-if="row.businessType == 'PN'">停车场</el-tag>
              <el-tag v-else-if="row.businessType == 'PSP'">换电站</el-tag>
              <el-tag v-else-if="row.businessType == 'RAMP'">匝道</el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="left" align="center" prop="chineseName" label="业务场景中文名" key="chineseName" width="280">
            <template #default="scope">
              <el-tag type="success">{{ scope.row.chineseName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column show-overflow-tooltip align="center" prop="englishName" label="业务场景英文名" key="englishName"
            min-width="140"></el-table-column>
          <el-table-column v-if="parking_lot_search.businessType == 'PN' || parking_lot_search.businessType == 'PSP'"
            align="center" prop="deviceId" label="业务场景deviceId" key="deviceId" min-width="200">
          </el-table-column>
          <el-table-column v-if="parking_lot_search.businessType == 'PN' || parking_lot_search.businessType == 'PSP'"
            align="center" prop="locationPoint" label="站心经纬度" key="county" width="200">
          </el-table-column>
          <el-table-column align="center" prop="collect_status" label="采集地理围栏" key="county" width="200">
            <template #default="{ row }">
              <el-tag :type="getCollectStatus(row.geofenceWkt, true)">{{ getCollectStatus(row.geofenceWkt) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="parking_lot_search.businessType == 'RAMP'" align="center" prop="serviceArea"
            label="是否属于服务区" key="county" width="200">
            <template #default="{ row }">
              <el-tag v-if="row.serviceArea === true">属于</el-tag>
              <el-tag v-else-if="row.serviceArea === false" type="warning">不属于</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="county" label="所在区县" key="county" width="160"></el-table-column>
          <el-table-column align="center" prop="compartment" label="行政区划" key="compartment"
            min-width="100"></el-table-column>
          <el-table-column align="center" prop="mesh" label="图幅号" key="mesh" width="180"></el-table-column>
          <el-table-column align="center" prop="releaseStatus" label="发布状态" key="releaseStatus" min-width="140">
            <template #default="{ row }">
              <el-tag v-if="row.releaseStatus == 'NOT_RELEASED'" type="warning">不可发布</el-tag>
              <el-tag v-else-if="row.releaseStatus == 'RELEASED'">可发布</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="createTime" label="创建时间" key="createTime"
            min-width="180"></el-table-column>
          <el-table-column align="center" prop="updateTime" label="更新时间" key="updateTime"
            min-width="180"></el-table-column>
          <el-table-column align="center" prop="geofenceWkt" label="地理围栏" key="geofenceWkt" v-if="false"
            min-width="180"></el-table-column>
          <el-table-column align="center" prop="lineStringWkt" label="匝道起终点" key="lineStringWkt" min-width="180"
            v-if="false"></el-table-column>
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
    <el-dialog :title="title + '业务场景'" v-model="dialogVisible" show-close @close="closeCreate"
      :width="isGeoFenceEditShow ? '1200px' : '600px'" :close-on-press-escape="!isGeoFenceEditShow">
      <el-row>
        <el-col :span="isGeoFenceEditShow ? 12 : 24">
          <el-form ref="psForm" :model="parkingLotForm" :rules="rules" label-position="right" label-width="160px"
            style="margin: 0 30px 0 10px">
            <el-form-item label="业务类型:" name="businessType">
              <el-select v-model.trim="parkingLotForm.businessType" @change="chageSearchBusinessType"
                placeholder="请选择业务类型（必填）" style="width: 90%" :disabled="dialogType === 'modify'">
                <el-option v-for="item in businessTypeOptions" :key="item.name" :label="item.desc" :value="item.name">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="dialogType === 'modify'" label="业务场景ID：" prop="Id">
              <el-input v-model.trim="parkingLotForm.id" placeholder="请输入业务场景Id" style="width: 90%" disabled></el-input>
            </el-form-item>
            <el-form-item label="mapId：" prop="mapId" v-show="formItemShow">
              <el-input v-model.trim="parkingLotForm.mapId" :placeholder="'请输入mapId'" style="width: 90%"></el-input>
            </el-form-item>
            <el-form-item label="业务场景中文名：" prop="chineseName">
              <el-input v-model.trim="parkingLotForm.chineseName" :placeholder="'请输入业务场景中文名'"
                style="width: 90%"></el-input>
            </el-form-item>
            <el-form-item label="业务场景英文名：" prop="englishName">
              <el-input v-model.trim="parkingLotForm.englishName" placeholder="请输入业务场景英文名" style="width: 90%"></el-input>
            </el-form-item>
            <el-form-item label="业务场景deviceId：" prop="deviceId"
              :rules="[{ required: isShow, message: 'deviceId必填', trigger: 'blur' }]" v-show="this.formItemShow">
              <el-input v-model.trim="parkingLotForm.deviceId" placeholder="请输入业务场景deviceId"
                style="width: 90%"></el-input>
            </el-form-item>
            <el-form-item label="站心经纬度：" prop="locationPoint" v-if="formItemShow">
              <el-input v-model.trim="parkingLotForm.locationPoint" placeholder="示例:(120.12,120.00)" style="width: 60%"
                @change="onChangeLocationPoint"></el-input>
              <el-button @click="checkLocationPoint" style="margin-left: 2%" type="success">校验经纬度</el-button>
            </el-form-item>

            <el-form-item label="是否属于服务区：" prop="serviceArea" v-show="!formItemShow">
              <el-select v-model="parkingLotForm.serviceArea" placeholder="请选择是否属于服务区" @change="updateServiceAreaOption">
                <el-option v-for="item in serviceAreaOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>

            <el-form-item label="所在区县：" prop="county">
              <el-input v-model.trim="parkingLotForm.county" placeholder="请输入业务场景所在区县" style="width: 90%"
                disabled></el-input>
            </el-form-item>
            <el-form-item label="行政区划：" prop="compartment">
              <el-input v-model.trim="parkingLotForm.compartment" placeholder="请输入业务场景行政区划" style="width: 90%"
                disabled></el-input>
            </el-form-item>
            <el-form-item label="图幅号：" prop="mesh">
              <el-input v-model.trim="parkingLotForm.mesh" placeholder="请输入业务场景图幅号" style="width: 90%"></el-input>
            </el-form-item>
            <el-form-item label="rampId：" prop="rampId" v-show="!formItemShow">
              <el-input v-model.trim="parkingLotForm.rampId" placeholder="请输入rampId" style="width: 90%"
                :disabled="dialogType === 'modify' ? true : false"></el-input>
            </el-form-item>

            <el-form-item label="地理围栏：" prop="geofenceWkt">
              <el-input :value="parkingLotForm.geofenceWkt" :disabled="isGeoFenceEditShow"
                placeholder="请明确站心后点击‘制作采集地理围栏’，在右侧绘制地理围栏" style="width: 90%" :autosize="{ minRows: 4, maxRows: 6 }"
                type="textarea"></el-input>
            </el-form-item>
            <el-form-item label="匝道起终点：" prop="lineStringWkt" v-show="!formItemShow">
              <el-input v-model.trim="parkingLotForm.lineStringWkt" :disabled="isGeoFenceEditShow"
                placeholder="示例:LINESTRING (116.9017080808390716 39.7826419398694355, 116.9015208333333362 39.7825669444444472, 116.9012044444444456 39.7824327777777782, 116.8996433333333300 39.7817944444444436, 116.8996433333333300 39.7817944444444436, 116.8995199999999954 39.7818105555555590)"
                style="width: 90%" :autosize="{ minRows: 4, maxRows: 10 }" type="textarea"></el-input>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="isGeoFenceEditShow ? 12 : 0">
          <div class="geofence-edit-wrap" v-if="isGeoFenceEditShow">
            <GeofenceEdit :editForAims="formItemShow ? ['polygon'] : ['polygon', 'pathline']"
              :locationPointString="curEditCenterPoint ? curEditCenterPoint : parkingLotForm.locationPoint"
              height="638px" :wtkStrPolygon="parkingLotForm.geofenceWkt" :wtkStrPathLine="parkingLotForm.lineStringWkt"
              :relaGeofences="nearGeofences" @wktPolygonChange="onChangeGeoFenceWKT"
              @wktPathLineChange="onChangeLineWKT" />
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <el-button :disabled="(formItemShow && !parkingLotForm.locationPoint) || isGeoFenceEditShow" type="success"
          @click="openGeofenceEdit">制作采集地理围栏</el-button>
        <el-button @click="closeCreate">取消</el-button>
        <el-button v-if="dialogType === 'create'" type="primary" @click="createFun">创建</el-button>
        <el-button v-else type="primary" @click="modifyFun">保存</el-button>
      </template>
    </el-dialog>
    <!-- 任务对话框 -->
    <el-dialog :title="'下发采集任务'" v-model="isDistributeShow" show-close @close="closeDistrDialog" width="600px">
      <el-form ref="distrForm" :model="distrData" :rules="rulesDistr" label-position="right" label-width="160px"
        style="margin: 0 30px 0 10px">
        <el-form-item label="业务场景中文名：" prop="taskName">
          <el-input v-model.trim="distrData.taskName" placeholder="" style="width: 90%" disabled></el-input>
        </el-form-item>
        <el-form-item label="采集任务类型:" prop="collectTaskType">
          <el-select v-model.trim="distrData.collectTaskType" @change="changeCollectType" placeholder=""
            style="width: 90%" :disabled="distrDialogType === 'modify'">
            <el-option v-for="item in collectOptions" :key="item.name" :label="item.desc" :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="地图版本号：" prop="mapVsn"
          :rules="[{ required: distrData.collectTaskType === 'UPDATE', message: '地图版本号必填', trigger: 'change' }]">
          <el-input v-model.trim="distrData.mapVsn" placeholder="" style="width: 90%"
            :disabled="distrDialogType === 'modify' || distrData.collectTaskType === 'NEW'"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeDistrDialog">取消</el-button>
        <el-button v-if="distrDialogType === 'create'" type="primary" @click="createDistribute">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Search, Refresh, FolderOpened, FolderAdd, ArrowRight } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { svg } from '@/js/loading_data.js';
import GeofenceEdit from '@/map/GeoFenceEdit/index.vue';
import { isValidLatLng, parseWKTToGeo } from '@/map/GeoFenceEdit/commons.ts';
import { emptyToNull, downloadFileByContent } from '@/utils';

const nioPowerSwapURL = window.api.nioPowerSwapURL;
// const nioPowerSwapURL = 'http://nmap-power-swap-station.tencent-dev.nioint.com'

export default {
  name: 'ParkingLotDetail',
  components: {
    GeofenceEdit
  },
  data() {
    return {
      loading: false,
      // 搜索内容
      parking_lot_search: {
        businessType: 'PN',
        id: '',
        chineseName: '',
        englishName: '',
        mesh: '',
        mapId: '',
        rampId: ''
      },
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
        }
      ],
      // 修改/创建 数据表单
      title: '',
      parkingLotForm: {
        businessType: 'PN',
        id: '',
        mapId: '',
        chineseName: '',
        englishName: '',
        deviceId: '',
        county: '',
        compartment: '',
        mesh: '',
        locationPoint: '',
        serviceArea: '', // 是否属于服务区
        rampId: '',
        geofenceWkt: '', //匝道地理围栏
        lineStringWkt: ''  //匝道起终点
      },
      isShow: false,
      formItemShow: true,
      isGeoFenceEditShow: false,
      editForAims: ["polygon"],
      curEditCenterPoint: null,
      // 表单的验证规则
      rules: {
        businessType: [
          { required: true, message: '业务类型必填', trigger: 'blur' },
        ],
        mapId: [
          { required: true, message: 'mapId必填', trigger: 'blur' },
        ],
        chineseName: [
          { required: true, message: '业务场景中文名必填', trigger: 'blur' },
        ],
        englishName: [
          { required: true, message: '业务场景英文名必填', trigger: 'blur' },
        ],
        locationPoint: [
          { required: true, message: '站心经纬度必填', trigger: 'blur' },
        ],
        rampId: [
          { required: true, message: 'rampId必填', trigger: 'blur' },
        ]
      },
      dialogType: 'create', //当前对话框是创建还是修改，取值create | modify
      dialogVisible: false,
      tableData: [],
      multipleSelection: [], //当前表格选中行
      tableHeight: 0,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      nearGeofences: [],
      svg: svg,
      serviceAreaOptions: [
        {
          value: true,
          label: '属于',
        },
        {
          value: false,
          label: '不属于',
        },
      ],

      //下发采集任务
      isDistributeShow: false,
      distrDialogType: 'create',
      collectOptions: [
        {
          desc: '众包拓场',
          name: 'NEW',
        },
        {
          desc: '众包更新',
          name: 'UPDATE',
        },
      ],
      distrData: {
        collectTaskId: 0,
        taskName: '',
        businessType: '',
        collectTaskType: 'ZB_TC',
        mapVsn: '',
        operator: '',
      },
      rulesDistr: {
        collectTaskType: [{ required: true, message: '采集任务类型必填', trigger: 'change' }],
      },
    };
  },
  methods: {
    // 导出结果明细
    exportDetail() {
      axios({
        url: nioPowerSwapURL + '/nio/business/list',
        method: 'post',
        data: {
          businessType: this.parking_lot_search.businessType,
          businessId: this.parking_lot_search.id,
          businessNameCn: this.parking_lot_search.chineseName,
          businessNameEn: this.parking_lot_search.englishName,
          rampId: this.parking_lot_search.rampId,
          meshs: this.parking_lot_search.mesh,
          pageNum: this.currentPage - 1,
          pageSize: this.pageSize,
          mapId: this.parking_lot_search.mapId,
        },
        headers: {
          'content-type': 'application/json',
        },
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

    jsonToCsv(jsonData) {
      const csvRows = [];
      const headers = Object.keys(jsonData[0]);
      csvRows.push(headers.join(','));

      for (const row of jsonData) {
        const values = headers.map((header, index) => {
          if (typeof row[header] === 'object') {
            let rowValue = JSON.stringify(row[header]).replace(/,/g, '，');
            return `"${rowValue}"`;
          } else if (Array.isArray(row[header])) {
            // 如果该字段是数组，我们将其转换为CSV格式的字符串
            let Value = row[header].map((value) => {
              return JSON.stringify(value).replace(/,/g, '，');
            });
            return `"${Value}"`;
          } else {
            let Value = (row[header] + "");
            if (/^\d+$/.test(Value) || /^(\d+[，|,])+\d+$/.test(Value)) {
              Value = Value.replace(/[,|，]/g, ';')
            } else {
              Value = Value.replace(/,/g, '，')
            }
            return `"${Value}"`;
          }
        });
        csvRows.push(values.join(','));
      }

      return csvRows.join('\n');
    },

    updateServiceAreaOption(event) {
      this.parkingLotForm.serviceArea = event;
    },

    //选择项发生变化时触发
    handleSelectionChange(selection) {
      this.multipleSelection = selection;
    },
    chageSearchBusinessType(selection) {
      this.parkingLotForm.businessType = selection;
      this.parking_lot_search.businessType = selection;
      this.loadingPage();
      if (selection === 'PN') {
        //停车场
        this.isShow = false
        this.formItemShow = true
      } else if (selection == 'RAMP') {
        //匝道
        this.isShow = true
        this.formItemShow = false
      } else {
        //换电站
        this.isShow = true
        this.formItemShow = true
      }
    },
    onChangeLocationPoint(value) {
      if (!isValidLatLng(value) || !this.isGeoFenceEditShow) {
        return;
      }
      this.loadNearGeofence(this.parkingLotForm.id, this.parkingLotForm.businessType, value);
    },
    checkLocationPoint() {
      if (this.parkingLotForm.locationPoint == null || this.parkingLotForm.locationPoint == '') {
        ElMessage.warning({
          message: '',
          showClose: true,
        });
      }
      axios({
        url: nioPowerSwapURL + `/nio/business/checkLocationPoint?locationPoint=${this.parkingLotForm.locationPoint}`,
        method: 'get'
      }).then(res => {
        if (res.data.code === 0) {
          this.total = res.data.totalCount;
          this.parkingLotForm.mesh = res.data.data.mesh;
          this.parkingLotForm.locationPoint = res.data.data.locationPoint;
          this.parkingLotForm.county = res.data.data.address;
          this.parkingLotForm.compartment = res.data.data.areaCode;
        } else {
          ElMessage.error({
            message: res.data.msg,
            showClose: true,
          });
        }
      }).catch((err) => {
        ElMessage.error({
          message: err,
          showClose: true,
        });
      }).finally(() => {
        this.loading = false;
      })
    },
    //带条件查询搜索
    search() {
      this.currentPage = 1;
      this.loadingPage();
    },
    //重置条件查询表单
    resetForm() {
      this.parking_lot_search = {
        id: '',
        businessType: this.parking_lot_search.businessType,
        chineseName: '',
        englishName: '',
        mesh: '',
      };
    },
    //修改按钮
    modifyStation() {
      if (this.multipleSelection.length > 1) {
        ElMessage.warning({
          message: '只能选择一行进行修改',
          showClose: true,
          grouping: true,
        });
        return;
      } else if (this.multipleSelection.length === 0) {
        ElMessage.warning({
          message: '请先选择一行进行修改',
          showClose: true,
        });
        return;
      }
      Object.assign(this.parkingLotForm, this.multipleSelection[0]);
      this.dialogType = 'modify';
      this.dialogVisible = true;
      this.title = '修改'
      if (this.parkingLotForm.businessType == 'PN') {
        this.isShow = false
        this.formItemShow = true
      } else if (this.parkingLotForm.businessType == 'RAMP') {
        //匝道
        this.isShow = true
        this.formItemShow = false
      } else {
        //换电站
        this.isShow = true
        this.formItemShow = true
      }
    },
    //新增按钮
    createStation() {
      this.title = '新增'
      this.dialogType = 'create';
      this.dialogVisible = true;
      this.parkingLotForm.businessType = this.parking_lot_search.businessType;
      this.nearGeofences = [];
      if (this.parkingLotForm.businessType == 'PN') {
        this.isShow = false
        this.formItemShow = true
      } else if (this.parkingLotForm.businessType == 'RAMP') {
        //匝道
        this.isShow = true
        this.formItemShow = false
      } else {
        //换电站
        this.isShow = true
        this.formItemShow = true
      }
      this.$nextTick(() => {
        this.$refs.psForm.clearValidate();
      });
    },
    onChangeGeoFenceWKT(wktString) {
      this.parkingLotForm.geofenceWkt = wktString;
    },
    onChangeLineWKT(wktString) {
      this.parkingLotForm.lineStringWkt = wktString;
    },
    getCollectStatus(wkt, isTag) {
      if (isTag) {
        return (wkt !== '' && wkt !== null) ? 'success' : 'info';
      }
      return (wkt !== '' && wkt !== null) ? '已入库' : '待入库';
    },
    //新增下发采集任务按钮
    openDistribute() {
      if (this.multipleSelection.length > 1) {
        ElMessage.warning({
          message: '只能选择一行进行修改',
          showClose: true,
          grouping: true,
        });
        return
      } else if (this.multipleSelection.length === 0) {
        ElMessage.error({
          message: '请先选择一行进行修改',
          showClose: true,
        });
        return
      }
      if (this.multipleSelection[0].geofenceWkt === null || this.multipleSelection[0].geofenceWkt === '') {//改为判断当前是否有任务正在进行中
        ElMessage.error({
          message: '采集地理围栏还未入库，无法下发采集任务',
          showClose: true,
        });
        return
      }
      this.distrData = {
        businessId: this.multipleSelection[0].id,
        businessType: this.multipleSelection[0].businessType,
        taskName: this.multipleSelection[0].chineseName,
        collectTaskType: 'NEW',
        mapVsn: '',
        operator: localStorage.getItem('realName')
      }
      this.isDistributeShow = true
    },
    //关闭下发采集任务对话框
    closeDistrDialog() {
      this.isDistributeShow = false
    },
    //采集类型改变
    changeCollectType(type) {
      if (type === 'NEW') {
        this.distrData.mapVsn = ''
      }
    },
    //提交下发采集任务
    createDistribute() {
      const form = this.$refs.distrForm;
      form.validate((isValid) => {
        if (!isValid) {
          return;
        }
        this.loading = true;
        axios({
          url: nioPowerSwapURL + `/nio/collection/task/create`,
          method: 'post',
          data: this.distrData,
        }).then(res => {
          if (res.data.code === 0) {
            this.isDistributeShow = false;
            ElMessage.success({
              message: "下发采集任务创建成功",
              showClose: true,
            });
            this.loadingPage();
          } else {
            ElMessage.error({
              message: res.data.msg,
              showClose: true,
            });
          }
        }).catch((err) => {
          ElMessage.error({
            message: err,
            showClose: true,
          });
        }).finally(() => {
          this.loading = false;
        })
      });
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
    loadingPage() {
      this.loading = true;
      axios({
        url: nioPowerSwapURL + '/nio/business/list',
        method: 'post',
        data: {
          businessType: this.parking_lot_search.businessType,
          businessId: this.parking_lot_search.id,
          businessNameCn: this.parking_lot_search.chineseName,
          businessNameEn: this.parking_lot_search.englishName,
          rampId: this.parking_lot_search.rampId,
          meshs: this.parking_lot_search.mesh,
          pageNum: this.currentPage - 1,
          pageSize: this.pageSize,
          mapId: this.parking_lot_search.mapId
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        if (res.data.code === 0) {
          this.total = res.data.totalCount;
          if (this.total == 0) {
            this.tableData = [];
            return;
          }
          this.tableData = res.data.data.map(item => {
            return {
              id: item.businessId,
              rampId: item.rampId,
              mapId: item.mapId,
              businessType: item.businessType,
              chineseName: item.businessNameCn,
              englishName: item.businessNameEn,
              deviceId: item.deviceId,
              locationPoint: item.locationPoint == null ? '' : item.locationPoint.value,
              county: item.address,
              mesh: item.mesh,
              serviceArea: item.serviceArea,
              compartment: item.areaCode,
              createTime: item.createTime,
              updateTime: item.updateTime,
              releaseStatus: item.releaseStatus,
              geofenceWkt: item.geofenceWkt,
              lineStringWkt: item.lineStringWkt
            }
          });
        } else {
          this.tableData = [];
        }
      }).catch((err) => {
        console.log(err)
        ElMessage.error({
          message: err,
          showClose: true,
        });
      }).finally(() => {
        this.loading = false;
      })
    },
    //关闭dialog 点击保存/创建 或者 取消后调用ß
    closeCreate() {
      this.closeGeofenceEdit();
      this.dialogVisible = false;
      this.$nextTick(() => {
        this.parkingLotForm = {
          businessType: '',
          id: '',
          mapId: '',
          chineseName: '',
          englishName: '',
          deviceId: '',
          county: '',
          compartment: '',
          mesh: '',
          geofenceWkt: '',
        };
        this.nearGeofences = [];
      });
    },
    loadNearGeofence(editBusinessId, businessType, locationPoint, distance = 3) {
      axios({
        url: nioPowerSwapURL + `/nio/business/nearbylist`,
        method: 'post',
        data: {
          businessType,
          locationPoint,
          distance
        }
      }).then(res => {
        if (res.data.code === 0) {
          const listGeofence = [];
          res.data.data ? res.data.data.map((item) => {
            if (!item.locationPoint && !item.geofence) {
              return;
            }
            if (editBusinessId > 0 && editBusinessId === item.businessId) {
              return;
            }
            listGeofence.push({
              id: item.businessId,
              name: item.businessNameCn,
              pointString: item.locationPoint,
              wktString: item.geofence
            });
          }) : [];
          this.nearGeofences = listGeofence;
        } else {
          ElMessage.error({
            message: res.data.msg,
            showClose: true,
          });
        }
      }).catch((err) => {
        ElMessage.error({
          message: err,
          showClose: true,
        });
      }).finally(() => {
      })
    },
    openGeofenceEdit() {
      if (!this.formItemShow) {
        if (!this.parkingLotForm.lineStringWkt) {
          ElMessage.error({
            message: "请先输入匝道起始点",
            showClose: true,
          });
          return;
        }
        const geo = parseWKTToGeo(this.parkingLotForm.lineStringWkt);
        if (geo.type !== 'LineString' || geo.coordinates.length === 0) {
          ElMessage.error({
            message: "请输入合法匝道起始点",
            showClose: true,
          });
          return;
        }
        const firstPos = geo.coordinates[0];
        this.curEditCenterPoint = "(" + firstPos[0] + "," + firstPos[1] + ")";
      } else if (!isValidLatLng(this.parkingLotForm.locationPoint)) {
        ElMessage.error({
          message: "站心经纬度内容无效",
          showClose: true,
        });
        return;
      }

      this.loadNearGeofence(
        this.parkingLotForm.id, 
        this.parkingLotForm.businessType, 
        this.curEditCenterPoint ? this.curEditCenterPoint : this.parkingLotForm.locationPoint
      );
      this.isGeoFenceEditShow = true;
    },
    closeGeofenceEdit() {
      this.isGeoFenceEditShow = false;
    },
    // 验证mesh的格式 - 在修改/新增 的提交之前
    verifyMesh(mesh) {
      let reg = /^\d{9}$/
      return mesh.split(',').every((item) => reg.test(item))
    },
    //提交新增表单
    createFun() {
      if (this.parkingLotForm.mesh != '' && this.verifyMesh(this.parkingLotForm.mesh) === false) {
        ElMessage.error({
          message: '图幅号格式错误',
        });
        return
      }
      axios({
        url: nioPowerSwapURL + '/nio/business/add',
        method: 'post',
        data: {
          businessType: this.parkingLotForm.businessType,
          mapId: this.parkingLotForm.mapId,
          businessNameCn: this.parkingLotForm.chineseName,
          businessNameEn: this.parkingLotForm.englishName,
          deviceId: this.parkingLotForm.deviceId,
          address: this.parkingLotForm.county, //所在区县
          areaCode: this.parkingLotForm.compartment, //行政区划
          locationPoint: this.parkingLotForm.locationPoint,
          mesh: this.parkingLotForm.mesh,
          rampId: this.parkingLotForm.rampId,
          geofenceWkt: emptyToNull(this.parkingLotForm.geofenceWkt), //匝道地理围栏
          lineStringWkt: emptyToNull(this.parkingLotForm.lineStringWkt), //匝道起终点
          serviceArea: this.parkingLotForm.serviceArea
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        if (res.data.code === 0) {
          ElMessage.success({
            message: '新增业务场景成功'
          });
          this.closeCreate();
          this.currentPage = 1;
          this.loadingPage();
        } else {
          ElMessage.error({
            message: res.data.msg,
          });
        }
      }).catch((err) => {
        ElMessage.error({
          message: err,
        });
      });
    },
    //提交修改表单
    modifyFun() {
      if (this.parkingLotForm.mesh != '' && this.verifyMesh(this.parkingLotForm.mesh) === false) {
        ElMessage.error({
          message: '图幅号格式错误',
        });
        return
      }
      axios({
        url: nioPowerSwapURL + '/nio/business/update',
        method: 'post',
        data: {
          businessType: this.parkingLotForm.businessType,
          businessId: this.parkingLotForm.id,
          mapId: this.parkingLotForm.mapId,
          businessNameCn: this.parkingLotForm.chineseName,
          businessNameEn: this.parkingLotForm.englishName,
          deviceId: this.parkingLotForm.deviceId,
          address: this.parkingLotForm.county, //所在区县
          areaCode: this.parkingLotForm.compartment, //行政区划
          locationPoint: this.parkingLotForm.locationPoint,
          mesh: this.parkingLotForm.mesh,
          rampId: this.parkingLotForm.rampId,
          geofenceWkt: emptyToNull(this.parkingLotForm.geofenceWkt), //匝道地理围栏
          lineStringWkt: emptyToNull(this.parkingLotForm.lineStringWkt),  //匝道起终点
          serviceArea: this.parkingLotForm.serviceArea
        }
      }).then(res => {
        if (res.data.code === 0) {
          ElMessage.success({
            message: '修改业务场景成功'
          });
          this.closeCreate();
          this.loadingPage();
        } else {
          ElMessage.error({
            message: res.data.msg,
          });
        }
      }).catch((err) => {
        ElMessage.error({
          message: err,
        });
      });
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
.table{
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
