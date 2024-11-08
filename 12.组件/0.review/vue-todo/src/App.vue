<template>
  <div>
    <div class="header">
      <input type="text" v-model="msg">
      <button @click="submit">提交</button>
    </div>
    <div class="wrapper">
      <ul>
        <li v-for="(item ,index) in lists" :key="index">
          <span :class="{completed: item.completed}" @click="tag(item)">{{item.context}}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface TodoItem {
  context: string;
  completed: boolean;
}

const lists = ref<TodoItem>([])
const msg = ref<string>('')

const submit = () :void => {
  if (msg.value) {
    lists.value.push({
      context: msg.value,
      completed: false
    })
  }
  msg.value = ''
}

const tag = (item: TodoItem) :void => {
  item.completed = !item.completed
}
</script>

<style>
.completed {
  text-decoration: line-through;
  cursor: pointer;
}
</style>