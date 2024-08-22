<template>
  <div>
    <div class="head">
      <input type="text" v-model="msg">
      <button @click="submit">确定</button>
    </div>

    <div class="body">
      <ul>
        <li v-for="(item, index) in list" :key="index">
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

const list = ref<TodoItem[]>([])
let msg = ref<string>('')

const submit = () :void => {
  if (msg.value) {
    list.value.push({
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

<style scoped>
.completed {
  text-decoration: line-through;
  cursor: pointer;
}
</style>