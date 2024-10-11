<template>
  <div v-bind:title="title">Hello Word</div>
  <div :title="title">Hello Word</div>
  <div :title>Hello Word</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const title = ref("Hello Word");
</script>