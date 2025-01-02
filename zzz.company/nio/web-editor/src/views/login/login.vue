<template>
  <div id="div_outside">
    <!-- 登录页面背景图 -->
    <img src="/img/login.jpg" id="img" style="width: 100%;height: 100%;object-fit: cover" alt=""/>
    <!-- 登录框 -->
    <div id="login_div">
      <div slot="logo" style="height: 40px; display:flex;justify-content:center;margin-top: 30px">
        <img class="nio-logo" src="/img/nioBlue.png" alt="logo">
        <div class="login-title">
          NIO ODD平台
        </div>
      </div>
      <div id="login_form">
        <el-form :model="form">
          <el-form-item prop="username" name="userName" style="margin-top: 28px;">
            <el-icon class="login-icon" size="30px">
              <User/>
            </el-icon>
            <el-input v-model="form.username" @change="changeChar" placeholder="请输入账号" clearable style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item prop="password" name="password" style="margin-top: 24px;">
            <el-icon class="login-icon" size="30px">
              <Lock/>
            </el-icon>
            <el-input v-model="form.password" placeholder="请输入密码" type="password" show-password style="width: 200px" @keyup.enter.native="loginHandler"></el-input>
          </el-form-item>
          <el-form-item style="margin-top: 24px;">
            <el-button :loading="loading" size="default" style="width: 200px;" type="primary" @click="loginHandler">登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {reactive, ref} from "vue";
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {NioMessage} from "../../utils/utils.js";
import {formatDate} from "../../utils/compute.js";
import {useStore} from "vuex";
import axios from "axios";

const router = useRouter();
const loading = ref(false);
const store = useStore();
const apiNioURL = window.api.apiNioURL;

//暂时本地存储的过渡方案
const userMap = {
  'user': 'user',
  'hongjin.zhang': 'hongjin.zhang',
  'yunlong.wang2': 'yunlong.wang2',
  'tiantian.dong': 'tiantian.dong',
  'lujun.wang': 'lujun.wang',
  'xiaoxiao.liang': 'xiaoxiao.liang',
  'qingran.ren': 'qingran.ren',
  'tianxiang.lei': 'tianxiang123',
  'yunguo.qin': 'yunguo.qin',
  'ning.liu': 'ning.liu',
  'xiaowen.xiao': 'xiaowen.xiao',
  'yi.chen': 'yi.chen',
  'yangjing': '123456',
};

const form = reactive({
  username: '',
  password: '',
});

function loginHandler() {
  axios.post(apiNioURL + '/user/v1/login', {
    username: form.username,
    password: form.password,
    source: 'odd',
  }).then(res => {
    if (res.data.code === 0) {
      let data = res.data.data, token = data.token, realName = data['currentAccountName'];
      localStorage.setItem('token', token);
      localStorage.setItem('realName', realName);

      store.state.userInfo.realName = realName;
      router.replace({
        path: '/home',
      });
      NioMessage('success', `${formatDate()},欢迎回来！`, 5000);
    } else {
      throw new Error("错误:" + res.data.msg);
    }
  }).catch(err => {
    NioMessage('error', '登录失败：' + err.message);
  });
}

// 登录功能
function login() {
  // login();
  // return;
  if (userMap[form.username] === form.password) {
    localStorage.setItem('token', 'tokenE');
    localStorage.setItem('realName', form.username);
    store.state.userInfo.realName = form.username;

    router.replace({
      path: '/home',
    });
    NioMessage('success', `${formatDate()},欢迎回来！`, 5000);
  } else {
    NioMessage('error', '账号或密码错误', 1000);
  }
}
// 输入控制
function changeChar() {
  //英文、下划线、数字
  form.username = form.username.replace(/[^\w_.]/g, '');
}
</script>

<style>
#login_form .el-input__inner {
  color: var(--el-text-color-primary)!important;
}
</style>
<style scoped>
:deep(.el-form-item__content) {
  justify-content: center;
}

:deep(.el-input__wrapper) {
  background-color: #e8f0fe!important;
}

.nio-logo {
  height: 31px;
  width: 33px;
  display: inline-block;
  margin-top: 7px;
}

.login-title {
  display: inline-block;
  font-size: 22px;
  font-weight: bold;
  color:#0052D9;
  cursor: default;
  margin: 12px 0 2px 8px;
}

.login-icon {
  color: #606266;
  font-size: 30px;
  vertical-align: middle;
  margin-right: 4px;
}

#div_outside {
  position: relative;
  width: 100vw;
  height: 100vh;
}

#login_div {
  width: 320px;
  height: 320px;
  /*border: 2px solid #ededed;*/
  background-color: rgba(255, 255, 255, 0.56);
  border-radius: 8px;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  margin: auto;
}

#login_form {
  height: 180px;
}

.el-button--primary {
  background: #0052d9 !important;
  border-color: #0052d9 !important;
}

.el-button--primary:hover {
  background: #266fe8 !important;
  border-color: #266fe8 !important;
  color: #FFF !important;
  opacity: 0.8;
}
</style>
