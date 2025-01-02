<template>
  <div id="DataMonitorTest" class="component">
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
          数据监控
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div style="height: 100%; width: 100%;" id="content-container">
        <iframe src="https://datawind.nioint.com/bi#/external/dashboard/42971?inline=true&appId=22&sheetId=10432&feature=%7B%22dashboard%22%3A%7B%22showTitle%22%3Atrue%2C%22showOwner%22%3Afalse%2C%22showActions%22%3Afalse%2C%22sheetType%22%3A%22all%22%2C%22sheetList%22%3A%5B%5D%2C%22showHeader%22%3Atrue%2C%22showFavor%22%3Afalse%2C%22actions%22%3A%5B%5D%2C%22report%22%3A%7B%22showTitle%22%3Atrue%2C%22showTips%22%3Afalse%2C%22showToolbar%22%3Afalse%2C%22showHeader%22%3Atrue%7D%2C%22sheet%22%3A%7B%7D%7D%7D"
        width="100%" height="100%"></iframe>
    </div>
  </div>
</template>

<script setup>
defineOptions({name: 'DataPage'})
</script>

<style>
</style>