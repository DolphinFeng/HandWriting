<template>
  <div id="BatchGenerate" class="component">
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">成果管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item @click="backTaskPage">
        <div
          @click="changeBreadcrumb(1)"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }"
          class="breadcrumbItem"
        >
          批量生成
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索框 -->
    <el-form :model="searchForm" label-position="right" inline class="search-form">
      <el-form-item prop="productBranchId">
        <el-input v-model="searchForm.productBranchId" placeholder="id" style="width: 150px" clearable/>
      </el-form-item>
      <el-form-item prop="productId">
        <el-input v-model="searchForm.productId" placeholder="产品id" style="width: 150px" clearable/>
      </el-form-item>
      <el-form-item prop="branchId">
        <el-input v-model="searchForm.branchId" placeholder="分支" style="width: 150px" clearable/>
      </el-form-item>
      <el-form-item prop="jobName">
        <el-input v-model="searchForm.jobName" placeholder="任务名称" style="width: 150px" clearable/>
      </el-form-item>
      <el-form-item prop="jobId">
        <el-input v-model="searchForm.jobId" placeholder="任务id" style="width: 150px" clearable/>
      </el-form-item>
      <el-form-item prop="createTimeValue">
        <el-date-picker v-model="searchForm.createTimeValue" type="datetimerange" style="width: 400px" format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss" range-separator="至"
                        start-placeholder="创建开始时间"
                        end-placeholder="创建结束时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item prop="deployEnv">
        <el-select v-model="searchForm.deployEnv" placeholder="上线环境" style="width: 150px" clearable >
          <el-option v-for="item in deployEnvOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item prop="vidGroupsStg">
        <el-input v-model="searchForm.vidGroupsStg" placeholder="stg灰度组" style="width: 150px" clearable/>
      </el-form-item>
      <el-form-item prop="vidGroupsProd">
        <el-input v-model="searchForm.vidGroupsProd" placeholder="prod灰度组" style="width: 150px" clearable/>
      </el-form-item>
      <!-- 工具按钮 -->
      <el-form-item class="search-button">
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button @click="resetForm" style="margin-right: 40px;">重置</el-button>
        <el-button @click="batchOnline('stg')">上线stg</el-button>
        <el-button @click="batchOutline('stg')">下线stg</el-button>
        <span class="vertical-line"></span>
        <el-button type="primary" @click="batchOnline('prod')">上线prod</el-button>
        <el-button type="primary" @click="batchOutline('prod')">下线prod</el-button>
      </el-form-item>
    </el-form>
    <!-- 表格区 -->
    <div class="table">
      <!-- 表格 -->
      <div class="table-container" id="table-container">
        <el-table :data="tableData.list" border :max-height="tableData.maxHeight" v-loading="loading"
                  element-loading-text="加载中" :element-loading-spinner="svg" row-key="productBranchId"
                  element-loading-svg-view-box="-10, -10, 50, 50" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" fixed="left" class-name="centered-checkbox"></el-table-column>
          <el-table-column type="expand" fixed="left">
            <template #default="{ row }">
              <el-table :data="row['pushRecords']" border>
                <el-table-column prop="pushRecordId" key="pushRecordId" label="上下线任务id" align="center" width="200"></el-table-column>
                <el-table-column prop="dataEngineTaskId" key="dataEngineTaskId" label="作业系统任务id" align="center" width="200"></el-table-column>
                <el-table-column prop="taskType" key="taskType" label="任务类型" align="center" width="200"></el-table-column>
                <el-table-column prop="pushStatus" key="pushStatus" label="任务状态" align="center" width="200"></el-table-column>
                <el-table-column prop="eventCountSuccess" key="eventCountSuccess" label="上下线事件数量" align="center" width="200"></el-table-column>
                <el-table-column prop="failEventNum" key="failEventNum" label="失败数量" align="center" width="200"></el-table-column>
                <el-table-column prop="createUser" key="createUser" label="创建人" align="center" width="200"></el-table-column>
                <el-table-column prop="pushStartTs" key="pushStartTs" label="开始时间" align="center" width="200"></el-table-column>
                <el-table-column prop="pushEndTs" key="pushEndTs" label="结束时间" align="center" width="200"></el-table-column>
                <el-table-column prop="deployEnv" key="deployEnv" label="环境" align="center" width="200"></el-table-column>
                <el-table-column prop="brand" key="brand" label="品牌" align="center" width="200"></el-table-column>
                <el-table-column prop="dcsType" key="dcsType" label="平台" align="center" width="200"></el-table-column>
                <el-table-column prop="functionLevel" key="functionLevel" label="功能等级" align="center" width="200"></el-table-column>
                <el-table-column prop="vidGroup" key="vidGroup" label="灰度组" align="center" width="200"></el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column prop="productBranchId" key="productBranchId" label="id" align="center" width="100" fixed="left"></el-table-column>
          <el-table-column prop="productId" key="productId" label="产品id" align="center" width="220"></el-table-column>
          <el-table-column prop="branchId" key="branchId" label="分支" align="center" width="200"></el-table-column>
          <el-table-column prop="jobName" key="jobName" label="任务名称" align="center" width="200"></el-table-column>
          <el-table-column prop="jobId" key="jobId" label="任务id" align="center" width="200"></el-table-column>
          <el-table-column prop="fileCount" key="fileCount" label="文件数量" align="center" width="200"></el-table-column>
          <el-table-column prop="storageSize" key="storageSize" label="文件大小(mb)" align="center" width="200"></el-table-column>
          <el-table-column prop="createUser" key="createUser" label="创建人" align="center" width="200"></el-table-column>
          <el-table-column prop="createTs" key="createTs" label="创建时间" align="center" width="200"></el-table-column>
          <el-table-column prop="onlineEnvs" key="onlineEnvs" label="上线环境" align="center" width="200"></el-table-column>
          <el-table-column prop="vidGroupsStg" key="vidGroupsStg" label="stg灰度组" align="center" width="200" show-overflow-tooltip></el-table-column>
          <el-table-column prop="vidGroupsProd" key="vidGroupsProd" label="prod灰度组" align="center" width="200" show-overflow-tooltip></el-table-column>
          <el-table-column label="操作" align="center" width="250" fixed="right">
            <template #default="{ row }">
              <div class="operateAreaTop">
                <el-button class="onlineStg" @click="showOnline(row, 'stg')" type="primary" size="small" ref="onlineStg" :style="handleOnlineStgStyle(row.pushRecords)">
                  上线stg
                </el-button>
                <el-button class="onlineProd" @click="showOnline(row, 'prod')" type="primary" size="small" ref="onlineProd" :style="handleOnlineProdStyle(row.pushRecords)">
                  上线prod
                </el-button>
              </div> 
              <div class="operateAreaBottom">
                <el-button class="outlineStg" @click="showOutline(row, 'stg')" type="primary" size="small" ref="outlineStg" :style="handleOutlineStgStyle(row.pushRecords)">
                  下线stg
                </el-button>
                <el-button class="outlineProd" @click="showOutline(row, 'prod')" type="primary" size="small" ref="outlineProd" :style="handleOutlineProdStyle(row.pushRecords)">
                  下线prod
                </el-button>       
              </div>         
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

    <!-- 上线对话框 -->
    <el-dialog v-model="onlineVisible" width="80%" :title="onlineDialogTitle" draggable :style="{ maxWidth: '900px' }">
      <el-form :label-width="150" label-position="right" class="left" ref="onlineForm">
        <el-form-item style="transform: translateX(-7%);">
          <ul>请核实待上线数据，并设置上线信息（{{ onlineType }}）：</ul>
        </el-form-item>
        
        <!-- 添加表格展示选中的项 -->
        <div class="selected-items-table" style="margin-left: 90px; width: 80%;">
          <el-table :data="selectedRows" style="width: 100%" max-height="300">
            <el-table-column prop="productBranchId" label="ID" width="100" />
            <el-table-column prop="productId" label="产品ID" width="220" />
            <el-table-column prop="branchId" label="分支" width="200" />
            <el-table-column prop="fileCount" label="文件数" width="100" />
            <el-table-column prop="storageSize" label="文件大小(MB)" width="120" />
          </el-table>
        </div>

        <el-form-item label="品牌：" prop="brand" label-position="left" :rules="[{ required: true, message: '必填项', trigger: 'submit' }]">
          <el-select v-model="onlineForm.brand" placeholder="请选择" style="width: 90%;">
            <el-option v-for="item in brandOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="平台：" prop="platform" label-position="left" :rules="[{ required: true, message: '必填项', trigger: 'submit' }]">
          <el-select v-model="onlineForm.platform" placeholder="请选择" style="width: 90%;">
            <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="功能等级：" prop="functionLevel" label-position="left" :rules="[{ required: true, message: '必填项', trigger: 'submit' }]">
          <el-select v-model="onlineForm.functionLevel" placeholder="请选择" style="width: 90%;">
            <el-option v-for="item in funcLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="灰度组：" prop="vidGroup" label-position="left" :rules="[{ required: true, message: '必填项', trigger: 'submit' }]">
          <el-input v-model.trim="onlineForm.vidGroup" style="width: 90%;"></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button class="dialogButton" @click="onlineVisible = false" size="large">取消</el-button>
          <el-button class="dialogButton" style="background-color: rgb(3, 198, 198); color: white;" 
            @click="handleBatchOnline()" size="large" :disabled="isButtonDisabled"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 下线对话框 -->
    <el-dialog v-model="outlineVisible" width="80%" :title="outlineDialogTitle" draggable :style="{ maxWidth: '900px' }">
      <el-form :label-width="150" label-position="right" class="left" ref="outlineForm">
        <el-form-item style="transform: translateX(-7%);">
          <ul>请核实待下线数据，并设置下线信息（{{ outlineType }}）：</ul>
        </el-form-item>
        
        <!-- 添加表格展示选中的项 -->
        <div class="selected-items-table" style="margin-left: 90px; width: 80%;">
          <el-table :data="selectedRows" style="width: 100%" max-height="300">
            <el-table-column prop="productBranchId" label="ID" width="100" />
            <el-table-column prop="productId" label="产品ID" width="220" />
            <el-table-column prop="branchId" label="分支" width="200" />
            <el-table-column prop="fileCount" label="文件数" width="100" />
            <el-table-column prop="storageSize" label="文件大小(MB)" width="120" />
          </el-table>
        </div>

        <el-form-item label="品牌：" prop="brand" :rules="[{ required: true, message: '必填项', trigger: 'submit' }]">
          <el-select v-model="outlineForm.brand" placeholder="请选择" style="width: 90%;">
            <el-option v-for="item in brandOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="平台：" prop="platform" :rules="[{ required: true, message: '必填项', trigger: 'submit' }]">
          <el-select v-model="outlineForm.platform" placeholder="请选择" style="width: 90%;">
            <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="功能等级：" prop="functionLevel" :rules="[{ required: true, message: '必填项', trigger: 'submit' }]">
          <el-select v-model="outlineForm.functionLevel" placeholder="请选择" style="width: 90%;">
            <el-option v-for="item in funcLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="灰度组：" prop="vidGroup" label-position="left" :rules="[{ required: true, message: '必填项', trigger: 'submit' }]">
          <el-input v-model.trim="outlineForm.vidGroup" style="width: 90%;"></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button class="dialogButton" @click="outlineVisible = false" size="large">取消</el-button>
          <el-button class="dialogButton" style="background-color: rgb(3, 198, 198); color: white;" 
            @click="handleBatchOutline()" size="large" :disabled="isButtonDisabled"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 上线stg进度对话框 -->
    <!-- <div class="modelessDialog">
      <el-dialog v-model="onlineStgProcessVisible" width="30%" title="上线stg进度" draggable :modal="false" :close-on-click-modal="false" :show-close="false" :destroy-on-close="true">
        <el-form :label-width="150" label-position="right" class="left" ref="onlineStgForm">
          <el-form-item><li style="list-style-type: disc;">产品库id： {{ onlineStgForm.productBranchId }}</li></el-form-item>
          <el-form-item><li style="list-style-type: disc;">分支： {{ onlineStgForm.branchId }}</li></el-form-item>
          <div style="margin-bottom: 40px;"></div>
          <el-form-item><li style="list-style-type: disc;">完成进度： {{ onlineStgForm.fileCountSuccess }} / {{ onlineStgForm.fileCount }} 文件数</li></el-form-item>
          <el-form-item><li style="list-style-type: disc;">失败数量： 0 文件数</li></el-form-item>
          <el-form-item><li style="list-style-type: disc;">生成事件： {{ onlineStgForm.eventCountSuccess }} 条数</li></el-form-item>
          <div style="margin-bottom: 40px;"></div>
          <el-form-item><li style="list-style-type: disc;">任务状态： {{ onlineStgForm.pushStatus }}</li></el-form-item>
        </el-form>
  
        <template #footer>
          <span class="dialog-footer">
            <el-button class="minOnlineStg" @click = minOnlineStg()>最小化</el-button>
            <el-button id="onlineStgFinishButton" @click=onlineStgFinish() disabled>已完成</el-button>
          </span>
        </template>
      </el-dialog>    
    </div> -->
    
    <!-- 上线prod进度对话框 -->
    <!-- <div class="modelessDialog">
      <el-dialog v-model="onlineProdProcessVisible" width="30%" title="上线prod进度" draggable :modal="false" :close-on-click-modal="false" :show-close="false" :destroy-on-close="true">
        <el-form :label-width="150" label-position="right" class="left" ref="onlineProdForm">
          <el-form-item><li style="list-style-type: disc;">产品库id： {{ onlineProdForm.productBranchId }}</li></el-form-item>
          <el-form-item><li style="list-style-type: disc;">分支： {{ onlineProdForm.branchId }}</li></el-form-item>
          <div style="margin-bottom: 40px;"></div>
          <el-form-item><li style="list-style-type: disc;">完成进度： {{ onlineProdForm.fileCountSuccess }} / {{ onlineProdForm.fileCount }} 文件数</li></el-form-item>
          <el-form-item><li style="list-style-type: disc;">失败数量： 0 文件数</li></el-form-item>
          <el-form-item><li style="list-style-type: disc;">生成事件： {{ onlineProdForm.eventCountSuccess }} 条数</li></el-form-item>
          <div style="margin-bottom: 40px;"></div>
          <el-form-item><li style="list-style-type: disc;">任务状态： {{ onlineProdForm.pushStatus }}</li></el-form-item>
        </el-form>
  
        <template #footer>
          <span class="dialog-footer">
            <el-button class="minOnlineProd" @click = minOnlineProd()>最小化</el-button>
            <el-button id="onlineProdFinishButton" @click=onlineProdFinish() disabled>已完成</el-button>
          </span>
        </template>
      </el-dialog>    
    </div> -->

    <!-- 下线stg进度对话框 -->
    <!-- <div class="modelessDialog">
      <el-dialog v-model="outlineStgProcessVisible" width="30%" title="下线stg进度" draggable :modal="false" :close-on-click-modal="false" :show-close="false">
        <el-form :label-width="150" label-position="right" class="left" ref="outlineStgForm">
          <el-form-item><li style="list-style-type: disc;">产品库id： {{ outlineStgForm.productBranchId }}</li></el-form-item>
          <el-form-item><li style="list-style-type: disc;">分支： {{ outlineStgForm.branchId }}</li></el-form-item>
          <el-form-item><li style="list-style-type: disc;">环境： stg</li></el-form-item>
          <el-form-item><li style="list-style-type: disc;">灰度组： {{ outlineStgForm.vidGroup }}</li></el-form-item>
          <div style="margin-bottom: 40px;"></div>
          <el-form-item><li style="list-style-type: disc;">完成进度： {{ outlineStgForm.fileCountSuccess }} / {{ outlineStgForm.fileCount }} 文件数</li></el-form-item>
          <el-form-item><li style="list-style-type: disc;">失败数量： 0 文件数</li></el-form-item>
          <div style="margin-bottom: 40px;"></div>
          <el-form-item><li style="list-style-type: disc;">任务状态： {{ outlineStgForm.pushStatus }}</li></el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button class="minOutlineStg" @click = minOutlineStg()>最小化</el-button>
            <el-button id="outlineStgFinishButton" @click=outlineStgFinish() disabled>已完成</el-button>
          </span>
        </template>
      </el-dialog>
    </div> -->

    <!-- 下线prod进度对话框 -->
    <!-- <div class="modelessDialog">
      <el-dialog v-model="outlineProdProcessVisible" width="30%" title="下线prod进度" draggable :modal="false" :close-on-click-modal="false" :show-close="false">
        <el-form :label-width="150" label-position="right" class="left" ref="outlineProdForm">
          <el-form-item><li style="list-style-type: disc;">产品库id： {{ outlineProdForm.productBranchId }}</li></el-form-item>
          <el-form-item><li style="list-style-type: disc;">分支： {{ outlineProdForm.branchId }}</li></el-form-item>
          <el-form-item><li style="list-style-type: disc;">环境： prod</li></el-form-item>
          <el-form-item><li style="list-style-type: disc;">灰度组： {{ outlineProdForm.vidGroup }}</li></el-form-item>
          <div style="margin-bottom: 40px;"></div>
          <el-form-item><li style="list-style-type: disc;">完成进度： {{ outlineProdForm.fileCountSuccess }} / {{ outlineProdForm.fileCount }} 文件数</li></el-form-item>
          <el-form-item><li style="list-style-type: disc;">失败数量： 0 文件数</li></el-form-item>
          <div style="margin-bottom: 40px;"></div>
          <el-form-item><li style="list-style-type: disc;">任务状态： {{ outlineProdForm.pushStatus }}</li></el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button class="minOutlineProd" @click = minOutlineProd()>最小化</el-button>
            <el-button id="outlineProdFinishButton" @click=outlineProdFinish() disabled>已完成</el-button>
          </span>
        </template>
      </el-dialog>
    </div> -->
    
  </div>
