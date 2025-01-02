<template>
  <div id="DriveTest" class="component">
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">线上运营</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item @click="backTaskPage">
        <div
          @click="changeBreadcrumb(1)"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }"
          class="breadcrumbItem"
        >
          上下线记录
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
defineOptions({name: 'RecordPage'})
</script>

<style>

</style>