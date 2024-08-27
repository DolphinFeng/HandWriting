<template>
  <div>
    <h1>title</h1>
    <p>{{ msg }}</p>
    <button @click="handleChange">change msg</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const msg = ref("hello");

function handleChange() {
  msg.value = "world";
}
</script>