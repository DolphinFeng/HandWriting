<template>
  <!-- 主表格 -->
  <div class="table">
    <!-- 表格 -->
    <div id="PowerEditionDetailPerPSContainer" class="table-container"
          v-loading="loading"
          element-loading-text="拼命加载中..."
          :element-loading-spinner="svg"
          element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-table
          :data="tableData"
          border
          :max-height="tableHeight"
      >
        <el-table-column fixed="left" align="center" prop="bizId" label="换电站ID" key="bizId" min-width="80"></el-table-column>
        <el-table-column align="center" prop="releaseVersion" label="版本号" key="releaseVersion"
                          min-width="240"></el-table-column>
        <el-table-column align="center" prop="releaseTime" label="发版时间" key="releaseTime" width="160"></el-table-column>
        <el-table-column align="center" prop="releaseStatus" label="发版状态" key="releaseStatus" width="160"></el-table-column>
        <el-table-column align="center" prop="refReleaseVersion" label="底图版本号" key="refReleaseVersion"
                          min-width="120"></el-table-column>
        <el-table-column align="center" prop="updateTime" label="更新时间" key="updateTime"
                          min-width="180"></el-table-column>
        <el-table-column align="center" prop="releaseEnv" label="环境" key="releaseEnv"
                          min-width="180"></el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->

  </div>
</template>
<script>
  import {ElMessage} from "element-plus";
  import {svg} from "@/js/loading_data.js";
  import axios from "axios";

  const nioReleaseURL = window.api.nioReleaseURL;
  export default {
    name: "PowerEditionDetailPerPS",

    props: {
      pssId: String
    },

    data() {
      return {
        loading: false,

        tableData: [],
        tableHeight: 0,
        currentPage: 1,
        pageSize: 10000,
        total: 0,
        svg: svg,
      }
    },
    setup() {
      return {

      }
    },
    methods: {

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
          url: nioReleaseURL + '/stations/' + this.pssId + '/record',
          method: 'get',
        }).then(res => {
          if (res.data.code === 200) {
            console.log(res.data.data.recordList.length);
            this.tableData = res.data.data.recordList.map(item => {
              return {
                bizId: item.bizId,
                releaseVersion: item.releaseVersion,
                releaseTime: item.releaseTime,
                refReleaseVersion: item.refReleaseVersion,
                updateTime: item.updateTime,
                releaseEnv: item.releaseEnv,
                releaseStatus: item.releaseStatus
              }
            });
          } else {
            //this.total = [];
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

      // 设置表格的最大高度
      adaptiveTableHeight() {
        this.tableHeight = document.getElementById('PowerEditionDetailPerPSContainer') === null ? 0 : document.getElementById('PowerEditionDetailPerPSContainer').offsetHeight;
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

