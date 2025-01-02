<template>
  <!-- 产品详情 -->
  <div id="DocumentDetail" class="component" style="flex: 1;overflow: hidden;">
    <div id="docStyle" class="tool">
      <el-form inline :model="docForm" ref="form" @submit.prevent="loadDocDetail">
        <el-form-item label="文件名：" name="fileName">
          <el-input v-model="docForm.partitionName" placeholder="请输入文件名称" style="width: 200px" clearable></el-input>
        </el-form-item>
        <!-- <el-form-item label="分支名称：" name="branchName">
          <el-input v-model="docForm.branchName" placeholder="请输入分支名称" style="width: 200px" clearable></el-input>
        </el-form-item> -->
        <div class="search-ctrl">
          <el-button :icon="Search" type="primary" native-type="submit" class="button_style" :loading="loading">查询</el-button>
          <el-button :icon="Refresh" @click="reSet" class="button_style">重置</el-button>
          <el-button :icon="RefreshLeft" theme="primary" @click="handelCancel" class="button_style">取消</el-button>
        </div>
      </el-form>
    </div>
    <div id="DetailTableContainer" class="table">
      <div class="table-container">
        <el-table
          :data="listDoc"
          :max-height="tableHeight"
          border>
          <el-table-column prop="partitionName" key="partitionName" label="文件名" min-width="120" align="center"></el-table-column>
          <el-table-column prop="branchName" key="branchName" label="分支id" min-width="180" align="center"></el-table-column>
          <el-table-column prop="layerIdentity" key="layerIdentity" label="母分支" min-width="140" align="center"></el-table-column>
          <el-table-column key="productIdentity" label="产品库" min-width="150" align="center">
            <template #default="scope">
              {{ productIdentity }}
            </template>
          </el-table-column>
          <el-table-column prop="createTimeStr" key="createTimeStr" label="创建时间" min-width="200" align="center"></el-table-column>
          <el-table-column prop="dataVersion" key="dataVersion" label="dataVersion" min-width="140" align="center"></el-table-column>
          <el-table-column prop="size" key="size" label="文件大小" min-width="140" align="center"></el-table-column>
          <el-table-column prop="partitionFormat" key="dataType" label="格式" min-width="140" align="center"></el-table-column>
          <el-table-column prop="md5" key="md5" label="md5" min-width="200" align="center"></el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            align="center"
            width="90">
            <template #default="scope">
              <el-button @click="handleDownload(scope.row.url)" link type="primary" size="small">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div style="padding-top: 10px" class="pagination-container" v-show="paginationShow">
        <el-pagination
          background
          :total="total"
          :page-size.sync="pageSize"
          v-model="currentPage"
          :page-sizes="[5,10,20,50]"
          @current-change="handleCurrentDetail"
          @size-change="handleSizeDetail"
          layout="total, sizes, prev, pager, next, jumper"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from "axios";
  import {ElMessage} from "element-plus";
  import {Refresh, RefreshLeft, Search} from "@element-plus/icons-vue";
  import { dateToString } from "@/utils";
  
  const nioDataURL = window.api.nioDataURL;

  export default {
    name: "DocumentDetail",
    // 接收父组件传来的参数
    props: {
      productIdentity: String,
      partitionName: String
    },
    watch: {
      partitionName(newVal, ) {
        this.docForm.partitionName = newVal
      }
    },
    data() {
      return {
        docForm: {
          partitionName: this.partitionName,
          branchName: ''
        },
        loading: false,
        listDoc: [],
        total: 0,
        pageSize: 20,
        currentPage: 1,
        offset: 0,
        paginationShow: true,
        tableHeight: 0
      }
    },
    setup() {
      return {
        Refresh, RefreshLeft, Search,
      }
    },
    methods: {
      //返回产品页
      handelCancel() {
        this.$parent.ProductShow("detail");
      },
      // 获取表格信息
      loadDocDetail() {
        this.loading = true;
        let data = new FormData();
        data.append("productIdentity", this.productIdentity);
        data.append("partitionName", this.docForm.partitionName);
        data.append("limit", this.pageSize);
        data.append("offset", this.offset);
        axios({
          url: nioDataURL + '/data/search-partition',
          method: 'post',
          data: data
        }).then(response => {
          this.loading = false;
          if (response.data.code === 200) {
            this.total = response.data.data.totalCount;
            if (this.total === 0) {
              ElMessage.warning({
                message: '没有符合查询条件的数据',
                showClose: true,
              });
            }
            // this.listDoc = response.data.data.partitions;
            this.listDoc = response.data.data.partitions.map((item) => {
              item.createTimeStr = item.commitTime ? dateToString(item.commitTime) : '';
              return item;
            });
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          this.loading = false;
          ElMessage.error({
            message: '没有获取到数据',
            showClose: true,
          });
        })
      },
      countPageSize() {

      },
      // 分页组件
      handleSizeDetail(page_size) {
        this.pageSize = page_size;
        this.loadDocDetail()
      },
      handleCurrentDetail(page) {
        this.currentPage = page;
        this.offset = (page - 1) * this.pageSize;
        this.loadDocDetail()
      },
      reSet() {
        this.docForm = {
          partitionName: this.partitionName,
          branchName: ''
        };
      },
      handleDownload(url) {
        window.open(url);
      },
      adaptiveTableHeight() {
        this.tableHeight = document.getElementById('DetailTableContainer') === null ? 0 : (document.getElementById('DetailTableContainer').offsetHeight - 42);
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.adaptiveTableHeight();
      });
      window.addEventListener('resize', this.adaptiveTableHeight);
    },
    unmounted() {
      window.removeEventListener('resize', this.adaptiveTableHeight);
    },
    created() {
      this.loadDocDetail();
    }
  }
</script>

<style scoped>
  #formId :deep(.t-form__label) {
    padding-right: 4px !important;
    width: 100px !important;
  }
  .el-form-item{
    margin-bottom: 0;
  }
  .search-ctrl{
    margin-top: 20px;
  }
</style>
