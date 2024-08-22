<template>
  <div>
    <input v-for="item in msgList" :key="item.id" v-model="item.value" />
    <p>标题是：{{ title }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const msgList = ref([
  {
    id: 1,
    value: "",
  },
  {
    id: 2,
    value: "",
  },
  {
    id: 3,
    value: "",
  },
]);
const title = ref("hello word");
</script>