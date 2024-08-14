<template>
  <div>
    <p ref="refP" class="msg">消息: {{msg}}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

const msg = ref('Hello World')

const refP = ref(null)

// console.log(refP.value)
nextTick(() =>{  
  console.log(refP.value, 'nextTick')
})
</script>

<style lang="css" scoped>
.msg {
  color: red;
}
</style>
