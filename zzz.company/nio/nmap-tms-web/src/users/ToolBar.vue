<template>
  <!-- 搜索工具栏组件 -->
  <div id="ToolBar">
    <div class="tool">
      <el-form inline :model="form" ref="form" :colon="false" @submit.prevent="onSearch">
        <el-form-item label="姓 名:" name="realName">
          <el-input v-model="form.realName" @change="changeChar(1)" placeholder="请输入姓名"
                    clearable style="width: 160px"></el-input>
        </el-form-item>
        <el-form-item label="账 号:" style="margin-left: 24px" name="userName">
          <el-input v-model="form.userName" @change="changeChar(2)" placeholder="请输入账号"
                    clearable style="width: 160px"></el-input>
        </el-form-item>
        <el-form-item label="角 色:" style="margin-left: 24px" name="roleIds">
          <el-select v-model="form.roleIds" multiple placeholder="请选择角色" clearable
                     style="width: 160px" collapse-tags>
            <el-option
                v-for="item in skillModelOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="水 平:" style="margin-left: 24px" name="level">
          <el-select v-model="form.level" placeholder="请选择用户水平" style="width: 160px" clearable>
            <el-option
                v-for="item in levelOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="技 能:" style="margin-left: 24px" name="skill_search_list">
          <el-select v-model="skill_search_list" multiple placeholder="请选择用户技能" clearable
                     style="width:420px" collapse-tags>
            <el-option
                v-for="item in skillOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="供 应 商:" name="supplier">
          <el-select v-model="form.supplier" placeholder="请选择供应商" style="width: 160px" clearable>
            <el-option
                v-for="item in supplierOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="在职状态:" name="userStatus">
          <el-select v-model="form.userStatus" placeholder="请选择在职状态" style="width: 160px" clearable>
            <el-option
                v-for="item in userStatusOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="入职时间:" name="entryTimeBegin">
          <el-date-picker
              v-model="dateValue"
              type="daterange"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 420px"
              range-separator="至"
              start-placeholder="入职区间开始"
              end-placeholder="入职区间结束">
          </el-date-picker>
        </el-form-item>
        <div style="height: 36px;display: flex;flex-flow: row nowrap; justify-content: flex-start;">
          <el-button :icon="Search" type="primary" native-type="submit" v-if="userShow.userSearchShow">查询</el-button>
          <el-button :icon="Refresh" @click="resetForm" v-if="userShow.userSearchShow">重置</el-button>
          <el-button :icon="Edit" type="primary" @click="handleMulUpdate" v-if="userShow.userMultipleShow">修改</el-button>
          <el-button :icon="FolderAdd" type="success" @click="handleAdd" v-if="userShow.userAddShow">新增</el-button>
          <div style="flex: 1"></div>
          <el-button type="primary" @click="msgVisible=true" v-if="userShow.userUploadShow">导入模板下载
          </el-button>
          <el-upload
              style="margin-left: 10px;"
              :on-success='handleSuccess'
              :on-error="handleError"
              :before-upload="uploadBefore"
              accept=".xls,.xlsx"
              :action="action"
              :file-list="fileList"
              multiple
              :headers="{
              'Authorization': this.token,
            }"
              :show-file-list="false"
              v-if="userShow.userUploadShow"
          >
            <el-button type="primary" v-if="userShow.userUploadShow">导入</el-button>
          </el-upload>
          <el-button style="margin-left: 10px;" type="primary" @click="exportFun" v-if="userShow.exportShow">导出
          </el-button>
        </div>        
      </el-form>
    </div>
    <!-- 导入模板下载提示对话框 -->
    <el-dialog
        title="导入模板下载提示"
        v-model="msgVisible"
        @close="()=>{this.msgVisible=false}"
        width="600px"
    >
      <div style="text-align: left;padding:0  40px">
        <div style="text-align: left;" v-html="msg"></div>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="msgVisible = false" variant="outline">取 消</el-button>
        <el-button @click="downloadFun" theme="primary">下 载</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {Search, Refresh, Edit, FolderAdd} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";
import axios from "axios";

