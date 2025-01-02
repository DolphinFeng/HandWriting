<template>
  <!-- 主表格信息组件 -->
  <div id="UploadTable" :style="tableContainerHeight">
    <div id="uploadTableContainer">
      <t-table
        :columns="upload_data"
        :data="tableData"
        :height="table_height"
        rowKey="id"
        :hover="true"
        :bordered="true"
        :stripe="false">
        <template #op="scope">
          <t-button theme="primary" size="small" @click="handleDownload(scope.row)"
                    v-if="uploadShow.uploadDownloadShow">下载
          </t-button>
        </template>
      </t-table>
    </div>
    <!-- 分页组件 -->
    <div style="padding-top: 10px" class="tPaginationContainer">
      <t-pagination
        :total="total"
        :page-size.sync="pageSize"
        v-model="currentPage"
        :pageSizeOption=[5,10,20,50]
        @change="handleCurrentChange"
        @pageSizeChange="handleSizeChange"
        show-jumper
      />
    </div>
  </div>
</template>

<script>
  const nioUploadURL = window.api.nioUploadURL;
  if (nioUploadURL === null || nioUploadURL === undefined) {
    console.log("获取nioUploadURL失败" + nioUploadURL)
  }
  // 引入js数据
  import {upload_data} from "../js/information_data";

  export default {
    name: "UploadTable",
    // 接收父组件传来的参数
    props: {
      uploadShow: Object
    },
    data() {
      return {
        upload_data: upload_data,
        // 表格数据
        tableData: [],
        tableContainerHeight: {
          height: '100%'
        },
        table_height: 0,
        // 表格当前页码
        currentPage: 1,
        // 每次表格展示多少条信息
        pageSize: 20,
        // 表格总条数
        total: 0,
      }
    },
    methods: {
      // 下载
      handleDownload(row) {
        this.$axios({
          url: nioUploadURL + '/intelligence/download?intelligenceId=' + row.id,
          method: 'get',
          responseType: 'arraybuffer',
        }).then(res => {
          let blob = new Blob([res.data], {type: res.headers['content-type']});
          const fileName = row.fileName;
          let downloadElement = document.createElement('a');
          let href = window.URL.createObjectURL(blob); //创建下载的链接
          downloadElement.href = href;
          downloadElement.download = fileName; //下载后文件名
          document.body.appendChild(downloadElement);
          downloadElement.click(); //点击下载
          document.body.removeChild(downloadElement); //下载完成移除元素
          window.URL.revokeObjectURL(href); //释放blob
          this.msgVisible = false
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '下载' + row.id + '文件失败',
            showClose: true,
          });
        });
      },
      // 表格size改变时触发函数
      handleSizeChange(page_size) {
        this.pageSize = page_size;
        this.loadingPage()
      },
      // 表格当前页码改变时触发函数
      handleCurrentChange(page) {
        this.currentPage = page.current;
        this.loadingPage()
      },
      // 获取表格信息功能
      loadingPage() {
        this.$axios({
          url: nioUploadURL + '/intelligence/my_intelligences?page=' + this.currentPage + '&row=' + this.pageSize,
          method: 'get'
        }).then(response => {
          if (response.data.code === '200') {
            this.total = response.data.data.totalRecord;
            if (this.total === 0) {
              this.$message({
                type: 'warning',
                message: '没有符合查询条件的数据',
                showClose: true,
              });
            }
            this.tableData = response.data.data.data;
            // 整理表格字段
            for (let i in this.tableData) {
              if (this.tableData.hasOwnProperty(i)) {
                this.tableData[i].createTime = this.tableData[i].createdAt.slice(0, 19).replace(/T/, " ")
              }
            }
          } else {
            this.$message({
              type: 'error',
              message: response.data.errMsg,
              showClose: true,
            });
          }
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '没有获取到数据',
            showClose: true,
          });
        });
      },
      // 设置表格的最大高度
      adaptiveTableHeight() {
        this.table_height = document.getElementById('uploadTableContainer') === null ? 0 : document.getElementById('uploadTableContainer').offsetHeight - 40
      },
    },
    mounted() {
      if (document.getElementById('uploadTool').offsetHeight !== 0) {
        this.tableContainerHeight.height = `calc(100% - ${document.getElementById('uploadTool').offsetHeight - 15}px)`
      } else {
        this.tableContainerHeight.height = `calc(100% - 45px)`
      }
      this.$nextTick(() => {
        this.adaptiveTableHeight()
      })
      // 页面加载时调用函数
      this.loadingPage()
      window.addEventListener('resize', this.adaptiveTableHeight, false)
    }
  }
</script>

<style scoped>
  #UploadTable {
    position: relative;
    margin: 0 20px 10px 20px;
    text-align: left;
  }

  #uploadTableContainer {
    position: absolute;
    top: 0;
    bottom: 107px;
    width: 100%;
    height: calc(100% - 107px);
  }

  #uploadTableContainer :deep(.t-table-pagination) {
    display: none;
  }

  .tPaginationContainer {
    position: absolute;
    width: 100%;
    bottom: 60px;
    padding-top: 10px;
    height: 42px;
  }

</style>
