<template>
  <div class="avatar-wrapper">
    <el-popover
      effect="dark"
      :show-arrow="false"
      trigger="click"
      :hide-after="0"
      :show-after="0"
      :width="90"
      popper-class="avatar-popper">
      <template #reference>
        <div class="user-popper">
          <el-avatar
            shape="circle"
            style="background-color: #fb3a83"
            icon="User"
            class="avatar"
            @click="setAvatarPanel"
            @blur="setAvatarPanel">
          </el-avatar>
          <div class="userName">
            {{ store.state.userInfo.realName }}
          </div>
        </div>
      </template>
      <div class="avatar-panel">
        <div class="avatar-item" @click="outLoginHandler">退出登录</div>
        <!--        <div class="divider"></div>-->
        <!--        <div class="avatar-item" @click="setBatchList(true)">批次列表</div>-->
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();
const avatarPanel = ref(false);
const setAvatarPanel = function () {
  avatarPanel.value = !avatarPanel.value;
};
//退出登录
const outLoginHandler = function () {
  //if (opHistory.list.length > 0) {
  //  ElMessageBox.confirm('将丢失当前未保存数据', '即将退出', {
  //    confirmButtonText: '确定',
  //    cancelButtonText: '取消',
  //    type: 'warning',
  //    showClose: false,
  //    customStyle: {
  //      zIndex: 99999999,
  //    }
  //  }).then(res => {
  //    outLogin();
  //  }).catch(() => {
  //  });
  //} else {
  //  outLogin();
  //}

  outLogin();
};
const outLogin = function () {
  localStorage.removeItem('token');
  localStorage.removeItem('realName');
  router.replace({ path: '/login' });
};
</script>

<style>
.avatar-popper {
  padding: 0 !important;
  border: 0 !important;
  background-color: transparent !important;
  box-shadow: none !important;
}
</style>
<style scoped>
.user-popper {
  display: flex;
  align-items: center;
  margin: 0 8px 0 10px;
  cursor: pointer;
}

.avatar {
  width: 24px;
  height: 24px;
}

.userName {
  font-size: 14px;
  margin-left: 6px;
}

.avatar-wrapper {
  position: relative;
  color: #fff;
}

.avatar-panel {
  width: 90px;
  padding: 0 6px;
  border: 1px solid #565759;
  border-radius: 3px;
  background-color: #3f4045;
  color: #fff;
  margin-left: 60px;
  text-align: center;
  font-size: 13px;
  box-shadow: var(--el-box-shadow-dark);
  user-select: none;
}

.avatar-item {
  padding: 5px 0;
  cursor: pointer;
}

.avatar-item:hover {
  color: #409eff;
}

.divider {
  height: 1px;
  margin: 2px 0;
  background-color: #535455;
}
</style>
