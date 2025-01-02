<template>
  <div id="DriveTest" class="component">
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">事件制作</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item @click="backTaskPage">
        <div
          @click="changeBreadcrumb(1)"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }"
          class="breadcrumbItem"
        >
          聚合
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索框 -->
    <el-form :model="searchForm" label-position="right" inline class="search-form">
      <el-form-item prop="id">
        <el-input v-model="searchForm.id" placeholder="id" style="width: 200px" clearable/>
      </el-form-item>
      <el-form-item prop="taskName">
        <el-input v-model="searchForm.taskName" placeholder="任务名称" style="width: 200px" clearable/>
      </el-form-item>
      <el-form-item prop="mapLevel">
        <el-input v-model="searchForm.mapLevel" placeholder="地图版本" style="width: 200px" clearable/>
      </el-form-item>
      <el-form-item prop="taskType">
        <el-input v-model="searchForm.taskType" placeholder="任务类型" style="width: 200px" clearable/>
      </el-form-item>
      <el-form-item prop="brand">
        <el-input v-model="searchForm.brand" placeholder="品牌" style="width: 200px" clearable/>
      </el-form-item>
      <el-form-item prop="platformType">
        <el-input v-model="searchForm.platformType" placeholder="平台" style="width: 200px" clearable/>
      </el-form-item>
      <el-form-item prop="functionLevel">
        <el-input v-model="searchForm.functionLevel" placeholder="功能等级" style="width: 200px" clearable/>
      </el-form-item>
      <el-form-item prop="taskId">
        <el-input v-model="searchForm.taskId" placeholder="任务id" style="width: 200px" clearable/>
      </el-form-item>
      <el-form-item prop="user">
        <el-input v-model="searchForm.operator" placeholder="创建人" style="width: 200px" clearable/>
      </el-form-item>
      <el-form-item label="开始时间：" prop="createTimeValue">
        <el-date-picker v-model="searchForm.createTimeValue" type="datetimerange" style="width: 532px" format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss" range-separator="至"
                        start-placeholder="创建开始时间"
                        end-placeholder="创建结束时间">
        </el-date-picker>
      </el-form-item>
      <!-- 工具按钮 -->
      <el-form-item class="search-button">
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button type="primary" @click="resetForm">重置</el-button>
        <el-button type="primary" @click="openCreateDialog">新建聚合任务</el-button>
      </el-form-item>
    </el-form>
    <!-- 表格区 -->
    <div class="table">
      <!-- 表格 -->
      <div class="table-container" id="table-container">
        <el-table :data="tableData.list" border :max-height="tableData.maxHeight" v-loading="loading"
                  element-loading-text="加载中" :element-loading-spinner="svg" row-key="id"
                  element-loading-svg-view-box="-10, -10, 50, 50"
                  :cell-style="{ height: '60px', overflow: 'hidden' }">
          <el-table-column type="expand" fixed="left">
            <template #default="{ row }">
              <el-table :data="row.children" border :cell-style="{ height: '50px', overflow: 'hidden' }">
                <el-table-column prop="id" label="子任务ID" align="center" width="100"></el-table-column>
                <el-table-column prop="job_id" label="作业系统任务ID" align="center" width="150"></el-table-column>
                <el-table-column prop="task_type" label="数据类型" align="center" width="150"></el-table-column>
                <el-table-column label="输入数量" align="center" width="200">
                  <template #default="{ row }">
                    {{ formatInputCounts(row) }}
                  </template>
                </el-table-column>
                <el-table-column label="输出数量" align="center" width="200">
                  <template #default="{ row }">
                    {{ formatOutputCounts(row) }}
                  </template>
                </el-table-column>
                <el-table-column prop="job_status" label="任务状态" align="center" width="150"></el-table-column>
                <el-table-column prop="create_ts" label="开始时间" align="center" width="200"></el-table-column>
                <el-table-column prop="end_ts" label="结束时间" align="center" width="200"></el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column prop="id" key="id" label="id" align="center" width="100" fixed="left"></el-table-column>
          <el-table-column prop="taskName" key="taskName" label="任务名称" align="center" width="200" show-overflow-tooltip></el-table-column>
          <el-table-column prop="mapVersion" key="mapVersion" label="地图版本" align="center" width="150"></el-table-column>
          <el-table-column prop="taskType" key="taskType" label="任务类型" align="center" width="150"></el-table-column>
          <el-table-column prop="brand" key="brand" label="品牌" align="center" width="150"></el-table-column>
          <el-table-column prop="platform" key="platform" label="平台" align="center" width="150"></el-table-column>
          <el-table-column prop="functionLevel" key="functionLevel" label="功能等级" align="center" width="150"></el-table-column>
          <el-table-column prop="taskId" key="taskId" label="任务id" align="center" width="150"></el-table-column>
          <el-table-column prop="taskMemo" key="taskMemo" label="备注" align="center" width="200"></el-table-column>
          <el-table-column prop="operator" key="operator" label="创建人" align="center" width="200"></el-table-column>
          <el-table-column prop="status" key="status" label="任务状态" align="center" width="150"></el-table-column>
          <el-table-column prop="resInfo" key="resInfo" label="成果信息" align="center" width="250">
            <template #default="{ row }">
              <template v-if="row.resInfo">
                <router-link 
                  :to="{ 
                    name: 'GeneratePage', 
                    query: { ids: row.resInfo }
                  }"
                  class="res-info-link"
                >
                  {{ `${row.resInfo},${row.branchId}` }}
                </router-link>
              </template>
              <template v-else>
                -
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="priority" key="priority" label="优先级" align="center" width="150"></el-table-column>
          <el-table-column prop="mapVersion" key="mapVersion" label="地图版本" align="center" width="150"></el-table-column>
          <el-table-column prop="validMileage" key="validMileage" label="连续性判断" align="center" width="150"></el-table-column>
          <el-table-column prop="accessSource" key="accessSource" label="业务类型" align="center" width="150"></el-table-column>
          <el-table-column prop="createTime" key="createTime" label="开始时间" align="center" width="200"></el-table-column>
          <el-table-column prop="endTime" key="endTime" label="结束时间" align="center" width="200"></el-table-column>
          <el-table-column prop="cancelOperator" key="cancelOperator" label="取消人" align="center" width="200"></el-table-column>
          <el-table-column prop="cancelTime" key="cancelTime" label="取消时间" align="center" width="200"></el-table-column>
          <el-table-column label="操作" align="center" width="300" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleParam(row)">
                任务参数
              </el-button>
              <el-button type="primary" size="small" @click="handleCancel(row)">
                取消任务
              </el-button>
              <el-button type="primary" size="small" @click="handleCopy(row)">
                复制任务
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <div>
        <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                       :current-page="tableData.pageNo" :page-sizes="[10, 20, 50, 100]"
                       :page-size="tableData.pageSize"
                       layout="total, sizes, prev, pager, next, jumper" :total="tableData.total">
        </el-pagination>
      </div>
    </div>

    <!-- 新建聚合任务对话框 -->
    <el-dialog v-model="createVisible" width="40%" title="新建聚合任务" draggable @close="handleDialogClose">
      <el-form :label-width="150" label-position="right" class="left" ref="createForm">
        <el-form-item label="任务名称" prop="taskName" :rules="[{ required: true, message: '必填项', trigger: 'submit' }]">
          <el-input v-model.trim="createForm.taskName" style="width: 80%;"></el-input>
        </el-form-item>
        <el-form-item label="任务备注" prop="taskMemo">
          <el-input v-model.trim="createForm.taskMemo" style="width: 80%;"></el-input>
        </el-form-item>
        
        <div class="form-row">
          <el-form-item label="品牌：" prop="brand" :label-width="135" :rules="[{ required: true, message: '必填项', trigger: 'submit' }]">
            <el-select v-model="createForm.brand" placeholder="请选择" style="width: 100%;">
              <el-option v-for="item in brandOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="平台：" prop="platform" :label-width="70">
            <el-select v-model="createForm.platform" placeholder="请选择" style="width: 100%;">
              <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="功能等级：" prop="funcLevel" :label-width="90">
            <el-select v-model="createForm.funcLevel" placeholder="请选择" style="width: 100%;">
              <el-option v-for="item in funcLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-row">
          <el-form-item label="任务类型：" prop="taskType" :label-width="160" :rules="[{ required: true, message: '必填项', trigger: 'submit' }]">
            <el-select v-model="createForm.taskType" placeholder="请选择" style="width: 100%;" @change="handleTaskTypeChange">
              <el-option v-for="item in taskTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="优先级：" prop="prior" :label-width="70">
            <el-select v-model="createForm.priority" placeholder="请选择" style="width: 100%;">
              <el-option v-for="item in priorOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="创建方式：" prop="createMethodRadio" v-if="showExtra">
          <el-radio-group v-model="createMethodRadio" @change="handleMethodChange">  
            <el-radio :label="2">手动触发</el-radio>
            <el-radio :label="1">上传zip</el-radio>
          </el-radio-group>
        </el-form-item>
        <div class="form-row" v-if="showExtra && showHandCreate">
          <el-form-item label="地图版本：" prop="mapVersion" :label-width="150">
            <el-input v-model.trim="createForm.mapVersion" style="width: 100%;"></el-input>
          </el-form-item>
          <el-form-item label="连续性判断：" prop="validMileage" :label-width="150">
            <el-input v-model.trim="createForm.validMileage" style="width: 100%;"></el-input>
          </el-form-item>
        </div>
        <el-form-item label="业务类型：" prop="accessSource" v-if="showExtra && showHandCreate">
          <el-radio-group v-model="createForm.accessSource">  
            <el-radio :label="1">OA量产</el-radio>
            <el-radio :label="2">门店试驾测试</el-radio>
            <el-radio :label="3">门店试驾运营</el-radio>
            <el-radio :label="4">快修快发</el-radio>
            <el-radio :label="5">全量</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地区范围：" prop="area" v-if="showExtra && showHandCreate">
          <el-radio-group v-model="createForm.area" @change="handleAreaChange">
            <el-radio :label="1">全国</el-radio>
            <el-radio :label="2">分省市</el-radio>
          </el-radio-group>
          <el-cascader
            v-if="createForm.area === 2"
            v-model="selectedRegions"
            :options="cityOptions"
            :props="cascaderProps"
            clearable
            show-all-levels="false"
            @change="updateRegionList"
          />
        </el-form-item>
        <el-form-item label="测试时间：" prop="createTime" v-if="showExtra && showHandCreate" style="width: 83%">
          <el-date-picker v-model="createForm.createTime" type="datetimerange" format="YYYY-MM-DD HH:mm:ss"
                          value-format="YYYY-MM-DD HH:mm:ss" range-separator="至"
                          start-placeholder="开始时间"
                          end-placeholder="结束时间"
                          @change="handleDateChange">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="地图类型" prop="mapType" v-if="showExtra && showZipCreate">
          <el-radio-group v-model="createForm.mapType">  
            <el-radio :label="1">HD</el-radio>
            <el-radio :label="2">SD</el-radio>
            <el-radio :label="3">sd link组黑</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地图版本：" prop="mapVersion" v-if="showExtra && showZipCreate">
          <el-input v-model.trim="createForm.mapVersion" style="width: 80%;" @input="updateUploadData"></el-input>
        </el-form-item>
        <el-form-item label="业务类型：" prop="accessSource" v-if="showExtra && showZipCreate">
          <el-radio-group v-model="createForm.accessSource">  
            <el-radio :label="1">OA量产</el-radio>
            <el-radio :label="2">门店试驾测试</el-radio>
            <el-radio :label="3">门店试驾运营</el-radio>
            <el-radio :label="4">快修快发</el-radio>
            <el-radio :label="5">全量</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上传文件：" v-if="showExtra && showZipCreate">
          <el-upload
            ref="upload"
            class="upload-demo"
            style="width: 80%;"
            drag
            action="http://prior-issue-web-service.map-tencent-dev.nioint.com/dlayer_op/agg_task/uploadfile"
            :on-success="handleUploadSuccess"
            :data="uploadData"
            name="file"
            accept=".zip"
            :before-upload="beforeUpload"
            multiple>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">支持 .zip 等类型的文件</div>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="dialogButton" @click="createVisible = false; resetCreateForm()" size="large">取消</el-button>
          <el-button class="dialogButton" style="background-color: rgb(3, 198, 198); color: white;" size="large" @click="handleCreate"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 任务参数对话框 -->
    <el-dialog v-model="paramVisible" width="40%" title="聚合任务参数" draggable>
      <el-form :label-width="150" label-position="right" class="left" ref="paramForm">
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model.trim="paramForm.taskName" style="width: 80%;"></el-input>
        </el-form-item>
        <el-form-item label="任务备注" prop="taskMemo">
          <el-input v-model.trim="paramForm.taskMemo" style="width: 80%;"></el-input>
        </el-form-item>
        <el-form-item label="品牌：" prop="brand">
          <el-select v-model="paramForm.brand" placeholder="请选择" style="width: 80%;">
            <el-option v-for="item in brandOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="平台：" prop="platform">
          <el-select v-model="paramForm.platform" placeholder="请选择" style="width: 80%;">
            <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="功能等级：" prop="functionLevel">
          <el-select v-model="paramForm.functionLevel" placeholder="请选择" style="width: 80%;">
            <el-option v-for="item in funcLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务类型：" prop="taskType">
          <el-select v-model="paramForm.taskType" placeholder="请选择" style="width: 80%;" @change="handleTaskTypeChange">
            <el-option v-for="item in taskTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级：" prop="prior">
          <el-select v-model="paramForm.prior" placeholder="请选择" style="width: 80%;">
            <el-option v-for="item in priorOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="地图版本：" prop="mapVersion">
          <el-input v-model.trim="paramForm.mapVersion" style="width: 80%;"></el-input>
        </el-form-item>
        <el-form-item label="连续性判断：" prop="validMileage">
          <el-input v-model.trim="paramForm.validMileage" style="width: 80%;"></el-input>
        </el-form-item>
        <el-form-item label="业务类型：" prop="accessSource">
          <el-radio-group v-model="paramForm.accessSource">  
            <el-radio :label="1">OA量产</el-radio>
            <el-radio :label="2">门店试驾测试</el-radio>
            <el-radio :label="3">门店试驾运营</el-radio>
            <el-radio :label="4">快修快发</el-radio>
            <el-radio :label="5">全量</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地区范围：" prop="area">
          <el-radio-group v-model="paramForm.area">  
            <el-radio :label="1">全国</el-radio>
            <el-radio :label="2">分省市</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="测试时间：" prop="createTimeValue" style="width: 83%">
          <el-date-picker v-model="paramForm.createTime" type="datetimerange" format="YYYY-MM-DD HH:mm:ss"
                          value-format="YYYY-MM-DD HH:mm:ss" range-separator="至"
                          start-placeholder="开始时间"
                          end-placeholder="结束时间"
                          @change="handleDateChange">
          </el-date-picker>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="dialogButton" style="background-color: rgb(3, 198, 198); color: white;" size="large" @click="paramVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 取消任务对话框 -->
    <el-dialog v-model="cancelVisible" width="40%" title="取消任务" draggable>
      <div style="margin-bottom: 50px; display: flex; justify-content: center; font-size: large">请确认是否取消任务？</div>
      <el-form :label-width="150" label-position="right" class="left" ref="cancelForm">
        <el-form-item label="任务名称：" prop="taskName">
          {{ cancelForm.taskName }}
        </el-form-item>
        <el-form-item label="任务id：" prop="taskId">
          {{ cancelForm.id }}
        </el-form-item>
        <el-form-item label="任务备注：" prop="taskMemo">
          {{ cancelForm.taskMemo }}
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="dialogButton" @click="cancelVisible = false" size="large">取消</el-button>
          <el-button class="dialogButton" style="background-color: rgb(3, 198, 198); color: white;" size="large" @click="sureCancel"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
      
  </div>
