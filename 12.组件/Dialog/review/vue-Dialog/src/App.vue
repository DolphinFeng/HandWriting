<template>
  <div>
    <button @click="showDialog = true">展示弹窗</button>
    <div class="dialog" v-if="showDialog">
      <h1>这是个对话框</h1>
      <button @click="showDialog = false">关闭弹窗</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showDialog = ref(false)
</script>

<style lang="css" scoped>
.dialog {
  border: 1px solid black;
  position: absolute;
  left: 50%;
  right: 50%;
  transform: translate(-50%, -50%);
}
</style>