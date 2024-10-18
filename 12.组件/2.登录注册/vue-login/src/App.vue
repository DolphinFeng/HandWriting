<template>
  <div class="wrapper">
    <div class="account">
      账号：<input type="text" v-model="account" @input="validateAccount">
      <span v-if="accountError" class="error">{{ accountError }}</span>
    </div>
    <div class="password">
      密码：<input type="password" v-model="password" @input="validatePassword">
      <span v-if="passwordError" class="error">{{ passwordError }}</span>
    </div>
    <button :disabled="isSubmitting" @click="handleSubmit">登录</button>
    <div v-if="submitMessage" class="message">{{ submitMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const account = ref<string>('');
const password = ref<string>('');
const accountError = ref<string>('');
const passwordError = ref<string>('');
const submitMessage = ref<string>('');
const isSubmitting = ref<boolean>(false);

const validateAccount = (): void => {
  const accountRegex = /^[a-zA-Z0-9]{6,11}$/;
  if (!accountRegex.test(account.value)) {
    accountError.value = '账号必须是6-11位的字母或数字，且不包含特殊字符和汉字';
  } else {
    accountError.value = '';
  }
};

const validatePassword = (): void => {
  const passwordRegex = /^(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
  if (!passwordRegex.test(password.value)) {
    passwordError.value = '密码必须是6-16位，且至少包含一个特殊字符';
  } else {
    passwordError.value = '';
  }
};

const handleSubmit = (): void => {
  validateAccount();
  validatePassword();
  if (accountError.value || passwordError.value) {
    submitMessage.value = '请修正错误后再提交';
    return;
  }
  isSubmitting.value = true;
  submitMessage.value = '提交中...';
  setTimeout(() => {
    isSubmitting.value = false;
    submitMessage.value = '登录成功';
  }, 5000);
};
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
}
.error {
  color: red;
  font-size: 12px;
}
.message {
  margin-top: 10px;
  color: green;
}
button:disabled {
  background-color: grey;
  cursor: not-allowed;
}
</style>