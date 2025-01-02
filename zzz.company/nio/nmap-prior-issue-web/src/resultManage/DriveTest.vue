<template>
  <div id="DriveTest" class="component">
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">成果管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item @click="backTaskPage">
        <div
          @click="changeBreadcrumb(1)"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }"
          class="breadcrumbItem"
        >
          路测取反
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
defineOptions({name: 'DriveTestPage'})
</script>

<style>

</style>