<template>
  <p>{{ msg }}</p>
  <button @click="msg = 'Hello Vue3'">change msg</button>
</template>

<script setup lang="ts">
import { ref } from "vue";

const msg = ref("Hello World");

console.log(msg.value);
</script>