<!--
  账户设置页面：
    可供用户修改密码
    展示用户的基本信息和详细信息
-->
<template>
  <div id="AccountSetup">
    <el-card class="baseDiv" style="margin: 20px 30px 20px 30px">
      <template #header class="title">基本信息</template>
      <div class="info">
        <div class="line">
          <span class="nameSpan">姓 名</span>
          <span class="value">{{form.realName}}</span>
        </div>
        <div class="line">
          <span class="nameSpan">账 号</span>
          <span class="value">{{form.userName}}</span>
        </div>
        <div class="line">
          <span class="nameSpan">密 码</span>
          <span class="value">******</span>
        </div>
        <div style="float: right;margin:10px 100px  10px 100px">
          <el-button type="primary" @click="handleUpdate" v-if="passwordShow">修改密码</el-button>
        </div>
      </div>
    </el-card>
    <el-card class="baseDiv" style="padding: 20px 20px 5px 20px">
      <template #header class="title">详细信息</template>
      <div class="info">
        <div class="line">
          <span class="nameSpan">水 平</span>
          <span class="value">{{form.level}}</span>
        </div>
        <div class="line">
          <span class="nameSpan">角 色</span>
          <span class="value">{{form.roleNameStr}}</span>
        </div>
        <div class="line">
          <span class="nameSpan">技 能</span>
          <span class="value">{{form.skillCodeName}}</span>
        </div>
        <div class="line">
          <span class="nameSpan">在职状态</span>
          <div style="display: inline-block;">
            <span v-if="form.userStatus === 0" class="job">在职</span>
            <span v-if="form.userStatus === 1" class="job job-leave">离职</span>
          </div>
        </div>
        <div class="line">
          <span class="nameSpan">入职时间</span>
          <span>{{form.entryTime}}</span>
        </div>
      </div>
    </el-card>
    <!-- 修改密码对话框 -->
    <el-dialog
      title="修改密码"
      v-model="updateVisible"
      @close="()=>{this.updateVisible=false}"
      width="500px">
      <div style="word-break: break-all;">
        <el-form :model="passwordForm" ref="singleForm" :rules="rules" label-position="right" label-width="100px">
          <el-form-item prop="currentPassword" label="当前密码：" name="currentPassword">
            <el-input v-model="passwordForm.currentPassword" placeholder="请输入当前密码" style="width: 300px" @change="changeChar" clearable></el-input>
          </el-form-item>
          <!--  help属性：表单项说明内容	 -->
          <el-form-item prop="newPassword" label="修改密码：" name="newPassword" help="可输入英文、数字、下划线，密码应不少于6位。" id="updateHelp">
            <el-input v-model="passwordForm.newPassword" placeholder="请输入修改密码" style="width: 300px" @change="changeChar" clearable></el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword" label="确认密码：" name="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" placeholder="请输入确认密码" style="width: 300px" @change="changeChar" clearable></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="updateVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateFun">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  // 获取config.js文件中配置的url
  import axios from "axios";
  import {ElMessage} from "element-plus";
  import { DOMAIN_MAP_TMS } from "../api/index";

  let Domain = DOMAIN_MAP_TMS[window.location.hostname];
  if (Domain === undefined) {
    Domain = 'http://nmap-tms-rbac.idc-uat.nioint.com';
  }

  export default {
    name: "AccountSetup",
    data() {
      return {
        token: '',
        firstLogin: '',
        form: {
          id: '',
          realName: '',
          userName: '',
          // 默认显示
          currentPassword: '******',
          level: '',
          roleNameStr: '',
          skillCode: '',
          skillCodeName: '',
          userStatus: '',
          userStatusName: '',
          entryTime: '',
        },
        updateVisible: false,
        passwordForm: {
          id: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        },
        // 设置表单的填写规则
        rules: {
          currentPassword: [
            {min: 6, message: '至少需要6位', trigger: 'blur'},
          ],
          newPassword: [
            {min: 6, message: '至少需要6位', trigger: 'blur'},
          ],
          confirmPassword: [
            {min: 6, message: '至少需要6位', trigger: 'blur'},
            // 自定义校验规则
          ],
        },
        passwordShow: false,
      }
    },
    methods: {
      // 输入控制
      changeChar() {
        //英文、下划线、数字
        this.passwordForm.currentPassword = this.passwordForm.currentPassword.replace(/[^\@a-zA-Z0-9_]/g, '');
        this.passwordForm.newPassword = this.passwordForm.newPassword.replace(/[^\@a-zA-Z0-9_]/g, '');
        this.passwordForm.confirmPassword = this.passwordForm.confirmPassword.replace(/[^\@a-zA-Z0-9_]/g, '');
      },
      handleUpdate() {
        // 清空数据
        this.passwordForm = {
          id: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
        this.updateVisible = true;
      },
      updateFun() {
        // 判断所有字段非空
        if (this.passwordForm.currentPassword !== '' && this.passwordForm.newPassword !== '' && this.passwordForm.confirmPassword !== '') {
          // 判断所有字段大于5
          if (this.passwordForm.currentPassword.length > 5 && this.passwordForm.newPassword.length > 5 && this.passwordForm.confirmPassword.length > 5) {
            if (this.passwordForm.newPassword === this.passwordForm.confirmPassword) {
              if (this.form.currentPassword !== this.passwordForm.newPassword) {
                // 调接口
                // 请求需要传入token
                axios({
                  url: Domain + '/user/v1/modifyPassword',
                  method: 'post',
                  data: this.passwordForm,
                  headers: {'Authorization': this.token},
                }).then(response => {
                  if (response.data.code === 0) {
                    ElMessage.success({
                      message: '修改密码成功',
                      showClose: true,
                    });
                    this.updateVisible = false;
                    // 刷新/重新加载页面信息
                    this.loadingPage()
                  } else {
                    ElMessage.error({
                      message: response.data.msg,
                      showClose: true,
                    });
                  }
                }).catch(() => {
                  ElMessage.error({
                    message: '修改密码失败',
                    showClose: true,
                  });
                });
              } else {
                ElMessage.warning({
                  message: '修改密码与原密码不能相同',
                  showClose: true,
                });
              }
            } else {
              ElMessage.warning({
                message: '修改密码和确认密码不一致',
                showClose: true,
              });
            }
          } else {
            ElMessage.warning({
              message: '有数据长度小于6位',
              showClose: true,
            });
          }
        } else {
          ElMessage.warning({
            message: '有数据为空',
            showClose: true,
          });
        }
      },
      // 获取用户自身的信息
      loadingPage() {
        axios({
          url: Domain + '/user/v1/querySelfUserInfo',
          method: 'post',
          data: {},
          headers: {'Authorization': this.token},
        }).then(response => {
          if (response.data.code === 0) {
            for (let i in response.data.data) {
              // 将对应的数据放入form中，从而显示到页面上
              for (let j in this.form) {
                if (i === j) {
                  this.form[j] = response.data.data[i]
                }
              }
            }
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '没有获取到用户自身的信息',
            showClose: true,
          });
        });
      },
      reLoad() {
        this.promission = sessionStorage.getItem('promission');
        setTimeout(() => {
          this.isShow()
        }, 5)
      },
      isShow() {
        this.passwordShow = false
        // 判断是否按钮
        if (this.promission.length !== 0) {
          if (this.promission.indexOf(27) !== -1) {
            this.passwordShow = true
          }
        }
      }
    },
    mounted() {
      /* this.$notify('warning', {
         title: '警告',
         content: '请修改密码',
         closeBtn: true
       })*/
    },
    created() {
      this.token = sessionStorage.getItem('token');
      this.firstLogin = sessionStorage.getItem('firstLogin');
      if (sessionStorage.length !== 0) {
        setTimeout(() => {
          this.loadingPage();
          this.reLoad()
          if (this.firstLogin === '1') {
            // 第一次登录，提示修改密码
            ElMessage.warning({
              message: '请修改密码',
              showClose: true,
            });
          }
        }, 5);
      }
    }
  }
</script>

<style scoped>
  #AccountSetup {
    text-align: left;
    color: black;
    height: 100%;
  }

  .baseDiv {
    width: calc(100% - 68px);
    height: auto;
    margin: 20px 30px;
    padding: 20px 20px 50px 20px;
    background-color: white;
  }

  .title {
    font-size: 16px;
  }

  .info {
    padding: 20px;
    font-size: 14px;
  }

  .line {
    padding: 10px;
  }

  .nameSpan {
    color: #8F8F8F;
    font-size: 14px;
    padding: 5px 50px 5px 0;
  }

  .value {
    margin-left: 20px;
  }

  .job{
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: flex-start;
  }
  .job::before{
    content: "";
    display: inline-block;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    margin-right: 4px;
    background: #00FF38;
  }
  .job-leave::before{
    background-color: red!important;
  }

  .form_label {
    margin: 0 0 25px 70px !important;
    font-size: 20px
  }

  /*提示字体颜色为红色*/
  #updateHelp :deep(.t-form__help) {
    color: #FF0000;
  }
</style>
