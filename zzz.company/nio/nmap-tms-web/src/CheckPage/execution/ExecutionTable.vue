<template>
  <!-- 主表格信息组件 -->
  <div id="ExecutionTable" class="table">
    <div id="ExecutionTableContainer"
         class="table-container"
         v-loading="loading"
         element-loading-text="拼命加载中..."
         :element-loading-spinner="svg"
         element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-table :data="tableData" border :max-height="tableHeight" highlight-current-row>
        <el-table-column prop="id" key="id" label="Id" min-width="60" align="center"></el-table-column>
        <el-table-column prop="valId" key="valId" label="valId" min-width="200" align="center"></el-table-column>
        <el-table-column prop="valType" label="检查类型" min-width="80" align="center"></el-table-column>
        <el-table-column prop="runEngine" key="runEngine" label="执行引擎" min-width="120" align="center"></el-table-column>
        <el-table-column prop="runStatus" key="runStatus" label="执行状态" min-width="80" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.runStatus)">
              <span>{{statusFilter(scope.row.runStatus)}}</span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="valResultRepoMode" label="结果存储模式" min-width="80" align="center"></el-table-column>
        <el-table-column prop="reqTime" key="reqTime" label="请求时间" min-width="140" align="center"></el-table-column>
        <el-table-column prop="respTime" label="结束时间" min-width="140" align="center"></el-table-column>
        <el-table-column prop="bizId" key="bizId" label="任务id" min-width="110" align="center"></el-table-column>
        <el-table-column prop="bizDesc" key="bizDesc" label="业务描述" min-width="185" align="center"></el-table-column>
        <el-table-column prop="isWatchDiff" label="统计信息" align="center" min-width="120">   
          <template #default="scope">
              <el-button type="primary" @click="handleWatch(scope.row)" :disabled="!scope.row.isWatchDiff">查看</el-button>
              <el-button type="primary" @click="rowDetail = scope.row; diffInfo.valId = scope.row.valId; diffEnsureVisible = true" :disabled="!scope.row.isWatchDiff">差分</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="isCosRestore" label="操作" align="center" min-width="120">   
          <template #default="scope">
              <el-button type="primary" @click="handleCheck(scope.row)" :disabled="!scope.row.isCosRestore">从cos恢复结果</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 查看对话框 -->
      <el-dialog title="查看执行记录" v-model="watchDialogVisible" :destroy-on-close="true" width="2000px">
        <div class="search-area">
          <el-form inline>
            <el-form-item label="检查规则号">
              <el-input v-model="watchSearchForm.ruleCode" style="width: 200px;" clearable></el-input>
            </el-form-item>
            <el-form-item label="检查规则名称">
              <el-input v-model="watchSearchForm.ruleName" style="width: 200px;" clearable></el-input>
            </el-form-item>
            <el-form-item label="检查规则等级">
              <el-select v-model="watchSearchForm.impLevel" style="width: 200px;" clearable>
                <el-option label="S" value="S"></el-option>
                <el-option label="A" value="A"></el-option>
                <el-option label="B" value="B"></el-option>
                <el-option label="C" value="C"></el-option>
                <el-option label="D" value="D"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <div class="search-button">
            <el-button type="primary" @click="handleWatch(rowDetail)" style="margin-bottom: 10px;">查询</el-button>
            <el-button type="primary" @click="watchDownload()" style="margin-bottom: 10px;">下载</el-button>
          </div>
        </div>
        
        <el-table :data="watchData" border height="800px">
          <el-table-column property="valId" label="valId" width="280px"></el-table-column>
          <el-table-column property="ruleCode" label="检查规则号" width="280px"></el-table-column>
          <el-table-column property="ruleName" label="检查规则名称"></el-table-column>
          <el-table-column property="impLevel" label="检查规则等级" width="120px"></el-table-column>
          <el-table-column property="errCountMap" label="错误信息集合"></el-table-column>
          <el-table-column property="allCount" label="报错量" width="120px"></el-table-column>
          <el-table-column property="realCount" label="报错量-去误报后" width="150px"></el-table-column>
        </el-table>
        <div class="block">
          <el-pagination background @size-change="handleWatchSizeChange" @current-change="handleWatchCurrentChange"
            v-model="watchCurrentPage" :page-sizes="[20, 50, 100, 1000, 9999]" :page-size="watchPageSize"
            layout="total, sizes, prev, pager, next, jumper" :total="watchTotal">
          </el-pagination>
        </div>
      </el-dialog>

      <!-- 确认差分id对话框 -->
      <el-dialog title="差分" v-model="diffEnsureVisible" width="600px" :destroy-on-close="true">
        <el-form label-position="right">
          <el-form-item label="当前valId为： " label-width="150px">
            <el-input v-model="diffInfo.valId" style="width: 300px;" clearable></el-input>
          </el-form-item>
          <el-form-item label="老任务valId： " label-width="150px">
            <el-input v-model="diffInfo.diffValId" style="width: 300px;" clearable></el-input>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" style="display: flex; justify-content: end">
          <el-button @click="diffEnsureVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleDiff()">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 差分对话框 -->
      <el-dialog title="差分" v-model="diffDialogVisible" :destroy-on-close="true" width="2000px">
        <div class="search-area">
          <el-form inline>
            <el-form-item label="检查规则号">
              <el-input v-model="diffSearchForm.ruleCode" style="width: 200px;" clearable></el-input>
            </el-form-item>
            <el-form-item label="检查规则名称">
              <el-input v-model="diffSearchForm.ruleName" style="width: 200px;" clearable></el-input>
            </el-form-item>
            <el-form-item label="检查规则等级">
              <el-select v-model="diffSearchForm.impLevel" style="width: 200px;" clearable>
                <el-option label="S" value="S"></el-option>
                <el-option label="A" value="A"></el-option>
                <el-option label="B" value="B"></el-option>
                <el-option label="C" value="C"></el-option>
                <el-option label="D" value="D"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <div class="search-button">
            <el-button type="primary" @click="handleDiff(rowDetail)" style="margin-bottom: 10px;">查询</el-button>
            <el-button type="primary" @click="diffDownload()" style="margin-bottom: 10px;">下载</el-button>
          </div>
        </div>
        
        <el-table :data="diffData" border height="800px" width="2000px">
          <el-table-column property="valId" label="valId"></el-table-column>
          <el-table-column property="diffValId" label="老valId"></el-table-column>
          <el-table-column property="ruleCode" label="检查规则号"></el-table-column>
          <el-table-column property="ruleName" label="检查规则名称"></el-table-column>
          <el-table-column property="impLevel" label="检查规则等级"></el-table-column>
          <el-table-column property="errCountMap" label="错误信息集合"></el-table-column>
          <el-table-column property="allCount" label="报错量"></el-table-column>
          <el-table-column property="realCount" label="报错量-去误报后"></el-table-column>
          <el-table-column property="diffErrCountMap" label="老任务错误信息集合"></el-table-column>
          <el-table-column property="diffAllCount" label="老任务报错量"></el-table-column>
          <el-table-column property="diffRealCount" label="老任务报错量-去误报后"></el-table-column>
          <el-table-column property="diffWrongInfo" label="错误信息集合差分（新-老）"></el-table-column>
          <el-table-column property="diffWrongCount" label="报错量差分（新-老）"></el-table-column>
          <el-table-column property="diffWrongRealCount" label="报错量去误报后差分（新-老）"></el-table-column>
        </el-table>
        <div class="block">
          <el-pagination background @size-change="handleDiffSizeChange" @current-change="handleDiffCurrentChange"
            v-model="diffCurrentPage" :page-sizes="[20, 50, 100, 1000, 9999]" :page-size="diffPageSize"
            layout="total, sizes, prev, pager, next, jumper" :total="diffTotal">
          </el-pagination>
        </div>
      </el-dialog>
    </div>
    <!-- 执行记录：分页组件 -->
    <div style="padding-top: 10px" class="pagination-container">
      <el-pagination
        background
        :total="total"
        :page-size="pageSize"
        v-model="currentPage"
        :page-sizes="[5,10,20,50]"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        layout="total,sizes,prev,pager,next,jumper"
      ></el-pagination>
    </div>
    <!--  json查看对话框  -->
    <JsonView
        :data="jsonData"
        :title="jsonTitle"
        v-model:visible="jsonVisible"
    ></JsonView>
  </div>
