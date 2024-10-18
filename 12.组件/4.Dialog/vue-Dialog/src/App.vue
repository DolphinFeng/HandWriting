<template>
  <div>
    <button @click="showDialog = true">显示对话框</button>
    <div v-if="showDialog" class="dialog">
      <p>这是一个对话框</p>
      <button @click="closeDialog">关闭</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const showDialog = ref(false);

const closeDialog = () => {
  showDialog.value = false;
};
</script>

<style>
.dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border: 1px solid black;
}
</style>