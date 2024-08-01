<template>
  <div>
    <div class="header">
      <input type="text" v-model="msg">
      <button @click="handleUpload">提交</button>
    </div>
    <div class="footer">
      <ul>
        <li v-for="(item, index) in list" :key="index">
          <span :class="{ completed: item.completed }" @click="tag(item)">{{ item.text }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const list = ref([])

const msg = ref('')
const handleUpload = () => {
  if (msg.value) {
    list.value.push({
      text: msg.value,
      completed: false
    })
  }
  msg.value = ''
}

const tag = (item) => {
  item.completed = !item.completed
}

</script>

<style lang="css" scoped>
.completed {
  text-decoration: line-through;
  cursor: pointer;
}
</style>