</template>

<script>
import axios from 'axios';
import { ArrowRight, Message } from '@element-plus/icons-vue';
import { reactive, watch } from 'vue';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import cityData from '@/assets/city/pc-code.json';
import { formatDateTime } from '@/utils/index.js';

export const DOMAIN_MAP_PRIOR = {
  'nmap-prior-issue-web.idc-uat.nioint.com': 'http://prior-issue-web-service.map-tencent-dev.nioint.com',
  'nmap-prior-issue-web.idc-prod.nioint.com': 'http://prior-issue-web-service.map-tencent-prod.nioint.com',
  'localhost': 'http://prior-issue-web-service.map-tencent-dev.nioint.com',
};

let Domain = DOMAIN_MAP_PRIOR[window.location.hostname];

if (Domain === undefined) {
  Domain = 'http://prior-issue-web-service.map-tencent-dev.nioint.com';
}

export default {
  name: 'ClusterPage',
  data() {
    // 表单数据
    return {
      searchForm: {
        id: "",
        taskName: "",        
        mapLevel: "",
        taskType: "",
        brand: "",
        platformType: "",
        functionLevel: "",
        taskId: "",
        operator: "",
        createTimeValue: "",
        createTimeFrom: "",
        createTimeTo: "",
      },
      tableData: {
        list: [],
        pageNo: 1,
        pageSize: 20,
        total: 0,
        maxHeight: 0,
      },
      createForm: {
        taskName: "",
        taskMemo: "",
        brand: "nio",
        platform: "nt2",
        taskType: "",
        priority: "正常",
        mapVersion: "",
        accessSource: "",
        area: "",
        createTime: "",
        mapType: "",
        funcLevel: "L2",
        zipFilePath: "",
        regionList: "",
        startTime: "",
        endTime: "",
        validMileage: '',
        inheritVehicleGroup: "",
        isValidContinuity: false,
        regionList: "",
        createTimeValue: null,
      },
      uploadData: {
        hdmap_version: "" // 用于存储地图版本
      },
      paramForm: {
        taskName: "",
        taskMemo: "",
        brand: "",
        platform: "",
        prior: "",
        mapVersion: "",
        validMileage: "",
        accessSource: "",
        area: "",
        createTime: "",
        functionLevel: "",
      },
      cancelForm: {
        taskName: "",
        id: "",
        taskMemo: "",
      },
      brandOptions: [
        {label: 'nio', value: 'nio'},
        {label: 'onvo', value: 'onvo'},
      ],
      platformOptions: [
        {label: 'nt1', value: 'nt1'},
        {label: 'nt2', value: 'nt2'},
        {label: 'nt3', value: 'nt3'},
      ],
      funcLevelOptions: [
        {label: 'L2', value: 'L2'},
        {label: 'L3', value: 'L3'},
      ],
      taskTypeOptions: [
        {label: '城区黑白名单', value: '城区黑白名单'},
      ],
      priorOptions: [
        {label: '很低', value: '1'},
        {label: '低', value: '2'},
        {label: '正常', value: '3'},
        {label: '高', value: '4'},
        {label: '很高', value: '5'},
      ],

      createVisible: false,
      paramVisible: false,
      cancelVisible: false,

      showExtra: false,
      createMethodRadio: '', //radio值
      showHandCreate: false,
      showZipCreate: false,
      cityOptions: cityData,
      cascaderProps: {
        value: 'code',
        label: 'name',
        children: 'children',
        multiple: true,
        checkStrictly: false,
        emitPath: false,
      },
      selectedRegions: [],
    }
  },

  setup() {
    const store = useStore();
    const breadcrumbActive = reactive({
      manage: true,
      detail: false,
    });
    //切换面包屑
    const changeBreadcrumb = (index) => {
      store.commit('breadChange', index);
    };
    return {
      ArrowRight,
      breadcrumbActive,
      changeBreadcrumb,
    };
  },

  methods: {
    handleUploadSuccess(response, file, fileList) {
      if (response.code === 0) {
        this.createForm.zipFilePath = response.data.zip_file;
        this.$message.success('文件上传成功');
      } else {
        this.$message.error(response.msg);
      }
    },

    beforeUpload(file) {
      const isZip = file.type === 'application/zip' || file.name.endsWith('.zip');
      if (!isZip) {
        this.$message.error('上传文件只能是 ZIP 格式!');
        return false;
      }
      
      // Ensure hdmap_version is set before upload
      if (!this.uploadData.hdmap_version) {
        this.$message.error('地图版本未设置，请先填写地图版本。');
        return false;
      }
      
      return true; // Allow upload if conditions are met
    },

    updateUploadData() {
      this.uploadData.hdmap_version = this.createForm.mapVersion;
    },

    handleSizeChange(size){
      this.tableData.pageSize = size;
      this.tableData.pageNo = 1;
      this.loadingPage();
    },

    handleCurrentChange(page){
      this.tableData.pageNo = page;
      this.loadingPage();
    },

    onSearch(){
      if (
          this.searchForm.createTimeValue !== null &&
          this.searchForm.createTimeValue.length !== 0
      ) {
        this.searchForm.createTimeFrom = this.searchForm.createTimeValue[0].replace(' ','T');
        this.searchForm.createTimeTo = this.searchForm.createTimeValue[1].replace(' ','T');
      } else {
        this.searchForm.createTimeFrom = "";
        this.searchForm.createTimeTo = "";
      }
      
      this.loadingPage();
    },
      
    resetForm() {
      // 重置 searchForm 的所有字段
      Object.assign(this.searchForm, {
        id: "",
        taskName: "",
        mapLevel: "",
        taskType: "",
        brand: "",
        platformType: "",
        functionLevel: "",
        taskId: "",
        operator: "",
        createTimeValue: "",
        createTimeFrom: "",
        createTimeTo: "",
      });

      // 重新加载数据
      this.loadingPage();
    },
    
    async loadingPage() {
      // 清空旧数据
      this.tableData.list = []; 

      try {
        let res = await axios.post(`${Domain}/dlayer_op/agg_task/page_query`, {
          id: this.searchForm.id || -1, // 任务id, id=-1表示不参与筛选
          task_id: this.searchForm.taskId || "", // 任务id
          task_name: this.searchForm.taskName || "", // 空字符串表示不加入筛选条件
          task_type: this.searchForm.taskType || "", // 空字符串表示不加入筛选条件
          brand: this.searchForm.brand || "", // 空字符串表示不加入筛选条件
          platform_type: this.searchForm.platformType || "", // 空字符串表示不加入筛选条件
          function_level: this.searchForm.functionLevel || "", // 空字符串表示不加入筛选条件
          create_user: this.searchForm.operator || "", // 空字符串表示不加入筛选条件
          start_time: this.searchForm.createTimeValue ? this.searchForm.createTimeValue.join('~') : "", // 时间区间
          page_num: this.tableData.pageNo, // 当前页码
          page_size: this.tableData.pageSize, // 页码尺寸
        });

        if (res.data.code === 0) {
          const statusMap = {
            1: '未启动',
            2: '运行中',
            3: '失败',
            4: '取消',
            5: '异常终止',
            6: '正常结束'
          };

          const dataList = res.data.data.tasks.map(task => {
            // 解析 biz_info 字段
            let bizInfo = {};
            try {
              bizInfo = JSON.parse(task.biz_info);
            } catch (error) {
              console.error('解析 biz_info 失败:', error);
            }

            return {
              id: task.id,
              taskName: task.task_name, 
              mapVersion: bizInfo.param ? bizInfo.param.map_version : '', // 从 biz_info 中提取 map_version
              taskType: task.task_type === 'urban_wl' ? '城区黑白名单' : task.task_type,
              brand: task.brand,
              platform: task.platform_type, 
              functionLevel: task.function_level,
              taskId: task.job_id === -1 ? '' : task.job_id, // 如果任务 ID 为 -1，则显示为空
              taskMemo: task.task_memo || '', // 确保 taskMemo 被正确赋值
              operator: task.create_user, 
              status: statusMap[task.job_status] || '未知状态', // 转换状态码为文本
              resInfo: task.product_branch_id, 
              branchId: task.branch_id,
              priority: this.mapPriority(task.priority), // 使用映射函数转换优先级
              validMileage: bizInfo.param ? bizInfo.param.valid_mileage : '', // 确保 valid_mileage 被正确解析
              accessSource: bizInfo.param ? this.mapBusinessType(bizInfo.param.access_source) : '', // 确保 access_source 被正确解析
              createTime: task.create_ts === '0000-00-00 00:00:00' ? ' ' : task.create_ts,
              endTime: task.end_ts === '0000-00-00 00:00:00' ? ' ' : task.end_ts,
              cancelOperator: task.cancel_user, 
              cancelTime: task.cancel_ts === '0000-00-00 00:00:00' ? ' ' : task.cancel_ts, 
              children: (task.childs || []).map(child => ({
                id: child.id,
                job_id: child.job_id === -1 ? '' : child.job_id, // 同样处理子任务的 ID
                task_type: child.task_type,
                input_count: child.input_count, // 假设后端返回此字段
                output_count: child.output_count, // 假设后端返回此字段
                job_status: statusMap[child.job_status] || '未知状态', // 转换子任务状态码为文本
                create_ts: child.create_ts === '0000-00-00 00:00:00' ? ' ' : child.create_ts,
                end_ts: child.end_ts === '0000-00-00 00:00:00' ? ' ' : child.end_ts,
                taskMemo: child.task_memo || '', // 确保子任务的 taskMemo 被正确赋值
                hd_input_num: child.hd_input_num || 0,
                sd_input_num: child.sd_input_num || 0,
                sdblack_input_num: child.sdblack_input_num || 0,
                hd_generate_link: child.hd_generate_link || 0,
                sd_generate_link: child.sd_generate_link || 0,
                csv_record_count: child.csv_record_count || 0,
              })) || [],
              startTestTime: bizInfo.param ? bizInfo.param.start_time : '', // 从 biz_info 中提取 start_time
              endTestTime: bizInfo.param ? bizInfo.param.end_time : '', // 从 biz_info 中提取 end_time
            };
          });

          this.tableData.list = dataList;
          console.log('dataList: ', dataList);
          this.tableData.total = res.data.data.total;
        } else {
          throw new Error(res.data.msg);
        }
      } catch (error) {
        console.error('加载数据失败:', error);
        ElMessage.error('加载数据失败，请稍后重试。');
      }
    },
    
    handleTaskTypeChange(value) {
      if(value == '城区黑白名单') {
        this.showExtra = true
      }
    },

    handleMethodChange(value) {
      if (value == '2') { // 手动触发
        this.showHandCreate = true;
        this.showZipCreate = false;
      } else if (value == '1') { // 上传 zip
        this.showZipCreate = true;
        this.showHandCreate = false;
      }
    },

    // 反向映射优先级从中文到数字
    reverseMapPriority(priorityText) {
      const reversePriorityMap = {
        '很低': 1,
        '低': 2,
        '正常': 3,
        '高': 4,
        '很高': 5
      };
      return reversePriorityMap[priorityText] || 3; // 默认返回“正常”的数字值
    },

    async handleCreate() {
      // 检查必填项是否填写完整
      const requiredFields = ['taskName', 'brand', 'taskType', 'priority'];

      // 如果是手动触发，检查额外的必填项
      if (this.createMethodRadio === '2') {
        requiredFields.push('mapVersion', 'validMileage');
      }

      // 如果是上传 zip，检查地图类型和地图版本
      if (this.createMethodRadio === '1') {
        requiredFields.push('mapType', 'mapVersion', 'zipFilePath');
      }

      // 检查所有必填项
      for (const field of requiredFields) {
        if (!this.createForm[field]) {
          ElMessage.warning('有必填项未填写');
          return;
        }
      }

      try {
        let username = sessionStorage.getItem("realName");
        console.log('username: ', username);
        console.log('this.createMethodRadio: ', this.createMethodRadio);

        // Convert createMethodRadio to an integer
        const createTypeInt = parseInt(this.createMethodRadio, 10);

        // 构建 biz_info 字段
        let bizInfo = {
          id: this.createForm.id, 
          env: this.createForm.env, 
          create_type: createTypeInt, // Convert to integer
          function_type: this.createForm.funcLevel, // 等同 function_level
          brand: this.createForm.brand, // 品牌，目前是 nio 或者 onvo
          param: {
            access_source: this.createForm.accessSource, // 业务类型
            map_version: this.createForm.mapVersion, // 地图版本
            map_type: this.createForm.mapType, // 1: hd; 2: sd; 3: sd link组
            region_list: this.createForm.regionList, // 选中的地区编码
            is_valid_continuity: !!this.createForm.validMileage, // 根据 valid_mileage 是否有值设置
            valid_mileage: this.createForm.validMileage, // 确保 valid_mileage 被正确设置
            regional_scope: this.createForm.area === 1 ? 0 : 1, // 设置 regional_scope 参数
            start_time: this.createForm.startTime.replace(/[^0-9]/g, ''), // 格式化开始时间，去除非数字字符
            end_time: this.createForm.endTime.replace(/[^0-9]/g, ''), // 格式化结束时间，去除非数字字符
          }
        };
        
        if (createTypeInt === 1) { // 上传zip
          bizInfo.param.access_source = this.createForm.accessSource;
          bizInfo.param.zip_file = this.createForm.zipFilePath; // 使用表单中的 zip 文件路径
        } else if (createTypeInt === 2) { // 手动触发
          bizInfo.param.regional_scope = this.createForm.area === 1 ? 0 : 1; // 0: 全国; 1: 分地区
          bizInfo.param.start_time = this.createForm.startTime.replace(/[^0-9]/g, ''); // 格式化开始时间，去除非数字字符
          bizInfo.param.end_time = this.createForm.endTime.replace(/[^0-9]/g, ''); // 格式化结束时间，去除非数字字符
          bizInfo.param.inherit_vehicle_group = this.createForm.inheritVehicleGroup; // 使用表单中的车辆组
        }

        // Convert the string representation of the priority to a number
        const priorityValue = this.reverseMapPriority(this.createForm.priority);

        const response = await axios.post(`${Domain}/dlayer_op/agg_task/create`, {
          task_name: this.createForm.taskName,
          task_memo: this.createForm.taskMemo,
          task_type: "urban_wl", // 固定值
          map_version: this.createForm.mapVersion,
          biz_info: JSON.stringify(bizInfo),
          brand: this.createForm.brand,
          platform_type: this.createForm.platform,
          user: username,
          function_level: this.createForm.funcLevel, // L2 | L3
          priority: priorityValue // Ensure priority is included as a number
        });

        if (response.data.code === 0) {
          // 处理成功逻辑
          ElMessage.success('任务创建成功！');
          this.createVisible = false; // 关闭对话框
          this.resetCreateForm(); // Reset form after creation
          this.loadingPage();
        } else {
          ElMessage.error(`创建任务失败: ${response.data.msg}`);
        }
      } catch (error) {
        ElMessage.error('请求失败，请稍后重试。');
        console.error(error);
      }
    },

    resetCreateForm() {
      this.createForm = {
        taskName: "",
        taskMemo: "",
        brand: "nio",
        platform: "nt2",
        taskType: "",
        priority: "正常",
        mapVersion: "",
        businessType: "",
        area: "",
        createTime: "",
        mapType: "",
        funcLevel: "L2",
        zipFilePath: "",
        regionList: "",
        startTime: "",
        endTime: "",
        validMileage: '',
        inheritVehicleGroup: "",
        isValidContinuity: false
      };
      this.uploadData = {
        hdmap_version: ""
      };
      
      // 检查 $refs.upload 是否存在
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles(); // 清空文件列表
      } else {
        console.warn('Upload component is not initialized');
      }
    },

    handleParam(row) {
      this.paramVisible = true;
      console.log('row: ', row);

      this.paramForm = {
        ...row,
        prior: row.priority,
        mapVersion: row.mapVersion,
        validMileage: row.validMileage,
        createTime: [
          this.formatTimestamp(row.startTestTime), 
          this.formatTimestamp(row.endTestTime)
        ], // Use formatted date-time
        accessSource: this.reverseMapBusinessType(row.accessSource), // Reverse map business type
      };
    },

    handleCancel(row) {
      this.cancelVisible = true;
      this.cancelForm = row;
    },

    sureCancel() {
      const cancelUser = sessionStorage.getItem("realName"); // 获取当前用户
      axios.post(`${Domain}/dlayer_op/agg_task/cancel`, {
        id: this.cancelForm.id,
        cancel_user: cancelUser
      })
      .then(response => {
        if (response.data.code === 0) {
          this.$message.success('任务取消成功');
          this.cancelVisible = false;
          // 可以在这里添加刷新任务列表的逻辑
        } else {
          this.$message.error(response.data.msg);
        }
      })
      .catch(error => {
        console.error(error);
        this.$message.error('任务取消失败');
      });
    },

    handleCopy(row) {
      this.createVisible = true;
      console.log('row: ', row);

      this.createForm = {
        ...row,
        taskName: `${row.taskName}-copy-${row.id}`, // Copy task name
        taskMemo: row.taskMemo, // Copy task memo
        taskType: row.taskType === 'urban_wl' ? '城区黑白名单' : row.taskType, // Map task type
        funcLevel: row.functionLevel, // Function level
        prior: this.mapPriority(row.priority), // Map priority
        createMethodRadio: row.create_type, // Create method
        accessSource: this.reverseMapBusinessType(row.accessSource), // Reverse map business type
        area: row.area, // Area range
        createTime: [
          this.formatTimestamp(row.startTestTime), 
          this.formatTimestamp(row.endTestTime)
        ], // Use formatted date-time
        startTime: row.startTestTime,
        endTime: row.endTestTime,
        regionList: row.regionList, // 地区编码
        prior: row.prior,
        mapVersion: row.mapVersion,
        validMileage: row.validMileage,
      };
      // 确保 createMethodRadio 被正确初始化
      this.createMethodRadio = row.create_type || '2'; // 默认选择手动触发

      // 更新上传数据的地图版本
      this.updateUploadData();

      // 如果任务类型是“城区黑白名单”，展示额外内容
      if (this.createForm.taskType === '城区黑白名单') {
        this.showExtra = true;
        this.showHandCreate = this.createMethodRadio === '2';
        this.showZipCreate = this.createMethodRadio === '1';
      } else {
        this.showExtra = false;
      }
    },

    // 新增一个方法来映射优先级
    mapPriority(priorityValue) {
      const priorityMap = {
        1: '很低',
        2: '低',
        3: '正常',
        4: '高',
        5: '很高'
      };
      return priorityMap[priorityValue] || '正常'; // 默认返回“正常”以防止映射失败
    },
    
    adaptiveTableHeight() {
      this.tableData.maxHeight =
          document.getElementById("table-container") === null
              ? 0
              : document.getElementById("table-container").offsetHeight;
    },
    handleAreaChange(value) {
      if (value === 1) {
        this.createForm.regionList = '';
      } else {
        this.createForm.regionList = '';
      }
    },
    updateRegionList(selectedCodes) {
      // 将选中的地区编码处理为六位
      this.createForm.regionList = selectedCodes.map(code => {
        if (code.length === 4) {
          return code + '00'; // 普通市级，补全为六位
        }
        return code; // 已经是六位的编码
      }).join(',');
    },
    handleDateChange(dates) {
      console.log('dates: ', dates);
      if (dates && dates.length === 2) {
        this.createForm.startTime = dates[0];
        this.createForm.endTime = dates[1];
      } else {
        this.createForm.startTime = "";
        this.createForm.endTime = "";
      }
    },
    openCreateDialog() {
      this.resetCreateForm(); // 重置表单数据
      this.createVisible = true; // 打开对话框
      this.showExtra = false; // 重置 showExtra 状态
      this.showHandCreate = false; // 重置 showHandCreate 状态
      this.showZipCreate = false; // 重置 showZipCreate 状态
    },
    handleDialogClose() {
      this.resetCreateForm(); // 重置表单数据，包括文件路径
    },
    mapBusinessType(businessTypeValue) {
      const businessTypeMap = {
        1: 'OA量产',
        2: '门店试驾测试',
        3: '门店试驾运营',
        4: '快修快发',
        5: '全量'
      };
      return businessTypeMap[businessTypeValue] || '未知类型'; // 默认返回“未知类型”以防止映射失败
    },
    reverseMapBusinessType(businessTypeText) {
      const reverseBusinessTypeMap = {
        'OA量产': 1,
        '门店试驾测试': 2,
        '门店试驾运营': 3,
        '快修快发': 4,
        '全量': 5
      };
      return reverseBusinessTypeMap[businessTypeText] || 0; // 默认返回 0 以防止映射失败
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      const year = timestamp.slice(0, 4);
      const month = timestamp.slice(4, 6);
      const day = timestamp.slice(6, 8);
      const hour = timestamp.slice(8, 10);
      const minute = timestamp.slice(10, 12);
      const second = timestamp.slice(12, 14);
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    },
    formatInputCounts(row) {
      console.log('row: ', row);
      const counts = [
        row.hd_input_num || 0,
        row.sd_input_num || 0,
        row.sdblack_input_num || 0
      ];
      return counts.join(',');
    },
    formatOutputCounts(row) {
      const counts = [
        row.hd_generate_link || 0,
        row.sd_generate_link || 0,
        row.csv_record_count || 0
      ];
      return counts.join(',');
    },
  },

  mounted() {
    this.$nextTick(async () => {
      await this.loadingPage();
      this.adaptiveTableHeight();
    });
    window.addEventListener("resize", this.adaptiveTableHeight, false);
  },

  destroyed() {
    window.removeEventListener("resize", this.adaptiveTableHeight, false);
  }
}
</script>

<style scoped>
:deep(.el-button.is-link) {
  padding: 0;
}
.operateAreaTop{
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
}

.operateAreaBottom{
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.dialogButton{
  margin-right: 20px;
}

ul {
  font-size: medium;
  font-weight: bold;
}

.res-info-link {
  color: #409EFF;
  text-decoration: none;
  cursor: pointer;
}

.res-info-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.form-row {
  display: flex;
  justify-content: flex-start;
  max-width: 610px;
}

.form-row .el-form-item {
  flex: 1;
  margin-right: 5px;
}

.form-row .el-form-item:last-child {
  margin-right: 0;
}

.el-radio {
  margin-right: 10px !important; /* Override default margin-right */
}

:deep(.el-table .cell) {
  max-height: 60px; 
  white-space: normal; /* Allow text to wrap */
  overflow: hidden; /* Hide overflow */
  text-overflow: ellipsis; /* Add ellipsis for overflow */
}
</style>