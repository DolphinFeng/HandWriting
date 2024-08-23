<template>
  <div>
    <button @click="openModal">打开弹窗</button>
    <div v-if="isVisible" class="modal">
      <div class="modal-content">
        <h3>{{ question }}</h3>
        <ul>
          <li v-for="(option, index) in options" :key="index">
            <label>
              <input type="radio" :value="option" v-model="selectedOption" />
              {{ option }}
            </label>
          </li>
        </ul>
        <button @click="submit">提交</button>
        <button @click="close">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const question = ref("你最喜欢的编程语言是什么？");
const options = ref(["JavaScript", "Python", "Java", "C++"]);
const isVisible = ref(false);
const selectedOption = ref<string | null>(null);

const openModal = (): void => {
  isVisible.value = true;
};

const submit = (): void => {
  if (selectedOption.value) {
    console.log('Selected option:', selectedOption.value);
    close();
  } else {
    alert('请选择一个选项');
  }
};

const close = (): void => {
  isVisible.value = false;
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
}

ul {
  padding: 0;
  list-style: none;
}

li {
  margin: 10px 0;
}

button {
  margin: 10px;
}
</style>
