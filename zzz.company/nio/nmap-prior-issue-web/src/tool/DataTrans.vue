<template>
  <div id="DataMonitorTest" class="component">
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">常用工具</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item @click="backTaskPage">
        <div
          @click="changeBreadcrumb(1)"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }"
          class="breadcrumbItem"
        >
          数据转换
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
defineOptions({name: 'TransPage'})
</script>

<style>

</style>