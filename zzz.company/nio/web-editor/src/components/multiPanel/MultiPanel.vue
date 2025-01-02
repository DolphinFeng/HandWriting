<template>
  <div>
    <el-tabs type="border-card" @tab-change="tabChangeHandler">
      <slot name="panel"></slot>
    </el-tabs>
  </div>
</template>

<script setup>
const emit = defineEmits(['tabChange']);
function tabChangeHandler(name) {
  emit('tabChange', name);
}
</script>

<style scoped>
:deep(.el-color-picker__trigger) {
  border: none;
}

:deep(.el-tabs--border-card) {
  background-color: transparent !important;
  border: none;
}

:deep(.el-tabs--border-card>.el-tabs__header) {
  border: none;
}

:deep(.el-tabs__content) {
  padding: 0 !important;
}

:deep(.el-tabs--border-card>.el-tabs__header) {
  background-color: transparent;
}

:deep(.el-tabs--border-card>.el-tabs__header .el-tabs__item.is-active) {
  border-color: transparent;
  border-bottom: 2px solid #3e8cf6;
  background-color: transparent;
}
:deep(.el-tabs--border-card>.el-tabs__header .el-tabs__item) {
  height: auto;
  line-height: 1;
  margin: 0 4px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  user-select: none;
  transition: none;
}

</style>
