<template>
  <!-- 情报管理：情报上传页面 -->
  <div id="InfoUploadPage">
    <!-- 情报上传组件 -->
    <UploadUpload
      :uploadShow="uploadShow"
    ></UploadUpload>
    <!-- 主表格信息组件 -->
    <UploadTable
      :uploadShow="uploadShow"
    ></UploadTable>
  </div>
</template>

<script>
  // 引入需要的组件
  import UploadUpload from "./UploadUpload";
  import UploadTable from "./UploadTable";
  // 引入js数据
  import {uploadShow} from "../js/information_data";
  import axios from "axios";
  import { ElMessage } from "element-plus";

  const nioUrl = window.api.apiNioURL;
  if (nioUrl === null || nioUrl === undefined) {
    console.log("获取nioUrl失败" + nioUrl)
  }

  export default {
    name: "InfoUploadPage",
    // 接收父组件传来的参数
    props: {
      routerPush: Function,
      reLoad: Function
    },
    // 组件注册
    components: {
      UploadUpload,
      UploadTable,
    },
    data() {
      return {
        token: '',
        uploadShow: {
          ...uploadShow
        },
      }
    },
    methods: {
      reShow() {
        this.promission = localStorage.getItem('promission');
        setTimeout(() => {
          this.isShow()
        }, 5)
      },
      isShow() {
        this.uploadShow = {
          ...uploadShow
        }
        // 判断是否显示按钮
        if (this.promission && this.promission.length !== 0) {
          if (this.promission.indexOf(67) !== -1) {
            this.uploadShow.uploadUploadShow = true
          }
          if (this.promission.indexOf(68) !== -1) {
            this.uploadShow.uploadDownloadShow = true
          }
        }
      },
      loadingPage() {
        // ...
      },
      reLoad() {
        this.loadingPage();
        this.reShow();
      }
    },
    mounted() {
      this.token = localStorage.getItem('token');
      if (this.token && this.token.length !== 0) {
        this.reLoad();
      } else {
        console.error('Token is missing or invalid');
        // 可以选择重定向到登录页面或显示错误信息
      }
    }
  }
</script>

<style scoped>
  #InfoUploadPage {
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
