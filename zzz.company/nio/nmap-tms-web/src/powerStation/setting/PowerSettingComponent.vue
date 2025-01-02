<template>
  <div id="PowerSettingComponent" class="component">
    <!-- 面包屑：展示产品的产品详情 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">换电站管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem" @click="powerSettingShow('pspList')"
          :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1}">换电站清单
        </div>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="breadcrumbPowerShow==='pspDetail'">
        <div class="breadcrumbItem" @click="powerSettingDetail('pspDetail')"
          :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 2}">换电站详情
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏 -->
    <div v-if="breadcrumbPowerShow==='pspList'" class="psTool">
      <el-form inline :data="station_search" label-position="right" ref="form" id="formDiv" @submit.prevent="search">
        <el-form-item label="ID：">
          <el-input v-model.trim="station_search.id" placeholder="请输入id" style="width: 160px;" clearable></el-input>
        </el-form-item>
        <el-form-item label="换电站中文名：">
          <el-input v-model.trim="station_search.chineseName" placeholder="请输入中文名" style="width: 160px;"
                    clearable></el-input>
        </el-form-item>
        <el-form-item label="换电站英文名：">
          <el-input v-model.trim="station_search.englishName" placeholder="请输入英文名" style="width: 160px"
                    clearable></el-input>
        </el-form-item>
        <el-form-item label="图幅号：">
          <el-input v-model.trim="station_search.mapId" placeholder="请输入图幅号" style="width: 140px"
                    clearable></el-input>
        </el-form-item>
        <el-form-item label="发布版本号：">
          <el-input v-model.trim="station_search.releaseVersion" placeholder="请输入发布版本号" style="width: 140px"
                    clearable></el-input>
        </el-form-item>
        <el-form-item label="发布情况：">
          <el-select
            v-model="station_search.releaseStatus1"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请输入发布情况"
            clearable
            style="width: 160px"
            >
            <el-option
            v-for="target in stationStatus"
            :label="target"
            :key="target"
            :value="target"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="环境：">
          <el-select
              v-model="station_search.releaseEnv"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请输入环境"
              clearable
              style="width: 160px"
          >
            <el-option
                v-for="target in envs"
                :label="target"
                :key="target"
                :value="target"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <div style="height: 36px;">
          <el-button :icon="Search" type="primary" native-type="submit">查询</el-button>
          <el-button :icon="Refresh" @click="resetForm">重置</el-button>
          <el-button type="warning" :icon="FolderOpened" @click="modifyStation">修改</el-button>
          <el-button type="success" :icon="FolderAdd" @click="createStation">新增换电站</el-button>
          <el-button type="success" :icon="FolderAdd" @click="pssRelease">换电站发版</el-button>
        </div>
      </el-form>
    </div>
    <!-- 主表格 -->
    <div v-if="breadcrumbPowerShow==='pspList'" class="table">
      <!-- 表格 -->
      <div id="StationTableContainer" class="table-container"
           v-loading="loading"
           element-loading-text="拼命加载中..."
           :element-loading-spinner="svg"
           element-loading-svg-view-box="-10, -10, 50, 50"
      >
        <el-table
            :data="tableData"
            border
            :max-height="tableHeight"
            @selection-change="handleSelectionChange"
        >
          <el-table-column fixed="left" align="center" type="selection" width="55"></el-table-column>
          <el-table-column fixed="left" align="center" prop="id" label="换电站ID" key="id"
                           min-width="80"></el-table-column>
          <el-table-column fixed="left" align="center" prop="chineseName" label="换电站中文名" key="chineseName"
                           width="340">
            <template #default="scope">
              <el-button @click="powerSettingDetail(scope.row)" link type="primary">
                {{ scope.row.chineseName }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column show-overflow-tooltip align="center" prop="englishName" label="换电站英文名"
                           key="englishName" min-width="140"></el-table-column>
          <el-table-column align="center" prop="deviceId" label="换电站deviceId" key="deviceId"
                           min-width="240"></el-table-column>
          <el-table-column align="center" prop="releaseStatus1" label="发布情况" key="releaseStatus1"
                           min-width="120"></el-table-column>
          <el-table-column align="center" prop="releaseVersion" label="最新版本号" key="releaseVersion"
                           min-width="200"></el-table-column>
          <el-table-column align="center" prop="county" label="所在区县" key="county" width="160"></el-table-column>
          <el-table-column align="center" prop="compartment" label="行政区划" key="compartment"
                           min-width="120"></el-table-column>
          <el-table-column align="center" prop="mapId" label="图幅号" key="mapId" width="180"></el-table-column>
          <el-table-column align="center" prop="createTime" label="创建时间" key="createTime"
                           min-width="180"></el-table-column>
          <el-table-column align="center" prop="updateTime" label="更新时间" key="updateTime"
                           min-width="180"></el-table-column>
          <el-table-column align="center" prop="releaseStatus" label="发布状态" key="releaseStatus" min-width="120">
            <template #default="{row}">
              <el-tag :type="getReleaseStatus(row.releaseStatus, true)">{{ getReleaseStatus(row.releaseStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="releaseEnv" label="环境" key="releaseEnv"
                           min-width="90"></el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <div style="padding-top: 10px" class="tPaginationContainer">
        <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="[10000]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
      </div>
    </div>
    <!-- 编辑分支 -->
    <PowerEditionDetailPerPs
      v-if="breadcrumbPowerShow==='pspDetail'"
      :pssId="pssId"
    ></PowerEditionDetailPerPs>
    <!-- 创建任务对话框 -->
    <el-dialog
        :title="title + '换电站'"
        v-model="dialogVisible"
        show-close
        @close="closeCreate"
        width="600px"
    >
      <el-form
          ref="psForm"
          :model="stationForm"
          :rules="rules"
          label-position="right"
          label-width="160px"
          style="margin: 0 30px 0 10px"
      >
        <el-form-item v-if="dialogType === 'modify'" label="换电站ID：" prop="Id">
          <el-input v-model.trim="stationForm.id" placeholder="请输入换电站Id" style="width: 90%" disabled></el-input>
        </el-form-item>
        <el-form-item label="换电站中文名：" prop="chineseName">
          <el-input v-model.trim="stationForm.chineseName" placeholder="请输入换电站中文名"
                    style="width: 90%;"></el-input>
        </el-form-item>
        <el-form-item label="换电站英文名：" prop="englishName">
          <el-input v-model.trim="stationForm.englishName" placeholder="请输入换电站英文名"
                    style="width: 90%"></el-input>
        </el-form-item>
        <el-form-item label="换电站deviceId：" prop="deviceId">
          <el-input v-model.trim="stationForm.deviceId" placeholder="请输入换电站deviceId"
                    style="width: 90%;"></el-input>
        </el-form-item>
        <el-form-item label="所在区县：" prop="county">
          <el-input v-model.trim="stationForm.county" placeholder="请输入换电站所在区县" style="width: 90%;"></el-input>
        </el-form-item>
        <el-form-item label="行政区划：" prop="compartment">
          <el-input v-model.trim="stationForm.compartment" placeholder="请输入换电站行政区划"
                    style="width: 90%;"></el-input>
        </el-form-item>
        <el-form-item label="图幅号：" prop="mapId">
          <el-input v-model.trim="stationForm.mapId" placeholder="请输入换电站图幅号" style="width: 90%;"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeCreate">取消</el-button>
        <el-button v-if="dialogType === 'create'" type="primary" @click="createFun">创建</el-button>
        <el-button v-else type="primary" @click="modifyFun">保存</el-button>
      </template>
    </el-dialog>
    <!-- 创建任务对话框 -->
    <el-dialog
        title="换电站发版"
        v-model="selectPssDialogVisible"
        show-close
        @close="closeSelectPss"
        width="1300px"
    >
      <el-form
          ref="pssReleaseForm"
          :inline="true"
          :model="pssReleaseForm"
          :rules="pssReleaseRules"
          label-position="right"
          label-width="130px"
      >
        <el-form-item label="产品名称：" prop="productIdentity">
          <el-input v-model.trim="pssReleaseForm.productIdentity" placeholder="请输入产品名称"
                    style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="分支名称：" prop="branch">
          <el-input v-model.trim="pssReleaseForm.branch" placeholder="请输入换分支名称"
                    style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="底图依赖：" prop="referenceProduct">
          <el-input v-model.trim="pssReleaseForm.referenceProduct" placeholder="请输入底图依赖"
                    style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="是否编译：" prop="isCompile">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="pssReleaseForm.isCompile"
                     placeholder="是否编译"></el-switch>
        </el-form-item>
        <el-form-item label="版本说明：" prop="descName">
          <el-input v-model.trim="pssReleaseForm.descName" placeholder="请输入版本说明"
                    style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="作者：" prop="owner">
          <el-input v-model.trim="pssReleaseForm.owner" placeholder="请输入作者名称"
                    style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="点云规格：" prop="compileMeta">
          <el-input v-model.trim="pssReleaseForm.compileMeta" placeholder="请输入点云规格"
                    style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="换电站：" prop="pssIdList">
          <div class="select_pss">
            <el-transfer
                filterable
                :filter-method="filterMethod"
                filter-placeholder="请输入换电站名称"
                :titles="['备选换电站', '已选换电站']"
                v-model="pssReleaseForm.pssIdList"
                :data="pssList">
            </el-transfer>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeSelectPss">取消</el-button>
        <el-button type="primary" @click="releaseFun">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {Search, Refresh, FolderOpened, FolderAdd, ArrowRight} from "@element-plus/icons-vue";
import axios from "axios";
import {ElMessage} from "element-plus";
import {svg} from "@/js/loading_data.js";
import PowerEditionDetailPerPs from "../release/PowerEditionDetailPerPS.vue";
import store from "../../store/index.js";

const nioReleaseURL = window.api.nioReleaseURL;
const nioPowerSwapURL = window.api.nioPowerSwapURL;
export default {
  name: "PowerSettingComponent",

  components: {
    PowerEditionDetailPerPs
  },

  data() {
    return {
      breadcrumbPowerShow: 'pspList',
      pssId: '10',
      envs : ['stg', 'prod'],
      stationStatus : ['SUCCESS', 'IN_PROGRESS', 'CHECK_FAILED', 'COMPILE_FAILED'],
      loading: false,
      //搜索内容
      station_search: {
        id: '',
        chineseName: '',
        englishName: '',
        mapId: '',
        releaseVersion: '',
        releaseStatus1: [],
        releaseEnv: []
      },
      //新增or修改换电站表单
      title: '',
      stationForm: {
        id: '',
        chineseName: '',
        englishName: '',
        deviceId: '',
        county: '',
        compartment: '',
        mapId: '',
      },
      rules: {
        chineseName: [
          {required: true, message: '换电站中文名必填', trigger: 'change'},
        ],
        englishName: [
          {required: true, message: '换电站英文名必填', trigger: 'change'},
        ],
        deviceId: [
          {required: true, message: 'deviceId必填', trigger: 'change'},
        ],
        mapId: [
          {required: true, message: '图幅号必填', trigger: 'change'},
        ],
      },
      dialogType: 'create', //当前对话框是创建还是修改，取值create | modify
      dialogVisible: false,
      selectPssDialogVisible: false,
      tableData: [],
      multipleSelection: [], //当前表格选中行
      tableHeight: 0,
      currentPage: 1,
      pageSize: 10000,
      total: 0,
      svg: svg,
      pssReleaseForm: {
        productIdentity: '',
        branch: '',
        referenceProduct: '',
        isCompile: false,
        descName: '',
        owner: '',
        compileMeta: '',
        pssIdList: []
      },
      pssReleaseRules: {
        productIdentity: [
          {required: true, message: '产品名称必填', trigger: 'change'},
        ],
        branch: [
          {required: true, message: '分支名称必填', trigger: 'change'},
        ],
        referenceProduct: [
          {required: true, message: '底图依赖必填', trigger: 'change'},
        ],
        isCompile: [
          {required: true, message: '是否编译必填', trigger: 'change'},
        ],
        descName: [
          {required: true, message: '版本说明必填', trigger: 'change'},
        ],
        owner: [
          {required: true, message: '作者名称必填', trigger: 'change'},
        ],
        compileMeta: [
          {required: true, message: '点云规格必填', trigger: 'change'},
        ],
        pssIdList: [
          {type: 'array', required: true, message: '至少选择一个换电站', trigger: 'change'},
        ],
      },
      pssList: []
    }
  },
  setup() {
    return {
      Search, Refresh, FolderOpened, FolderAdd, ArrowRight
    }
  },
  methods: {

    // 面包屑显示节点
    powerSettingShow(val) {
      this.breadcrumbPowerShow = val;
      if (val === 'pspList') {
        store.commit('breadChange', 1);
      } else if (val === 'pspDetail') {
        store.commit('breadChange', 2);
      }
    }, 

    powerSettingDetail(row) {
      this.pssId = row.id + '';
      store.commit('breadChange', 2);
      this.breadcrumbPowerShow = 'pspDetail';
    },

    getReleaseStatus(status, isTag) {
      switch (status) {
        case 'NOT_RELEASED':
          return isTag ? 'warning' : '不可发布';
        case 'RELEASED':
          return isTag ? 'success' : '可发布';
        default:
          return isTag ? 'danger' : '未知状态';
      }
    },
    //选择项发生变化时触发
    handleSelectionChange(selection) {
      this.multipleSelection = selection;
    },
    //带条件查询搜索
    search() {
      this.currentPage = 1;
      this.loadingPage();
    },
    //重置条件查询表单
    resetForm() {
      this.station_search = {
        id: '',
        chineseName: '',
        englishName: '',
        mapId: '',
        releaseEnv: '',
      };
    },
    //修改换电站信息按钮
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
      Object.assign(this.stationForm, this.multipleSelection[0]);
      this.dialogType = 'modify';
      this.dialogVisible = true;
      this.title = '修改'
    },
    //新增换电站按钮
    createStation() {
      this.title = '新增'
      this.dialogType = 'create';
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.psForm.clearValidate();
      });
    },
    filterMethod(query, item) {
      return item.keyword.indexOf(query) > -1;
    },
    //选择换电站按钮
    pssRelease() {
      this.selectPssDialogVisible = true;
      this.$nextTick(() => {
        this.$refs.pssReleaseForm.clearValidate();
      });
      this.pssList = [];
      axios({
        url: nioPowerSwapURL + '/nio/power-swap-station/list',
        method: 'post',
        data: {
          pageNum: 1,
          pageSize: 1000000,
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        if (res.data.code === 0) {
          res.data.data.forEach((pss, index) => {
            this.pssList.push({
              label: pss.powerSwapStationNameCn,
              key: pss.powerSwapStationId,
              keyword: pss.powerSwapStationNameCn + "|" + pss.powerSwapStationNameEn,
              disabled: pss.releaseStatus !== 'RELEASED'
            });
          });
          console.log(this.pssList)
        } else {
          this.pssList = [];
        }
      }).catch((err) => {
        ElMessage.error({
          message: err,
          showClose: true,
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
    //加载表格内容
    loadingPage() {
      this.loading = true;
      axios({
        url: nioPowerSwapURL + '/nio/power-swap-station/list',
        method: 'post',
        data: {
          powerSwapStationId: this.station_search.id,
          powerSwapStationNameCn: this.station_search.chineseName,
          powerSwapStationNameEn: this.station_search.englishName,
          meshs: this.station_search.mapId,
          pageNum: this.currentPage,
          pageSize: this.pageSize,
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        if (res.data.code === 0) {
          this.total = res.data.totalCount;

          let ids = [];
          for(let i = 0; i < res.data.data.length; i ++){
            ids.push(res.data.data[i].powerSwapStationId + '');
          }

          //查询条件
          let releaseVersions = [];
          let stationStatus = [];
          let releaseEnv = [];

          //如果设置了第二个url的查询条件，则根据第二个结果进行过滤
          let need_filter_result = false;

          if(this.station_search.releaseVersion !== ''){
            need_filter_result = true;
            releaseVersions.push(this.station_search.releaseVersion);
          }

          if(this.station_search.releaseStatus1 && this.station_search.releaseStatus1.length !== 0){
            need_filter_result = true;
            stationStatus = this.station_search.releaseStatus1;
          }

          if(this.station_search.releaseEnv && this.station_search.releaseEnv.length !== 0){
            need_filter_result = true;
            releaseEnv = this.station_search.releaseEnv;
          }
          
          //去发版服务查询发版状态
          axios({
                url: nioReleaseURL + '/stations/query',
                method: 'post',
                data: {
                  ids: ids,
                  releaseVersions: releaseVersions, 
                  stationStatus: stationStatus, 
                  releaseEnv: releaseEnv,
                },
                headers: {
                  'content-type': 'application/json'
                }
            }).then(response2 => {

              if(response2.data.code === 200){
                let itemInfo = new Map();
                for(let i = 0; i < response2.data.data.stationList.length; i ++){
                  let info = response2.data.data.stationList[i];
                  itemInfo.set(info.bizId, info);
                }

                if(need_filter_result === false){
                  this.tableData = res.data.data.map(item => {
                    return {
                      id: item.powerSwapStationId,
                      chineseName: item.powerSwapStationNameCn,
                      englishName: item.powerSwapStationNameEn,
                      deviceId: item.deviceId,
                      releaseVersion: itemInfo.has(item.powerSwapStationId + '') ? itemInfo.get(item.powerSwapStationId + '').releaseVersion : '',
                      releaseStatus1: itemInfo.has(item.powerSwapStationId + '') ? itemInfo.get(item.powerSwapStationId + '').releaseStatus : '',
                      county: item.address,
                      mapId: item.mesh,
                      compartment: item.areaCode,
                      createTime: item.createTime,
                      updateTime: item.updateTime,
                      releaseStatus: item.releaseStatus,
                      releaseEnv: itemInfo.has(item.powerSwapStationId + '') ? itemInfo.get(item.powerSwapStationId + '').releaseEnv : '',
                    }
                  });
                }
                else{
                  let itemInfo = new Map();
                  for(let i = 0; i < res.data.data.length; i ++){
                    itemInfo.set(res.data.data[i].powerSwapStationId + '', res.data.data[i]);
                  }

                  this.tableData = response2.data.data.stationList.map(item=> {

                      return {
                        id: item.bizId,
                        chineseName: itemInfo.has(item.bizId + '') ? itemInfo.get(item.bizId + '').powerSwapStationNameCn : '',
                        englishName: itemInfo.has(item.bizId + '') ? itemInfo.get(item.bizId + '').powerSwapStationNameEn : '',
                        deviceId: itemInfo.has(item.bizId + '') ? itemInfo.get(item.bizId + '').deviceId : '',
                        releaseVersion: item.releaseVersion,
                        releaseStatus1: item.releaseStatus,
                        county: itemInfo.has(item.bizId + '') ? itemInfo.get(item.bizId + '').address : '',
                        mapId: itemInfo.has(item.bizId + '') ? itemInfo.get(item.bizId + '').mesh : '',
                        compartment: itemInfo.has(item.bizId + '') ? itemInfo.get(item.bizId + '').areaCode : '',
                        createTime: itemInfo.has(item.bizId + '') ? itemInfo.get(item.bizId + '').createTime : '',
                        updateTime: itemInfo.has(item.bizId + '') ? itemInfo.get(item.bizId + '').updateTime : '',
                        releaseStatus: itemInfo.has(item.bizId + '') ? itemInfo.get(item.bizId + '').releaseStatus : '',
                        releaseEnv: item.releaseEnv,
                      }
                    }
                  );

                  this.total = response2.data.data.stationList.length;
                }
              }
              else{
                ElMessage.error({
                message: "no data",
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
            });

        } else {
          this.total = [];
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
    //关闭创建dialog
    closeCreate() {
      this.dialogVisible = false;
      this.$nextTick(() => {
        this.stationForm = {
          id: '',
          chineseName: '',
          englishName: '',
          deviceId: '',
          county: '',
          compartment: '',
          mapId: '',
        };
      });
    },
    //关闭创建dialog
    closeSelectPss() {
      this.selectPssDialogVisible = false;
      this.$nextTick(() => {
        this.pssReleaseForm = {
          productIdentity: '',
          branch: '',
          referenceProduct: '',
          isCompile: false,
          descName: '',
          owner: '',
          pssIdList: []
        };
      });
    },
    // 验证mesh的格式 - 在修改/新增 的提交之前
    verifyMesh(mesh){
      let reg = /^\d{9}$/
      return mesh.split(',').every((item) => reg.test(item))
    },
    //提交新增换电站表单
    createFun() {
      if(this.verifyMesh(this.stationForm.mapId) === false){
        ElMessage.error({
          message: '图幅号格式错误',
        });
        return
      }
      axios({
        url: nioPowerSwapURL + '/nio/power-swap-station/add',
        method: 'post',
        data: {
          powerSwapStationNameCn: this.stationForm.chineseName,
          powerSwapStationNameEn: this.stationForm.englishName,
          deviceId: this.stationForm.deviceId,
          address: this.stationForm.county,
          areaCode: this.stationForm.compartment,
          mesh: this.stationForm.mapId,
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        if (res.data.code === 0) {
          ElMessage.success({
            message: '新增换电站成功'
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
    releaseFun() {
      console.log(this.pssReleaseForm)
      this.$refs.pssReleaseForm.validate(valid => {
        if (valid) {
          let commitData = new FormData();
          commitData.append("productIdentity", this.pssReleaseForm.productIdentity);
          commitData.append("descName", this.pssReleaseForm.descName);
          commitData.append("branch", this.pssReleaseForm.branch);
          commitData.append("owner", this.pssReleaseForm.owner);
          commitData.append("referenceProduct", this.pssReleaseForm.referenceProduct);
          commitData.append("isCompile", this.pssReleaseForm.isCompile);
          commitData.append("pssIds", this.pssReleaseForm.pssIdList.join(","));
          commitData.append("compileMeta", this.pssReleaseForm.compileMeta);
          axios({
            url: nioReleaseURL + '/park-release-version/create',
            method: 'post',
            data: commitData,
          }).then(response => {
            if (response.data.code === 200) {
              ElMessage.success({
                message: '创建服务区发布记录成功',
                showClose: true,
              });
              this.selectPssDialogVisible = false;
            } else {
              ElMessage.error({
                message: response.data.msg,
                showClose: true,
              });
            }
          }).catch(() => {
            ElMessage.error({
              message: '创建服务区发布记录失败',
              showClose: true,
            });
          });
        }
      });
    },
    //提交修改换电站表单
    modifyFun() {
      if(this.verifyMesh(this.stationForm.mapId) === false){
        ElMessage.error({
          message: '图幅号格式错误',
        });
        return
      }
      axios({
        url: nioPowerSwapURL + '/nio/power-swap-station/update',
        method: 'post',
        data: {
          powerSwapStationId: this.stationForm.id,
          powerSwapStationNameCn: this.stationForm.chineseName,
          powerSwapStationNameEn: this.stationForm.englishName,
          deviceId: this.stationForm.deviceId,
          address: this.stationForm.county,
          areaCode: this.stationForm.compartment,
          mesh: this.stationForm.mapId,
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        if (res.data.code === 0) {
          ElMessage.success({
            message: '修改成功'
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
      this.tableHeight = document.getElementById('StationTableContainer') === null ? 0 : document.getElementById('StationTableContainer').offsetHeight;
    },
  },
  mounted() {
    this.loadingPage();
    this.$nextTick(() => {
      this.adaptiveTableHeight();
    });
    window.addEventListener('resize', this.adaptiveTableHeight, false);
  }
}
</script>

<style scoped>
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

.select_pss >>> .el-transfer-panel {
  width: 400px;
}
</style>