</template>

<script>
  import {copyTextToClipboard} from "../../utils";
  import {useRouter} from "vue-router";
  import JsonView from "../../jsonView/JsonView.vue";
  import {svg} from "@/js/loading_data.js";
  import axios from "axios";
import { ElMessage } from "element-plus";

  const nioCheckURL = window.api.nioCheckURL;

  export default {
    name: "ExecutionTable",
    components: {JsonView},
    // 接收父组件传来的参数
    props: {
      loading: Boolean,
      tableData: Array,
      total: Number,
    },
    data() {
      return {
        // 执行记录表格的最大高度
        tableHeight: 0,
        // 每次表格展示多少条信息
        pageSize: 20,
        // 表格当前页码
        currentPage: 1,
        //json查看对话框
        jsonVisible: false,
        //当前待查看json数据
        jsonData: '{}',
        //json对话框title
        jsonTitle: '',
        svg: svg,

        watchSearchForm: {
          ruleCode: "",
          ruleName: "",
          impLevel: ""
        },
        diffSearchForm: {
          ruleCode: "",
          ruleName: "",
          impLevel: ""
        },

        rowDetail: {},

        watchDialogVisible: false,
        watchData: [],
        watchPageSize: 20,
        watchCurrentPage: 1,
        watchTotal: 0,

        diffEnsureVisible: false,
        diffDialogVisible: false,
        diffData: [],
        diffInfo: {
          valId: "",
          diffValId: "",
        },
        diffPageSize: 20,
        diffCurrentPage: 1,
        diffTotal: 0,
      }
    },
    setup() {
      const router = useRouter();
      function linkTo(path, query) {
        router.push({path, query});
      }
      return {
        linkTo,
      }
    },
    methods: {
      // 表格当前页码改变时触发函数
      handleCurrentChange(page) {
        this.$emit('handleCurrentChange', page)
      },
      // 表格size改变时触发函数
      handleSizeChange(page_size) {
        this.pageSize = page_size;
        this.$emit('handleSizeChange', page_size)
      },
      // 设置表格的最大高度
      adaptiveTableHeight() {
        this.tableHeight = document.getElementById('ExecutionTableContainer') === null ? 0 : document.getElementById('ExecutionTableContainer').offsetHeight;
      },
      // 获取任务状态
      getStatusType(status) {
        switch (status) {
          case 0:
            return '';
          case 1:
            return 'warning';
          case 11:
            return 'danger';
          case 12:
            return 'info';
          case 100:
            return 'success';
          default:
            return '';
        }
      },
      statusFilter(status) {
        switch (status) {
          case 0:
            return '创建';
          case 1:
            return '执行中';
          case 11:
            return '执行失败';
          case 12:
            return '取消';
          case 100:
            return '执行成功';
          default:
            return status;
        }
      },
      showJson(json, title) {
        this.jsonData = json;
        this.jsonTitle = title;
        this.jsonVisible = true;
      },
      closeJson() {
        this.jsonVisible = false;
      },
      copyJsonSource() {
        copyTextToClipboard(this.jsonData);
      },

      //更换表格单页显示条数
      handleWatchSizeChange(pageSize) {
        this.watchPageSize = pageSize;
        this.watchCurrentPage = 1;
        this.handleWatch(this.rowDetail);
      },
      //切换页码
      handleWatchCurrentChange(page) {
        this.watchCurrentPage = page;
        this.handleWatch(this.rowDetail);
      },

      // 查看
      async handleWatch(row) {
        this.watchDialogVisible = true
        this.rowDetail = row

        let res = await axios.post(nioCheckURL + '/check-man/run/statistics', {
          valId: row.valId,
          ruleCode: this.watchSearchForm.ruleCode,
          ruleName: this.watchSearchForm.ruleName,
          impLevel: this.watchSearchForm.impLevel == "" ? null : this.watchSearchForm.impLevel,
          pageNo: this.watchCurrentPage,
          pageSize: this.watchPageSize,
        })

        if(res.data.data.result == null) {
          this.watchData = []
        } else {
          // 处理对象
          for(let item of res.data.data.result) {
            item.errCountMap = JSON.stringify(item.errCountMap)
          }
          
          this.watchData = res.data.data.result
        }

        this.watchTotal = res.data.data.total
      },

      // 查看下载
      async watchDownload() {
        let res = await axios.post(nioCheckURL + '/check-man/run/statistics-download', {
          valId: this.rowDetail.valId
        })
        let aLink = document.createElement('a');
        //将实参字符串转二进制对象，如果不是文本可以通过添加第二个参数指定编码
        let blob = new Blob([res.data]);
        //指定要下载的文件名(浏览器下载时，会根据文件后缀名指定解码)
        aLink.download = '统计信息.csv';
        //给a链接配置href指向刚才的二进制对象
        aLink.href = URL.createObjectURL(blob);
        //触发事件
        aLink.click();
      },


      //更换表格单页显示条数
      handleDiffSizeChange(pageSize) {
        this.diffPageSize = pageSize;
        this.diffCurrentPage = 1;
        this.handleDiff();
      },
      //切换页码
      handleDiffCurrentChange(page) {
        this.diffCurrentPage = page;
        this.handleDiff();
      },
      // 差分
      async handleDiff() {
        this.diffEnsureVisible = false
        this.diffDialogVisible = true

        let res = await axios.post(nioCheckURL + '/check-man/run/statistics-diff', {
          valId: this.diffInfo.valId,
          diffValId: this.diffInfo.diffValId,
          ruleCode: this.diffSearchForm.ruleCode,
          ruleName: this.diffSearchForm.ruleName,
          impLevel: this.diffSearchForm.impLevel == "" ? null : this.diffSearchForm.impLevel,
          pageNo: this.diffCurrentPage,
          pageSize: this.diffPageSize,
        })

        if(res.data.data.result == null) {
          this.diffData = []
        } else {
          // 处理对象
          for(let item of res.data.data.result) {
            const allKeys = new Set([...Object.keys(item.errCountMap), ...Object.keys(item.diffErrCountMap)]);
            let diffWrongInfo = Array.from(allKeys).reduce((result, key) => {  
              // 检查当前key在errCountMap中是否存在  
              const errCount = item.errCountMap[key] || 0;  
              // 检查当前key在diffErrCountMap中是否存在  
              const diffErrCount = item.diffErrCountMap[key] || 0;  
        
              // 根据条件设置新对象的value  
              if (errCount !== 0 && diffErrCount !== 0) {  
                  result[key] = errCount - diffErrCount;  
              } else if (errCount !== 0) {  
                  result[key] = errCount;  
              } else if (diffErrCount !== 0) {  
                  result[key] = diffErrCount;  
              }
              return result;
            }, {});
            item.diffWrongInfo = JSON.stringify(diffWrongInfo)

            item.errCountMap = JSON.stringify(item.errCountMap)
            item.diffErrCountMap = JSON.stringify(item.diffErrCountMap)
            item.diffWrongCount = item.allCount - item.diffAllCount
            item.diffWrongRealCount = item.realCount - item.diffRealCount
            
          }
          
          this.diffData = res.data.data.result
        }

        this.diffTotal = res.data.data.total
      },

      async diffDownload() {
        let res = await axios.post(nioCheckURL + '/check-man/run/statistics-diff-download', {
          valId: this.diffInfo.valId,
          diffValId: this.diffInfo.diffValId
        })
        let aLink = document.createElement('a');
        //将实参字符串转二进制对象，如果不是文本可以通过添加第二个参数指定编码
        let blob = new Blob([res.data]);
        //指定要下载的文件名(浏览器下载时，会根据文件后缀名指定解码)
        aLink.download = '差分信息.csv';
        //给a链接配置href指向刚才的二进制对象
        aLink.href = URL.createObjectURL(blob);
        //触发事件
        aLink.click();
      },

      async handleCheck(row) {
        console.log('222:', row.valResultRepoMode)
        if(row.valResultRepoMode.includes('cos')) {
          let res = await axios.post(nioCheckURL + '/check-man/run/restore-from-cos?valId='+ `${row.valId}`)
          if(res.data.data == 'success') {
            ElMessage.success('已开始恢复！')
          }else {
            ElMessage.info('恢复失败！')
          }
        } else {
          ElMessage.info('只有cos才能恢复检查结果！')
        }
      },
    },

    mounted() {
      this.$nextTick(() => {
        this.adaptiveTableHeight();
      });
      window.addEventListener('resize', this.adaptiveTableHeight, false);
    },
  }
</script>
<style scoped>
.block{
  margin-top: 10px;
}
</style>
