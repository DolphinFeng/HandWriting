<template>
  <div id="DriveTest" class="component">
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">事件制作</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item @click="backTaskPage">
        <div
          @click="changeBreadcrumb(1)"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }"
          class="breadcrumbItem"
        >
          继承
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
defineOptions({name: 'InheritaPage'})
</script>

<style>

</style>