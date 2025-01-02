<template>
  <div id="div_outside">
    <!-- 登录页面背景图 -->
    <img src="../assets/login.jpg" id="img" style="position: absolute" alt=""/>
    <!-- 登录框 -->
    <div id="login_div">
      <div slot="logo" style="height: 40px; display:flex;justify-content:center;margin-top: 30px">
        <img class="nio-logo" src="../assets/nioBlue.png" alt="logo">
        <div class="login-title">
          NIO地图平台
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
            <el-input v-model="form.password" placeholder="请输入密码" type="password" show-password style="width: 200px" @keyup.enter.native="login"></el-input>
          </el-form-item>
          <el-form-item style="margin-top: 24px;">
            <el-button :loading="loading" size="default" style="width: 200px;" type="primary" @click="login">登录
            </el-button>
          </el-form-item>
        </el-form>
        <!--        <t-checkbox v-model="isRemember" @change="remember" style="margin-right: 30px">记住我</t-checkbox>-->
      </div>
    </div>
  </div>
</template>

<script>
import {inject, onMounted, reactive, ref} from "vue";
import axios from "axios";
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {useStore} from "vuex";

const nioUrl = window.api.apiNioURL;
if (nioUrl === null || nioUrl === undefined) {
  console.log("获取nioUrl失败" + nioUrl)
}

//登录祝语
function formatDate() {
  let hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  else if (hour < 9) return '早上好';
  else if (hour < 12) return '上午好';
  else if (hour < 14) return '中午好';
  else if (hour < 17) return '下午好';
  else if (hour < 19) return '傍晚好';
  else if (hour < 22) return '晚上好';
  else return '夜里好';
}

export default {
  name: "login",
  // 接收父组件传来的参数
  props: {
    routerPush: Function,
    reLoad: Function
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    const isRemember = ref(false);
    const form = reactive({
      username: '',
      password: ''
    });
    const divRatio = ref(0);
    const imgDiv = ref(0);
    const first_loading = ref(false);
    const loading = ref(false);

    function remember() {
      // 使用缓存机制完成‘记住我’这个功能
      console.log(isRemember);
    }

    // 输入控制
    function changeChar() {
      //英文、下划线、数字
      form.username = form.username.replace(/[^\w_]/g, '');
    }

    // 重置功能
    function resetForm() {
      Object.assign(form, {
        username: '',
        password: ''
      });
    }

    const reLoad = inject('reLoad');

    async function getPromission(val, firstLogin) {
      try {
        const response = await axios({
          url: nioUrl + '/permi/v1/queryUserPerm',
          method: 'post',
          data: {},
          headers: {'Authorization': val},
        });

        if (response.data.code === 0) {
          let promissionList = [];
          for (let i = 0; i < response.data.data.length; i++) {
            promissionList.push(response.data.data[i].id);
          }
          localStorage.setItem('promission', promissionList);
          ElMessage.success({
            message: `${formatDate()},欢迎回来！`,
            duration: 5000,
          });

          reLoad();

        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
        }
      } catch (error) {
        ElMessage.error({
          message: '',
          showClose: true,
        });
      }
    }

    // 登录功能
    function login() {
      if (form.username !== '' && form.password !== '') {
        loading.value = true;
        axios({
          url: nioUrl + '/user/v1/login',
          method: 'post',
          data: form,
        }).then(response => {
          if (response.data.code === 0) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('realName', response.data.data.currentAccountName);
            localStorage.setItem('firstLogin', response.data.data.firstLogin);
            localStorage.setItem('userId', response.data.data.currentAccountId);
            // 获取登录用户的所有权限
            getPromission(response.data.data.token, response.data.data.firstLogin).then(() => {
              const redirectUrl = store.state.attemptedUrl || '/TaskPage';
              console.log('Redirecting to:', redirectUrl); // 调试信息
              router.replace(redirectUrl);
            });

          } else {
            localStorage.setItem('promission', '');
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          localStorage.setItem('promission', '');
          ElMessage.error({
            message: '登录失败',
            showClose: false,
          });
        }).finally(() => {
          loading.value = false;
        });
      } else {
        ElMessage.warning({
          message: '请确认账号密码不为空',
          showClose: false,
        });
      }
    }

    function setWidth() {
      // 图片比例
      let imgRatio = 2880 / 1792;
      // div_outside比例
      divRatio.value = document.getElementById('div_outside') !== null ? document.getElementById('div_outside').offsetWidth / document.getElementById('div_outside').offsetHeight : 0
      imgDiv.value = document.getElementById('img')
      //盒子比例大：宽度更宽，img设置盒子宽度
      if (imgDiv.value !== null) {
        if (divRatio.value > imgRatio) {
          imgDiv.value.style.width = '100%'
        } else {
          imgDiv.value.style.height = '100%'
        }
      }
    }

    onMounted(() => {
      if (first_loading.value === false) {
        setWidth();
      }
      window.addEventListener('resize', setWidth, false)
    });

    return {
      form, loading,
      login, resetForm, changeChar,
    }
  },
}
</script>

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
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  overflow: hidden;
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