</template>

<script>
import axios from 'axios';
import { ArrowRight, Message } from '@element-plus/icons-vue';
import { reactive, watch } from 'vue';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';

export const DOMAIN_MAP_PRIOR = {
  'nmap-prior-issue-web.idc-uat.nioint.com': 'http://prior-issue-web-service.map-tencent-dev.nioint.com',
  'nmap-prior-issue-web.idc-prod.nioint.com': 'http://prior-issue-web-service.map-tencent-prod.nioint.com',
  'localhost': 'http://prior-issue-web-service.map-tencent-dev.nioint.com',
};

let Domain = DOMAIN_MAP_PRIOR[window.location.hostname];

if (Domain === undefined) {
  Domain = 'http://prior-issue-web-service.map-tencent-prod.nioint.com';
}

export default {
  name: 'BatchGenerate',
  props: {
    productBranchIds: {
      type: String,
      default: ''
    }
  },

  created() {
    // 在created钩子中处理初始化
    if (this.productBranchIds) {
      this.searchForm.productBranchId = this.productBranchIds;
      this.loadingPage();
      console.log('初始化查询:', this.productBranchIds, this.searchForm);
    }
  },

  watch: {
    // 监听路由参数变化
    '$route.query.ids': {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.searchForm.productBranchId = newVal;
          this.loadingPage();
          console.log('路由参数变化:', newVal, this.searchForm);
        }
      }
    }
  },

  // 组件注册
  data() {
    return {
      initForm: {},
      //动态表单拼接地址
      // 任务详情用到的参数
      breadcrumbTasksShow: false,

      isButtonDisabled: false,

      rowId: 0,

      onlineType: "stg",
      outlineType: "stg",

      onlineVisible: false, //两个上线对话框
      outlineVisible: false, //两个下线对话框

      // onlineStgProcessVisible: false, //上线stg进程对话框
      // onlineProdProcessVisible: false, //上线prod进程对话框

      // outlineStgProcessVisible: false, //下线stg进程对话框
      // outlineProdProcessVisible: false, //下线prod进程对话框

      deployEnvOptions: [
        {name: 'stg', value: 'stg'},
        {name: 'prod', value: 'prod'},
        {name: 'stg&prod', value: 'stg&prod'},
      ],

      //两个上线表单
      onlineForm: {
        productBranchId: "",
        productId: "",
        branchId: "",
        fileCount: 0,
        storageSize: 0,
        vidGroup: "",
        eventStatus: 0, //不传是上线，传-1是下线
        //以下两个用来判断是否有相同灰度组
        vidGroupsStg: "",
        vidGroupsProd: "",
        brand: "nio",
        platform: "nt2",
        functionLevel: "L2",
      },

      //上线stg表单
      onlineStgForm: {
        pushRecordId: 0,
        productId: "",
        branchId: "",
        fileCount: 0,
        storageSize: 0,
        vidGroup: "",
        //进度
        productBranchId: "",
        fileCountSuccess: "",
        eventCountSuccess: "",
        pushStatus: "",
      },

      //上线prod表单
      onlineProdForm: {
        pushRecordId: 0,
        productId: "",
        branchId: "",
        fileCount: 0,
        storageSize: 0,
        vidGroup: "",
        //进度
        productBranchId: "",
        fileCountSuccess: "",
        eventCountSuccess: "",
        pushStatus: "",
      },

      //两个下线表单
      outlineForm: {
        productBranchId: "",
        productId: "",
        branchId: "",
        fileCount: 0,
        storageSize: 0,
        vidGroup: "",
        brand: "nio",
        platform: "nt2",
        functionLevel: "L2",
        // 以下两个用来判断是否有相同灰度组
        vidGroupsStg: "",
        vidGroupsProd: "",
      },

      //下线stg表单
      outlineStgForm: {
        productId: "",
        branchId: "",
        fileCount: 0,
        storageSize: 0,
        vidGroup: "",
        deployEnv: "",
        //进度
        productBranchId: "",
        fileCountSuccess: "",
        pushStatus: "",
      },

      //下线prod表单
      outlineProdForm: {
        productId: "",
        branchId: "",
        fileCount: 0,
        storageSize: 0,
        vidGroup: "",
        //进度
        productBranchId: "",
        fileCountSuccess: "",
        pushStatus: "",
      },

      // 表单数据
      searchForm: {
        productBranchId: "",        
        productId: "",  
        branchId: "",
        jobName: "",
        jobId: "",
        createTimeValue: "",
        create_ts_s: "",
        create_ts_e: "",
        deployEnv: "",
        vidGroupsStg: "",
        vidGroupsProd: "",
        creater: "",
        operator: "",
      },
      tableData: {
        list: [],
        pageNo: 1,
        pageSize: 20,
        total: 0,
        maxHeight: 0,
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
      selectedRows: [],
    };
  },

  computed: {
    // 动态设置上线对话框标题 
    onlineDialogTitle() {  
      switch (this.onlineType) {  
        case 'stg':  
          return '上线stg';  
        case 'prod':  
          return '上线prod';   
      }  
    }, 
    // 动态设置下线对话框标题 
    outlineDialogTitle() {  
      switch (this.outlineType) {  
        case 'stg':  
          return '下线stg';  
        case 'prod':  
          return '下线prod';   
      }  
    },
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

  watch: {
    $route: {
      handler: 'handleQuery',
    },
  },

  methods: {
    handleSelectionChange(val) {
      this.selectedRows = val;
    },
    batchOnline(env) {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要上线的任务');
        return;
      }
      this.onlineType = env;
      this.onlineVisible = true;
    },
    batchOutline(env) {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要下线的任务');
        return;
      }
      this.outlineType = env;
      this.outlineVisible = true;
    },
    // 灰度组输入规则校验
    isVidGroupValid(vidgroup) {

      let vidgroups = vidgroup.split(',')
      for(let vidgroup1 of vidgroups){
        // 校验规则  
        if (vidgroup1 === '0') {  
          continue;
        }  
        if (/^s\d+$/.test(vidgroup1)) {  
          continue; // 规则2：取s+自然数  
        }  
        if (/^p\d+$/.test(vidgroup1)) {  
          continue; // 规则3：取p+自然数  
        }  
        return false; // 不符合任何规则  
      }

      return true;
    },

    // //最小化
    // minOnlineStg(){
    //   this.onlineStgProcessVisible = false
    // },
    // minOnlineProd(){
    //   this.onlineProdProcessVisible = false
    // },
    // minOutlineStg(){
    //   this.outlineStgProcessVisible = false
    // },
    // minOutlineProd(){
    //   this.outlineProdProcessVisible = false
    // },

    //已完成
    // onlineStgFinish(){
    //   this.onlineStgProcessVisible = false
    //   ElMessage.success({
    //     message: "上线stg已完成!",
    //     showClose: false,
    //     grouping: true,
    //   });
    // },
    // onlineProdFinish(){
    //   this.onlineProdProcessVisible = false
    //   ElMessage.success({
    //     message: "上线prod已完成!",
    //     showClose: false,
    //     grouping: true,
    //   });
    // },
    // outlineStgFinish(){
    //   this.outlineStgProcessVisible = false
    //   ElMessage.success({
    //     message: "下线stg已完成!",
    //     showClose: false,
    //     grouping: true,
    //   });
    // },
    // outlineProdFinish(){
    //   this.outlineProdProcessVisible = false
    //   ElMessage.success({
    //     message: "下线prod已完成!",
    //     showClose: false,
    //     grouping: true,
    //   });
    // },

    // 把一个对象里的下划线属性都转驼峰
    toCamelCase(obj) {
      if (typeof obj !== 'object' || obj === null) {  
          // 如果不是对象或数组，则直接返回  
          return obj;  
      }  
    
      if (Array.isArray(obj)) {  
          // 如果是数组，则遍历数组中的每个元素并递归调用  
          return obj.map(item => this.toCamelCase(item));  
      }  
    
      const camelCaseObj = {};  
      for (const key in obj) {  
          if (obj.hasOwnProperty(key)) {  
              // 将下划线命名转换为驼峰命名  
              const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase()); 
              
              // 检查是否需要转换时间戳  
              // if (['createTs', 'pushStartTs', 'pushEndTs'].includes(key)) {  
              //     obj[key] = this.getDate(obj[key]); // 调用 getDate 方法转换时间戳  
              // }

              // 递归处理对象值  
              camelCaseObj[camelKey] = this.toCamelCase(obj[key]);  
          }  
      }

      // 拼接任务类型
      if (camelCaseObj.hasOwnProperty('pushType') && camelCaseObj.hasOwnProperty('deployEnv')) {  
          camelCaseObj.taskType = camelCaseObj.pushType + camelCaseObj.deployEnv;
      }

      return camelCaseObj;
    },

    handleData(dataList) {
      // 转驼峰
      dataList = this.toCamelCase(dataList)
      // dataList = dataList.reverse()

      for(let listItem of dataList) { // 每一个大对象
        
        let dataMap = new Map()
        for(let recordsItem of listItem.pushRecords) {
          // 获取上线环境和灰度组
          if(!dataMap.has(recordsItem.deployEnv)) { // 没找到就设置（数组格式）
            dataMap.set(recordsItem.deployEnv, [recordsItem.vidGroup])
          }else { // 找到了就在数组里继续push
            dataMap.get(recordsItem.deployEnv).push(recordsItem.vidGroup)
          }

          recordsItem.pushStartTs = recordsItem.pushStartTs.replace('T', ' ') // 去除时间中的T
          recordsItem.pushEndTs = recordsItem.pushEndTs.replace('T', ' ') // 去除时间中的T

          // 任务状态转中文
          if(recordsItem.pushStatus == 'writing_db') {
            recordsItem.pushStatus = '事件正在写入到mongodb中'
          } else if (recordsItem.pushStatus == 'running') {
            recordsItem.pushStatus = '运行中'
          } else if (recordsItem.pushStatus == 'fail') {
            recordsItem.pushStatus = '失败'
          } else if (recordsItem.pushStatus == 'complete') {
            recordsItem.pushStatus = '已完成'
          }
        }

        // listItem.onlineEnvs = Array.from(dataMap.keys()).length === 0 ? '-' : Array.from(dataMap.keys()).join(',')
        // // 去重再join
        // listItem.vidGroupsStg = dataMap.has('stg') ? dataMap.get('stg').filter((item,index,arr)=>arr.indexOf(item) === index).join(',') : '-'
        // listItem.vidGroupsProd = dataMap.has('prod') ? dataMap.get('prod').filter((item,index,arr)=>arr.indexOf(item) === index).join(',') : '-'

        // 对环境、灰度组进行格式设置
        listItem.onlineEnvs = listItem.onlineEnvs == "" ? '-' : listItem.onlineEnvs
        listItem.vidGroupsStg = listItem.vidGroupsStg == "" ? '-' : listItem.vidGroupsStg
        listItem.vidGroupsProd = listItem.vidGroupsProd == "" ? '-' : listItem.vidGroupsProd

        listItem.storageSize = listItem.storageSize === 0 ? 0 : (listItem.storageSize / 1048576).toFixed(3) // 存储大小的单位转换

        listItem.createTs = listItem.createTs.replace('T', ' ') // 去除时间中的T
      }

      return dataList
    },
    
    // 修改展示弹窗函数
    async showOnline(row, type) {
      // 将单个row包装成数组，复用批量处理逻辑
      this.selectedRows = [row];
      this.onlineType = type;
      this.onlineVisible = true;
    },

    // 新增批量处理函数
    async handleBatchOnline() {
      try {
        if (this.isButtonDisabled) {
          return;
        }

        this.isButtonDisabled = true;

        if (this.onlineForm.vidGroup == '') {
          ElMessage.warning({
            message: '有必填项未填',
            showClose: false,
            grouping: true,
          });
          return;
        } else if (!this.isVidGroupValid(this.onlineForm.vidGroup)) {
          ElMessage.warning({
            message: '输入灰度组格式错误',
            showClose: false,
            grouping: true,
          });
          return;
        }

        const vidgroups = this.onlineForm.vidGroup.split(',');
        
        // 遍历所有选中的行
        for (const row of this.selectedRows) {
          for (const vidgroup of vidgroups) {
            const deployEnv = this.onlineType;
            const existingVidGroups = deployEnv === 'stg' ? row.vidGroupsStg : row.vidGroupsProd;
            
            // 检查是否存在相同灰度组
            if (existingVidGroups.split(',').indexOf(vidgroup) !== -1) {
              // 弹出确认框
              try {
                await ElMessageBox.confirm(`分支 ${row.branchId} 已有推送记录, 是否继续?`, '提示', {
                  confirmButtonText: '继续',
                  cancelButtonText: '取消',
                  type: 'warning'
                });
              } catch (e) {
                continue; // 用户取消则跳过此条记录
              }
            }

            // 调用上线接口
            try {
              const pushRes = await axios.post(Domain + '/dlayer_op/push_events', {
                product_branch_id: parseInt(row.productBranchId),
                deploy_env: deployEnv,
                vid_group: vidgroup,
                brand: this.onlineForm.brand,
                dcs_type: this.onlineForm.platform,
                function_level: this.onlineForm.functionLevel,
                create_user: sessionStorage.getItem("realName"),
              });

              if (pushRes.data.code === 0) {
                // 更新进度显示
                // if (deployEnv === 'stg') {
                //   this.rowId = row.productBranchId;
                //   this.onlineStgForm.pushRecordId = pushRes.data.data.push_record_id;
                //   // this.onlineStgProcessVisible = true;
                //   await this.onlineStgUpdate();
                // } else {
                //   this.rowId = row.productBranchId;
                //   this.onlineProdForm.pushRecordId = pushRes.data.data.push_record_id;
                //   // this.onlineProdProcessVisible = true;
                //   await this.onlineProdUpdate();
                // }
                ElMessage.success({
                  message: `分支 ${row.branchId} ${pushRes.msg ?? '上线成功'}`,
                  showClose: false,
                  grouping: true,
                });
              } else {
                ElMessage.error({
                  message: `分支 ${row.branchId} ${pushRes.msg ?? '上线失败'}`,
                  showClose: false,
                  grouping: true,
                });
              }
            } catch (error) {
              console.error(error);
              ElMessage.error({
                message: `分支 ${row.branchId} 上线失败`,
                showClose: false,
                grouping: true,
              });
            }
          }
        }

        this.onlineVisible = false;
      } catch (error) {
        throw error;
      } finally {
        this.isButtonDisabled = false;
        this.loadingPage();
      }
    },

    async onlineStgUpdate() {
    try {
      let queryRes = await axios.post(Domain + '/dlayer_op/product_branch/query', {
        product_branch_id: (this.rowId).toString(),
        query_timestamp: new Date().getTime(),
        page_offset: 0,
        page_size: this.tableData.pageSize,
      });
      
      let dataObj = queryRes.data.data.data_list[0];

      this.onlineStgForm.productBranchId = dataObj.product_branch_id;
      this.onlineStgForm.branchId = dataObj.branch_id;
      this.onlineStgForm.fileCount = dataObj.file_count;
      
      for(let recordsItem of dataObj.push_records) {
        if(recordsItem.push_record_id == this.onlineStgForm.pushRecordId) {
          this.onlineStgForm.fileCountSuccess = recordsItem.file_count_success;
          this.onlineStgForm.eventCountSuccess = recordsItem.event_count_success;
          this.onlineStgForm.pushStatus = this.getPushStatus(recordsItem.push_status);
        }
      }
    } catch (error) {
      console.error('更新上线stg进度失败:', error);
    }
  },

  getPushStatus(status) {
    switch(status) {
      case 'writing_db': return '事件正在写入到mongodb中';
      case 'running': return '运行中';
      case 'fail': return '失败';
      case 'complete': return '已完成';
      default: return status;
    }
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

    onSearch() {
      // 处理创建时间
      if (this.searchForm.createTimeValue && this.searchForm.createTimeValue.length === 2) {
        this.searchForm.create_ts_s = this.searchForm.createTimeValue[0];
        this.searchForm.create_ts_e = this.searchForm.createTimeValue[1];
      } else {
        this.searchForm.create_ts_s = "";
        this.searchForm.create_ts_e = "";
      }
      
      this.loadingPage();
    },
      
    resetForm() {
      Object.assign(this.searchForm, {
        productBranchId: "",
        productId: "",
        branchId: "",
        jobName: "",
        jobId: "",
        createTimeValue: "",
        create_ts_s: "",
        create_ts_e: "",
        deployEnv: "",
        vidGroupsStg: "",
        vidGroupsProd: "",
        creater: "",
        operator: "",
      });
      this.loadingPage();
    },
    
    async loadingPage() {
      try {
        console.log('开始查询，参数:', this.searchForm);
        // 处理逗号分隔的id
        const productBranchId = this.searchForm.productBranchId;
        
        let res = await axios.post(Domain + '/dlayer_op/product_branch/query', {
          product_branch_id: productBranchId,
          product_id: this.searchForm.productId,
          branch_id: this.searchForm.branchId,
          job_id: this.searchForm.jobId,
          job_name: this.searchForm.jobName,
          create_ts_s: this.searchForm.create_ts_s,
          create_ts_e: this.searchForm.create_ts_e,
          deploy_env: this.searchForm.deployEnv,
          vid_group_stg: this.searchForm.vidGroupsStg,
          vid_group_prod: this.searchForm.vidGroupsProd,
          create_user: this.searchForm.creater,
          operator: this.searchForm.operator,
          query_timestamp: new Date().getTime(),
          page_offset: (this.tableData.pageNo-1) * this.tableData.pageSize,
          page_size: this.tableData.pageSize,
        });

        if (res.data.code === 0) {
          console.log('查询结果:', res.data);
          const dataList = res.data.data.data_list;
          this.tableData.list = this.handleData(dataList);
          this.tableData.total = res.data.data.total;
        } else {
          throw new Error(res.data.msg);
        }
      } catch (error) {
        console.error('查询失败:', error);
        ElMessage.error({
          message: error.message || '查询失败',
          showClose: false,
          grouping: true,
        });
      }
    },
        
    adaptiveTableHeight() {
      this.tableData.maxHeight =
          document.getElementById("table-container") === null
              ? 0
              : document.getElementById("table-container").offsetHeight;
    },
    
    handleOnlineStgStyle(pushRecords) {
      if(pushRecords == undefined) {
        return { border: 'none' }
      }
      // for(let item of pushRecords) {
      //   if(item.pushStatus == '运行中' && item.taskType == '上线stg') {
      //     return { border: '2px dashed red' }
      //   }
      // }
      return { border: 'none' }
    },
    handleOnlineProdStyle(pushRecords) {
      if(pushRecords == undefined) {
        return { border: 'none' }
      }
      // for(let item of pushRecords) {
      //   if(item.pushStatus == '运行中' && item.taskType == '上线prod') {
      //     return { border: '2px dashed red' }
      //   }
      // }
      return { border: 'none' }
    },
    handleOutlineStgStyle(pushRecords) {
      if(pushRecords == undefined) {
        return { border: 'none' }
      }
      // for(let item of pushRecords) {
      //   if(item.pushStatus == '运行中' && item.taskType == '下线stg') {
      //     return { border: '2px dashed red' }
      //   }
      // }
      return { border: 'none' }
    },
    handleOutlineProdStyle(pushRecords) {
      if(pushRecords == undefined) {
        return { border: 'none' }
      }
      // for(let item of pushRecords) {
      //   if(item.pushStatus == '运行中' && item.taskType == '下线prod') {
      //     return { border: '2px dashed red' }
      //   }
      // }
      return { border: 'none' }
    },
    async showOutline(row, type) {
      // 将单个row包装成数组，复用批量处理逻辑
      this.selectedRows = [row];
      this.outlineType = type;
      this.outlineVisible = true;
    },
    async handleBatchOutline() {
      try {
        if (this.isButtonDisabled) {
          return;
        }

        this.isButtonDisabled = true;

        if (this.outlineForm.vidGroup == '') {
          ElMessage.warning({
            message: '有必填项未填',
            showClose: false,
            grouping: true,
          });
          return;
        } else if (!this.isVidGroupValid(this.outlineForm.vidGroup)) {
          ElMessage.warning({
            message: '输入灰度组格式错误',
            showClose: false,
            grouping: true,
          });
          return;
        }

        const vidgroups = this.outlineForm.vidGroup.split(',');
        
        // 遍历所有选中的行
        for (const row of this.selectedRows) {
          for (const vidgroup of vidgroups) {
            const deployEnv = this.outlineType;
            
            // 调用下线接口
            try {
              const pushRes = await axios.post(Domain + '/dlayer_op/push_events', {
                product_branch_id: parseInt(row.productBranchId),
                deploy_env: deployEnv,
                vid_group: vidgroup,
                event_status: -1, // -1表示下线
                brand: this.outlineForm.brand,
                dcs_type: this.outlineForm.platform,
                function_level: this.outlineForm.functionLevel,
                create_user: sessionStorage.getItem("realName"),
              });

              if (pushRes.data.code === 0) {
                // 更新进度显示
                // if (deployEnv === 'stg') {
                //   this.rowId = row.productBranchId;
                //   this.outlineStgForm.pushRecordId = pushRes.data.data.push_record_id;
                //   this.outlineStgProcessVisible = true;
                //   await this.outlineStgUpdate();
                // } else {
                //   this.rowId = row.productBranchId;
                //   this.outlineProdForm.pushRecordId = pushRes.data.data.push_record_id;
                //   this.outlineProdProcessVisible = true;
                //   await this.outlineProdUpdate();
                // }
                ElMessage.success({
                  message: `分支 ${row.branchId} ${pushRes.msg ?? '下线成功'}`,
                  showClose: false,
                  grouping: true,
                });
              } else {
                ElMessage.error({
                  message: `分支 ${row.branchId} ${pushRes.msg ?? '下线失败'}`,
                  showClose: false,
                  grouping: true,
                });
              }
            } catch (error) {
              console.error(error);
              ElMessage.error({
                message: `分支 ${row.branchId} 下线失败`,
                showClose: false,
                grouping: true,
              });
            }
          }
        }

        this.outlineVisible = false;
      } catch (error) {
        throw error;
      } finally {
        this.isButtonDisabled = false;
        this.loadingPage();
      }
    },

    async onlineProdUpdate() {
      try {
        let queryRes = await axios.post(Domain + '/dlayer_op/product_branch/query', {
          product_branch_id: (this.rowId).toString(),
          query_timestamp: new Date().getTime(),
          page_offset: 0,
          page_size: this.tableData.pageSize,
        });
        
        let dataObj = queryRes.data.data.data_list[0];

        this.onlineProdForm.productBranchId = dataObj.product_branch_id;
        this.onlineProdForm.branchId = dataObj.branch_id;
        this.onlineProdForm.fileCount = dataObj.file_count;
        
        for(let recordsItem of dataObj.push_records) {
          if(recordsItem.push_record_id == this.onlineProdForm.pushRecordId) {
            this.onlineProdForm.fileCountSuccess = recordsItem.file_count_success;
            this.onlineProdForm.eventCountSuccess = recordsItem.event_count_success;
            this.onlineProdForm.pushStatus = this.getPushStatus(recordsItem.push_status);
          }
        }
      } catch (error) {
        console.error('更新上线prod进度失败:', error);
      }
    },

    async outlineStgUpdate() {
      try {
        let queryRes = await axios.post(Domain + '/dlayer_op/product_branch/query', {
          product_branch_id: (this.rowId).toString(),
          query_timestamp: new Date().getTime(),
          page_offset: 0,
          page_size: this.tableData.pageSize,
        });
        
        let dataObj = queryRes.data.data.data_list[0];

        this.outlineStgForm.productBranchId = dataObj.product_branch_id;
        this.outlineStgForm.branchId = dataObj.branch_id;
        this.outlineStgForm.fileCount = dataObj.file_count;
        
        for(let recordsItem of dataObj.push_records) {
          if(recordsItem.push_record_id == this.outlineStgForm.pushRecordId) {
            this.outlineStgForm.fileCountSuccess = recordsItem.file_count_success;
            this.outlineStgForm.pushStatus = this.getPushStatus(recordsItem.push_status);
          }
        }
      } catch (error) {
        console.error('更新下线stg进度失败:', error);
      }
    },

    async outlineProdUpdate() {
      try {
        let queryRes = await axios.post(Domain + '/dlayer_op/product_branch/query', {
          product_branch_id: (this.rowId).toString(),
          query_timestamp: new Date().getTime(),
          page_offset: 0,
          page_size: this.tableData.pageSize,
        });
        
        let dataObj = queryRes.data.data.data_list[0];

        this.outlineProdForm.productBranchId = dataObj.product_branch_id;
        this.outlineProdForm.branchId = dataObj.branch_id;
        this.outlineProdForm.fileCount = dataObj.file_count;
        
        for(let recordsItem of dataObj.push_records) {
          if(recordsItem.push_record_id == this.outlineProdForm.pushRecordId) {
            this.outlineProdForm.fileCountSuccess = recordsItem.file_count_success;
            this.outlineProdForm.pushStatus = this.getPushStatus(recordsItem.push_status);
          }
        }
      } catch (error) {
        console.error('更新下线prod进度失败:', error);
      }
    },
  },

  mounted() {
    this.$nextTick(async () => {
      // 如果有路由参数，使用路由参数查询
      if (this.productBranchIds) {
        console.log('mounted时检查到参数:', this.productBranchIds);
        this.searchForm.productBranchId = this.productBranchIds;
      }
      // 无论是否有参数都执行查询
      await this.loadingPage();
      this.adaptiveTableHeight();

      // 在加载页面后选中某些行
      this.selectedRows = this.tableData.list.filter(item => {
        return this.productBranchIds.split(",").includes(item.productBranchId.toString());
      });
      this.handleSelectionChange(this.selectedRows); // 手动触发
    });
    window.addEventListener("resize", this.adaptiveTableHeight, false);

  },

  destroyed() {
    window.removeEventListener("resize", this.adaptiveTableHeight, false);
  }
};
</script>
<style scoped>
:deep(.el-button.is-link) {
  padding: 0;
}

/* :deep(.centered-checkbox.el-table-column--selection.el-table-fixed-column--left.is-leaf.el-table__cell) {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
} */

/* .modelessDialog{
  z-index: 1;
} */

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

.batch-operations {
  margin-bottom: 10px;
}

.selected-items-table {
  margin: 20px 0;
  .el-table {
    max-height: 300px;
    overflow-x: auto;
  }
}

.vertical-line {
  display: inline-block;
  width: 1px;
  height: 20px;
  background-color: #ccc;
  margin: 0 10px;
}
</style>
