<template>
  <!-- 情报管理：情报查看页面 -->
  <div id="InfoCheckPage">
    <!-- 搜索工具栏组件 -->
    <CheckTool
      :upload_search="upload_search"
      :lineCodeOptions="lineCodeOptions"
      :statusOptions="statusOptions"
      :infoShow="infoShow"
      @changeNum="changeNum"
      @onSearch="onSearch"
      @resetForm="resetForm"
      @clearOrders="clearOrders"
    ></CheckTool>
    <!-- 主表格信息组件 -->
    <CheckTable
      :tableData="tableData"
      :total="total"
      :infoShow="infoShow"
      @sortChange="sortChange"
      @restartFun="restartFun"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"
    ></CheckTable>
  </div>
</template>

<script>
  // 引入需要的组件
  import CheckTool from "./CheckTool";
  import CheckTable from "./CheckTable";
  // 引入js数据
  import {upload_search, statusOptions, infoShow} from "../js/information_data";
  import axios from "axios";
  import { ElMessage } from "element-plus";

  const nioUrl = window.api.apiNioURL;
  if (nioUrl === null || nioUrl === undefined) {
    console.log("获取nioUrl失败" + nioUrl)
  }

  const nioUploadURL = window.api.nioUploadURL;
  if (nioUploadURL === null || nioUploadURL === undefined) {
    console.log("获取nioUploadURL失败" + nioUploadURL)
  }

  const nioTaskURL = window.api.nioTaskURL;
  if (nioTaskURL === null || nioTaskURL === undefined) {
    console.log("获取nioTaskURL失败" + nioTaskURL)
  }

  export default {
    name: "InfoCheckPage",
    // 接收父组件传来的参数
    props: {
      routerPush: Function,
      reLoad: Function
    },
    // 组件注册
    components: {
      CheckTool,
      CheckTable,
    },
    data() {
      return {
        token: '',
        upload_search: {
          ...upload_search
        },
        infoShow: {
          ...infoShow
        },
        lineCodeOptions: [],
        statusOptions: statusOptions,
        ordersList: [],
        orderBy: null,
        // 表格数据
        tableData: [],
        // 表格当前页码
        currentPage: 1,
        // 每次表格展示多少条信息
        pageSize: 20,
        // 表格总条数
        total: 0,
      }
    },
    methods: {
      // 数字检查函数
      changeNum(val) {
        switch (val) {
          case 1:
            //中文、英文、数字
            this.upload_search.userName = this.upload_search.userName.replace(/[^\a-zA-Z0-9\u4E00-\u9FA5]/g, '');
            break;
          case 2:
            // 数字
            this.upload_search.intelligenceId = this.upload_search.intelligenceId.replace(/[^\d]/g, '');
            break;
          case 3:
            this.upload_search.intelligenceTaskId = this.upload_search.intelligenceTaskId.replace(/[^\d]/g, '');
            break;
          case 4:
            this.upload_search.province = this.upload_search.province.replace(/[^\a-zA-Z0-9\u4E00-\u9FA5]/g, '');
            break;
          case 5:
            this.upload_search.city = this.upload_search.city.replace(/[^\a-zA-Z0-9\u4E00-\u9FA5]/g, '');
        }
      },
      // 筛选查询功能
      onSearch() {
        this.currentPage = 1
        this.loadingPage()
      },
      // 重置功能
      resetForm() {
        this.upload_search = {
          ...upload_search
        }
      },
      // 清空排序
      clearOrders() {
        // 排序列表清空
        this.ordersList = []
        this.orderBy = null
        // 还原排序原来的样式
        let theadList = document.getElementById('c_column').children[1].children[0].children[1].children[0].children
        for (let j in theadList) {
          if (j === "4" || j === "8") {
            let upDiv = theadList[j].children[0].children[0].children[0]
            let downDiv = theadList[j].children[0].children[0].children[1]
            downDiv.style.borderTopColor = '#C0C4CC'
            upDiv.style.borderBottomColor = '#C0C4CC'
          }
        }
      },
      // 表格排序方法
      sortChange({column, prop, order}) {
        // 获取表格中的thead
        let theadList = document.getElementById('c_column').children[1].children[0].children[1].children[0].children
        this.orderBy = ''
        // 整理正确的ordersList
        if (this.ordersList.length === 0) {
          this.ordersList.push({
            'value': prop,
            'order': order,
            'label': column.label
          })
        } else {
          let isAdd = false
          for (let i in this.ordersList) {
            if (this.ordersList[i].value === prop) {
              this.ordersList[i].order = order
              isAdd = true
              break
            }
          }
          if (isAdd === false) {
            this.ordersList.push({
              'value': prop,
              'order': order,
              'label': column.label
            })
          }
        }
        // 设置样式
        for (let i in this.ordersList) {
          for (let j in theadList) {
            if (j === "4" || j === "8") {
              if (this.ordersList[i].label === theadList[j].children[0].innerText) {
                let upDiv = theadList[j].children[0].children[0].children[0]
                let downDiv = theadList[j].children[0].children[0].children[1]
                if (this.ordersList[i].order === 'ascending') {
                  // 上箭头
                  upDiv.style.borderBottomColor = '#409EFF'
                  downDiv.style.borderTopColor = '#C0C4CC'
                } else if (this.ordersList[i].order === 'descending') {
                  // 下箭头
                  downDiv.style.borderTopColor = '#409EFF'
                  upDiv.style.borderBottomColor = '#C0C4CC'
                }
              }
            }
          }
          if (this.ordersList[i].order === "descending") {
            this.orderBy = this.orderBy + this.ordersList[i].value + ' desc,'
          } else {
            this.orderBy = this.orderBy + this.ordersList[i].value + ','
          }
        }
        this.orderBy = this.orderBy.slice(0, -1)
        this.loadingPage()
      },
      // 重启情报任务
      restartFun(row) {
        axios({
          url: nioUploadURL + '/intelligence/restart_intelligence_task?intelligence_inf_id=' + row.intelligenceInfId,
          method: 'post',
        }).then(response => {
          if (response.data.code === '200') {
            ElMessage.success({
              message: '启动成功',
              showClose: true,
            });
            this.loadingPage()
          } else {
            ElMessage.error({
              message: response.data.errMsg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '启动失败',
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
        this.pageSize = page.pageSize;
        this.loadingPage()
      },
      // 获取表格信息功能
      loadingPage() {
        for (let i in this.upload_search) {
          if (this.upload_search[i] === '') {
            this.upload_search[i] = null
          }
        }
        axios({
          url: nioUploadURL + '/intelligence/intelligence_task',
          method: 'get',
          params: {
            ...this.upload_search,
            page: this.currentPage,
            row: this.pageSize,
            orderByClause: this.orderBy
          },
        }).then(response => {
          if (response.data.code === '200') {
            this.total = response.data.data.totalRecord;
            if (this.total === 0) {
              ElMessage.warning({
                message: '没有符合查询条件的数据',
                showClose: true,
              });
            }
            this.tableData = response.data.data.data;
            // 整理表格字段
            for (let i in this.tableData) {
              if (this.tableData.hasOwnProperty(i)) {
                if (this.tableData[i].intelligenceInfEntity !== null) {
                  this.tableData[i].fileName = this.tableData[i].intelligenceInfEntity.fileName
                  this.tableData[i].info_id = this.tableData[i].intelligenceInfEntity.intelligenceId
                  this.tableData[i].inf_created_at = this.tableData[i].intelligenceInfEntity.createdAt.slice(0, 19).replace(/T/, " ")
                  this.tableData[i].user_name = this.tableData[i].intelligenceInfEntity.userName
                  this.tableData[i].product_line_name = this.tableData[i].intelligenceInfEntity.productLineName
                  this.tableData[i].province = this.tableData[i].intelligenceInfEntity.province
                  this.tableData[i].city = this.tableData[i].intelligenceInfEntity.city
                  this.tableData[i].description = this.tableData[i].intelligenceInfEntity.description
                  this.tableData[i].geo = this.tableData[i].intelligenceInfEntity.geo
                }
                // 整理表格数据中的序号
                this.tableData[i].num = parseInt(i) + 1
                this.tableData[i].created_at = this.tableData[i].createdAt.slice(0, 19).replace(/T/, " ")
                if (this.tableData[i].status === 1) {
                  this.tableData[i].status_name = '开启任务'
                } else if (this.tableData[i].status === 2) {
                  this.tableData[i].status_name = '任务成功'
                } else if (this.tableData[i].status === 3) {
                  this.tableData[i].status_name = '任务失败'
                }
              }
            }
          } else {
            ElMessage.error({
              message: response.data.errMsg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '没有获取到数据',
            showClose: true,
          });
        });
      },
      reShow() {
        this.promission = localStorage.getItem('promission');
        setTimeout(() => {
          this.isShow()
        }, 5)
      },
      isShow() {
        this.infoShow = {
          ...infoShow
        }
        // 判断是否显示按钮
        if (this.promission && this.promission.length !== 0) {
          if (this.promission.indexOf(70) !== -1) {
            this.infoShow.infoSearchShow = true
          }
          if (this.promission.indexOf(71) !== -1) {
            this.infoShow.infoResetShow = true
          }
        }
      },
      // 获取所需select选项的数据源
      getData() {
        // 获取流程名称
        axios({
          url: nioTaskURL + '/task-type/list',
          method: 'get',
        }).then(response => {
          if (response.data.code === 200) {
            this.lineCodeOptions = response.data.data
          }
        }).catch(() => {
          ElMessage.error({
            message: '获取流程名称数据集失败',
            showClose: true,
          });
        });
      },
    },
    mounted() {
      this.token = localStorage.getItem('token'); // 从 localStorage 获取 token
      if (this.token && this.token.length !== 0) {
        this.reLoad();
        this.loadingPage();
        this.getData();
        this.reShow();
      } else {
        console.error('Token is missing or invalid');
        // 可以选择重定向到登录页面或显示错误信息
      }
    }
  }
</script>

<style scoped>
  #InfoCheckPage {
    position: absolute;
    top: 68px;
    text-align: left;
    /*z-index: 10;*/
    background-color: white;
    color: black;
    width: calc(100% - 234px);
    height: calc(100% - 68px);
  }

</style>
