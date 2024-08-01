<template>
  <div class="login">
    <div class="count">
      账号：<input type="text">
    </div>
    <div class="password">
      密码：<input type="password">
    </div>
  </div>
</template>

<script setup>

</script>

<style lang="less" scoped>
.login {
  position: absolute;
  left: 50%;
  top: 50%;
  border: 1px solid black;
  width: 300px;
  height: 300px;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .count, .password {
    margin-bottom: 10px;
  }
}
</style>