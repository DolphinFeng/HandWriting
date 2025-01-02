<template>
  <div id="DriveTest" class="component">
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">常用工具</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item @click="backTaskPage">
        <div
          @click="changeBreadcrumb(1)"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }"
          class="breadcrumbItem"
        >
          统计分析
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索框 -->
    <el-form :model="searchForm" label-position="right" inline class="search-form">
      <el-form-item label="任务名称:" prop="productBranchId">
        <el-input v-model="searchForm.taskName" placeholder="请输入任务名称" style="width: 200px" clearable/>
      </el-form-item>
      <el-form-item label="任务类型:" prop="productId">
        <el-input v-model="searchForm.taskType" placeholder="请输入任务类型" style="width: 200px" clearable/>
      </el-form-item>
      <el-form-item label="任务id:" prop="branchId">
        <el-input v-model="searchForm.taskId" placeholder="请输入任务id" style="width: 200px" clearable/>
      </el-form-item>
      <el-form-item label="创建人:" prop="jobName">
        <el-input v-model="searchForm.operator" placeholder="请输入创建人" style="width: 200px" clearable/>
      </el-form-item>
      <el-form-item label="任务状态:" prop="jobId">
        <el-input v-model="searchForm.status" placeholder="请输入任务状态" style="width: 200px" clearable/>
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
        <el-button @click="resetForm">重置</el-button>
        <el-button @click="createVisible = true">新建统计任务</el-button>
      </el-form-item>
    </el-form>
    <!-- 表格区 -->
    <div class="table">
      <!-- 表格 -->
      <div class="table-container" id="table-container">
        <el-table :data="tableData.list" border :max-height="tableData.maxHeight" v-loading="loading"
                  element-loading-text="加载中" :element-loading-spinner="svg" row-key="productBranchId"
                  element-loading-svg-view-box="-10, -10, 50, 50">
          <el-table-column prop="id" key="id" label="id" align="center" width="100" fixed="left"></el-table-column>
          <el-table-column prop="taskName" key="taskName" label="任务名称" align="center" width="150"></el-table-column>
          <el-table-column prop="taskType" key="taskType" label="任务类型" align="center" width="150"></el-table-column>
          <el-table-column prop="taskId" key="taskId" label="任务id" align="center" width="150"></el-table-column>
          <el-table-column prop="notes" key="notes" label="备注" align="center" width="200"></el-table-column>
          <el-table-column prop="operator" key="operator" label="创建人" align="center" width="200"></el-table-column>
          <el-table-column prop="status" key="status" label="任务状态" align="center" width="150"></el-table-column>
          <el-table-column prop="resInfo" key="resInfo" label="成果信息" align="center" width="250">

          </el-table-column>
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

    <!-- 新建统计任务对话框 -->
    <el-dialog v-model="createVisible" width="40%" title="新建统计任务" draggable>
      <el-form :label-width="150" label-position="right" class="left" ref="createForm">
        <el-form-item label="任务名称" prop="taskName" :rules="[{ required: true, message: '必填项', trigger: 'submit' }]">
          <el-input v-model.trim="createForm.taskName" style="width: 80%;"></el-input>
        </el-form-item>
        <el-form-item label="任务备注" prop="notes">
          <el-input v-model.trim="createForm.notes" style="width: 80%;"></el-input>
        </el-form-item>
        <el-form-item label="品牌：" prop="brand">
          <el-select v-model="createForm.brand" placeholder="请选择" style="width: 80%;">
            <el-option v-for="item in brandOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="平台：" prop="platform">
          <el-select v-model="createForm.platform" placeholder="请选择" style="width: 80%;">
            <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务类型：" prop="taskType">
          <el-select v-model="createForm.taskType" placeholder="请选择" style="width: 80%;" @change="handleTaskTypeChange">
            <el-option v-for="item in taskTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级：" prop="prior">
          <el-select v-model="createForm.prior" placeholder="请选择" style="width: 80%;">
            <el-option v-for="item in priorOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="创建方式：" prop="createMethodRadio" v-if="showExtra">
          <el-radio-group v-model="createMethodRadio" @change="handleMethodChange">  
            <el-radio :label="1">手动触发</el-radio>
            <el-radio :label="2">上传zip</el-radio>  
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地图版本：" prop="mapVersion" v-if="showExtra && showHandCreate" required="true">
          <el-input v-model.trim="createForm.mapVersion" style="width: 80%;"></el-input>
        </el-form-item>
        <el-form-item label="连续性判断：" prop="judge" v-if="showExtra && showHandCreate" required="true">
          <el-input v-model.trim="createForm.judge" style="width: 80%;"></el-input>
        </el-form-item>
        <el-form-item label="业务类型：" prop="businessType" v-if="showExtra && showHandCreate">
          <el-radio-group v-model="createForm.businessType">  
            <el-radio :label="1">OA量产</el-radio>
            <el-radio :label="2">门店试驾测试</el-radio>
            <el-radio :label="3">门店试驾运营</el-radio>
            <el-radio :label="4">快修快发</el-radio>
            <el-radio :label="5">全量</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地区范围：" prop="area" v-if="showExtra && showHandCreate">
          <el-radio-group v-model="createForm.area">  
            <el-radio :label="1">全国</el-radio>
            <el-radio :label="2">分省市</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="测试时间：" prop="createTime" v-if="showExtra && showHandCreate" required="true">
          <el-date-picker v-model="createForm.createTime" type="datetimerange" style="width: 80%" format="YYYY-MM-DD HH:mm:ss"
                          value-format="YYYY-MM-DD HH:mm:ss" range-separator="至"
                          start-placeholder="开始时间"
                          end-placeholder="结束时间">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="地图类型" prop="mapType" v-if="showExtra && showZipCreate" required="true">
          <el-radio-group v-model="createForm.mapType">  
            <el-radio :label="1">HD</el-radio>
            <el-radio :label="2">SD</el-radio>
            <el-radio :label="3">sd link组黑</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地图版本：" prop="mapVersion" v-if="showExtra && showZipCreate" required="true">
          <el-input v-model.trim="createForm.mapVersion" style="width: 80%;"></el-input>
        </el-form-item>
        <el-form-item label="业务类型：" prop="businessType" v-if="showExtra && showZipCreate">
          <el-radio-group v-model="createForm.businessType">  
            <el-radio :label="1">OA量产</el-radio>
            <el-radio :label="2">门店试驾测试</el-radio>
            <el-radio :label="3">门店试驾运营</el-radio>
            <el-radio :label="4">快修快发</el-radio>
            <el-radio :label="5">全量</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上传文件：" v-if="showExtra && showZipCreate">
          <el-upload
            class="upload-demo"
            style="width: 80%;"
            drag
            action="https://jsonplaceholder.typicode.com/posts/"
            multiple>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="dialogButton" @click="createVisible = false" size="large">取消</el-button>
          <el-button class="dialogButton" style="background-color: rgb(3, 198, 198); color: white;" size="large" @click="handleCreate"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 任务参数对话框 -->
    <el-dialog v-model="paramVisible" width="40%" title="统计任务参数" draggable>
      <el-form :label-width="150" label-position="right" class="left" ref="paramForm">
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model.trim="paramForm.taskName" style="width: 80%;"></el-input>
        </el-form-item>
        <el-form-item label="任务备注" prop="notes">
          <el-input v-model.trim="paramForm.notes" style="width: 80%;"></el-input>
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
        <el-form-item label="连续性判断：" prop="judge">
          <el-input v-model.trim="paramForm.judge" style="width: 80%;"></el-input>
        </el-form-item>
        <el-form-item label="业务类型：" prop="businessType">
          <el-radio-group v-model="paramForm.businessType">  
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
        <el-form-item label="测试时间：" prop="createTimeValue">
          <el-date-picker v-model="paramForm.createTimeValue" type="datetimerange" style="width: 80%" format="YYYY-MM-DD HH:mm:ss"
                          value-format="YYYY-MM-DD HH:mm:ss" range-separator="至"
                          start-placeholder="开始时间"
                          end-placeholder="结束时间">
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
          {{ cancelForm.taskId }}
        </el-form-item>
        <el-form-item label="任务备注：" prop="notes">
          {{ cancelForm.notes }}
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

