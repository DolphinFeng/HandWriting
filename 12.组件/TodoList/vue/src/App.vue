<template>
  <div>
    <div class="head">
      <input type="text" name="" v-model="msg">
      <button @click="submit">确定</button>
    </div>

    <div class="body">
      <ul>
        <li v-for="(item, index) in lists" :key="index">
          <span :class="{ completed: item.completed }" @click="tag(item)">{{item.text}}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

let lists = ref([])
let msg = ref('')

const submit = () => {
  if (msg.value) {
    lists.value.push({
      text: msg.value,
      completed: false
    })
    msg.value = ''
  }
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