const nioUrl = window.api.apiNioURL;
if (nioUrl === null || nioUrl === undefined) {
  console.log("获取nioUrl失败" + nioUrl)
}
export default {
  name: "ToolBar",
  // 接收父组件传来的参数
  props: {
    token: String,
    form: Object,
    skillModelOptions: Array,
    levelOptions: Array,
    skillOptions: Array,
    supplierOptions: Array,
    userStatusOptions: Array,
    userShow: Object,
    selectedRowKeys: Array
  },
  data() {
    return {
      // 时间选择器绑定的数据
      dateValue: '',
      skill_search_list: [],
      action: nioUrl + '/user/v1/upload',
      fileList: [],
      msgVisible: false,
      msg:
          '(1) 所有字段都为必填信息，参照第一行模板进行输入。' + '<br>' +
          '(2) 角色：根据平台角色管理页面的角色名称进行输入。' + '<br>' +
          '(3) 账号：由字母和下划线组成，不可以重复。' + '<br>' +
          '(4) 水平：1/2/3。' + '<br>' +
          '(5) 供应商：供应商1；供应商2；供应商3。' + '<br>' +
          '(6) 技能代码：Bit0(常规全要素作业)=1；Bit1(停车场作业)=2；Bit2(效果评估)=4；Bit3(质量评估)=8；Bit4(case库制作)=16；Bit5(问题调查)=32；Bit6(快修作业)=64；Bit7(算法分析)=256；多选时请将对应数值相加。',
    }
  },
  setup() {
    return {
      Search, Refresh, Edit, FolderAdd,
    }
  },
  methods: {
    changeChar(val) {
      this.$emit('changeChar', val)
    },
    // 筛选查询功能
    onSearch() {
      this.$emit('onSearch', this.dateValue, this.skill_search_list)
    },
    // 重置功能
    resetForm() {
      this.dateValue = '';
      this.skill_search_list = [];
      this.$emit('resetForm')
    },
    handleMulUpdate() {
      this.$emit('handleMulUpdate')
    },
    handleAdd() {
      this.$emit('handleAdd')
    },
    //导入成功
    handleSuccess(response, file, fileList) {
      if (response.code === 0) {
        ElMessage.success({
          message: '文件' + fileList[fileList.length - 1].name + '导入成功',
          showClose: true,
        });
        this.$emit('loadingPage')
      } else {
        ElMessage.error({
          message: '文件' + fileList[fileList.length - 1].name + '导入失败，' + response.msg,
          showClose: true,
        });
      }
    },
    //导入失败
    handleError() {
      ElMessage.error({
        message: '导入失败',
        showClose: true,
      });
    },
    //导入之前判断
    uploadBefore(file) {
      if (file.name.split('.')[1] === 'xls' || file.name.split('.')[1] === 'xlsx') {
        return true;
      } else {
        ElMessage.error({
          message: '导入文件格式错误，请导入Excel文件',
          showClose: true,
        });
        return false
      }
    },
    // 导入模板下载
    downloadFun() {
      axios({
        url: nioUrl + '/user/v1/excel/template',
        method: 'get',
        responseType: 'blob'
      }).then(res => {
        let blob = new Blob([res.data], {type: res.headers['content-type']});
        const fileName = '用户信息导入模板';
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
        ElMessage.error({
          message: '下载失败',
          showClose: true,
        });
      });
    },
    // 导出
    exportFun() {
      axios({
        url: nioUrl + '/user/v1/excel/export',
        method: 'post',
        data: {
          ids: this.selectedRowKeys,
          roleIds: this.form.roleIds,
          userName: this.form.userName,
          realName: this.form.realName,
          skillCode: this.form.skillCode,
          userStatus: this.form.userStatus,
          supplier: this.form.supplier,
          level: this.form.level,
          entryTimeBegin: this.form.entryTimeBegin,
          entryTimeEnd: this.form.entryTimeEnd
        },
        headers: {'Authorization': this.token},
        responseType: 'arraybuffer',
      }).then(res => {
        let blob = new Blob([res.data], {type: res.headers['content-type']});
        const fileName = '用户导出信息';
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
        ElMessage.error({
          message: '下载失败',
          showClose: true,
        });
      });
    },
  }
}
</script>

<style scoped>
.el-form-item {
  margin-bottom: 10px;
}
</style>