export const DOMAIN_MAP_PRIOR = {
  'nmap-prior-issue-web.idc-uat.nioint.com': 'http://map-wish-service-tob.map-idc-stg.nioint.com',
  'nmap-prior-issue-web.idc-prod.nioint.com': 'http://map-wish-service-tob.map-tencent-prod.nioint.com',
  'localhost': 'http://map-wish-service-tob.map-idc-stg.nioint.com',
};

let Domain = DOMAIN_MAP_PRIOR[window.location.hostname];

if (Domain === undefined) {
  Domain = 'http://map-wish-service-tob.map-idc-stg.nioint.com';
}

export default {
  name: 'ClusterPage',
  data() {
    // 表单数据
    return {
      searchForm: {
        taskName: "",        
        taskType: "",  
        taskId: "",
        operator: "",
        status: "",
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
        notes: "",
        brand: "",
        platform: "",
        taskType: "",
        prior: "",
        mapVersion: "",
        judge: "",
        businessType: "",
        area: "",
        createTime: "",
        mapType: "",
      },
      paramForm: {
        taskName: "",
        notes: "",
        brand: "",
        platform: "",
        taskType: "",
        prior: "",
        mapVersion: "",
        judge: "",
        businessType: "",
        area: "",
        createTime: "",
      },
      cancelForm: {
        taskName: "",
        taskId: "",
        notes: "",
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
      taskTypeOptions: [
        {label: '城区黑白名单', value: '城区黑白名单'},
      ],
      priorOptions: [
        {label: '正常', value: '正常'},
      ],

      createVisible: false,
      paramVisible: false,
      cancelVisible: false,

      showExtra: false,
      createMethodRadio: '', //radio值
      showHandCreate: false,
      showZipCreate: false,
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
      Object.assign(this.searchForm, {
        taskName: "",        
        taskType: "",  
        taskId: "",
        operator: "",
        status: "",
        createTimeValue: "",
        createTimeFrom: "",
        createTimeTo: "",
      });
      this.loadingPage();
    },
    
    async loadingPage() {
      // let res = await axios.post('http://map-wish-service-tob.map-idc-stg.nioint.com/dlayer_op/product_branch/query', {
      //   product_branch_id: this.searchForm.productBranchId,
      //   product_id: this.searchForm.productId,
      //   branch_id: this.searchForm.branchId,
      //   job_id: this.searchForm.jobId,
      //   job_name: this.searchForm.jobName,
      //   create_ts_s: this.searchForm.createTimeFrom,
      //   create_ts_e: this.searchForm.createTimeTo,
      //   deploy_env: this.searchForm.deployEnv,
      //   vid_group_stg: this.searchForm.vidGroupsStg,
      //   vid_group_prod: this.searchForm.vidGroupsProd,
      //   query_timestamp: new Date().getTime(),
      //   page_offset: (this.tableData.pageNo-1) * this.tableData.pageSize,
      //   page_size: this.tableData.pageSize,
      // })
      // if (res.data.code === 0) {
      //   const dataList = res.data.data.data_list;
      //   this.tableData.list = this.handleData(dataList)

      //   this.tableData.total = res.data.data.total
      // } else {
      //   throw new Error(res.data.msg);
      // }
      this.tableData.list = [
        {
          id: "1",
          taskName: "测试任务",        
          taskType: "城区黑白名单",
          taskId: "32787",
          notes: "For 305 多高快白名单",
          operator: "ydh",
          status: "已完成",
          resInfo: "hdwhitelist_224050704,240807 sdwhitelist_224050704,240807 sdblacklist_224050704,240807",
          createTime: "2024-08-07 16:31:34",
          endTime: "2024-09-02 14:40:51",
          cancelOperator: "ydh",
          cancelTime: "2024-09-02 14:40:51",
        }
      ]
      this.tableData.total = 1
    },
    
    handleTaskTypeChange(value) {
      if(value == '城区黑白名单') {
        this.showExtra = true
      }
    },

    handleMethodChange(value) {
      if(value == '1') { //手动触发
        this.showZipCreate = false
        this.showHandCreate = true
      } else if (value == '2') { //zip上传触发
        this.showHandCreate = false
        this.showZipCreate = true
      }
    },

    handleCreate() {
      this.createVisible = false
    },

    handleParam(row) {
      this.paramVisible = true
      // 目前是直接用row赋值，后面有接口了用row里的id去调接口再赋值
      this.paramForm = row
    },

    handleCancel(row) {
      this.cancelVisible = true
      this.cancelForm = row
    },

    sureCancel() {
      this.cancelVisible = false
    },

    handleCopy(row) {
      this.createForm = row
      this.createForm.taskName = row.taskName + '-copy-' + row.taskId
      if(this.createForm.taskType == '城区黑白名单') {
        this.showExtra = true
      }
      this.createVisible = true
    },

    adaptiveTableHeight() {
      this.tableData.maxHeight =
          document.getElementById("table-container") === null
              ? 0
              : document.getElementById("table-container").offsetHeight;
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
</style>