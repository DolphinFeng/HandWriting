<template>
  <!-- 情报上传组件 -->
  <div class="tdesign-demo-upload" id="uploadTool">
    <div style="width: 500px" v-if="uploadShow.uploadUploadShow">
      <t-upload
        :action=action
        :tips="tips"
        v-model="files"
        accept=".csv"
        @fail="handleFail"
        @success="onSuccess"
        :beforeUpload="beforeUpload"
        :data="uploadData"
        theme="file-input"
        placeholder="未选择文件"
      ></t-upload>
    </div>
  </div>
</template>

<script>
  const nioUploadURL = window.api.nioUploadURL;
  if (nioUploadURL === null || nioUploadURL === undefined) {
    console.log("获取nioUploadURL失败" + nioUploadURL)
  }

  export default {
    name: "UploadUpload",
    // 接收父组件传来的参数
    props: {
      uploadShow: Object
    },
    data() {
      return {
        action: nioUploadURL + "/intelligence/upload",
        tips: '请上传.csv格式的文件',
        files: [],
        uploadData: {
          userId: '',
          userName: ''
        }
      };
    },
    methods: {
      // 上传失败函数
      handleFail({file}) {
        this.$message.error(`文件 ${file.name} 上传失败`);
      },
      // 上传成功函数
      onSuccess({file, fileList, response}) {
        if (response.code === '200') {
          this.$message({
            type: 'success',
            message: '文件' + file.name + '上传成功:' + response.data.description,
            showClose: true,
          });
        } else {
          this.$message({
            type: 'error',
            message: '文件' + file.name + '上传失败：' + response.errMsg,
            showClose: true,
          });
        }
        this.$nextTick(() => {
          document.querySelector(".t-upload__single-input-delete").style.display = 'none'
        })
      },
      // 上传文件前判断
      beforeUpload(file) {
        // file {name: "新建文本文档.csv", lastModified: 1635411179626, lastModifiedDate: Thu Oct 28 2021 16:52:59 GMT+0800 (中国标准时间), webkitRelativePath: "", size: 19, type: "application/vnd.ms-excel" webkitRelativePath: ""}
        if (file.type !== 'application/vnd.ms-excel') {
          this.$message.warning('上传文件格式不正确，请上传.csv格式的文件');
          return false;
        }
        return true;
      },
    },
    created() {
      this.uploadData.userId = localStorage.getItem('userId')
      this.uploadData.userName = localStorage.getItem('realName')
    }
  }
</script>

<style scoped>
  #uploadTool {
    margin: 20px 0 10px 30px;
  }
</style>
