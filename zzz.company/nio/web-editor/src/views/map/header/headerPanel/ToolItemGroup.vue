<template>
  <div class="icon-group">
    <slot></slot>
  </div>
</template>

<script>
import TookItem from "./ToolItem.vue";
export default {
  name: "ToolItemGroup",
  components: {TookItem}
}
</script>

<style scoped>
.icon-group {
  display: flex;
  align-items: center;
}

</style>
