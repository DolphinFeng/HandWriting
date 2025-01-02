<template>
  <div v-if="showPowerSearchForm" class="search-tool">
    <el-form :model="powerSearchForm" label-width="150px" label-position="right" inline @submit.prevent="powerSearchHandler">
      <el-form-item label="换电站ID：" style="margin-top: 20px">
        <el-input v-model.trim="powerSearchForm.id" placeholder="请输入id" style="width: 200px;" clearable></el-input>
      </el-form-item>
      <el-form-item label="换电站中文名：" style="margin-top: 20px">
        <el-input v-model.trim="powerSearchForm.chineseName" placeholder="请输入中文名" style="width: 200px;"
                  clearable></el-input>
      </el-form-item>
      <el-form-item label="上线状态：" style="margin-top: 20px">
        <el-input v-model.trim="powerSearchForm.releaseStatus" placeholder="请输入上线状态" style="width: 200px;"
                  clearable></el-input>
      </el-form-item>
      <el-form-item label="换电站版本号：" style="margin-top: 20px">
        <el-input v-model.trim="powerSearchForm.psVersion" placeholder="请输入换电站版本号" style="width: 200px;"
                  clearable></el-input>
      </el-form-item>
      <el-form-item label="底图版本号：" style="margin-top: 20px">
        <el-input v-model.trim="powerSearchForm.mapId" placeholder="请输入底图版本号" style="width: 200px;"
                  clearable disabled></el-input>
      </el-form-item>
      <el-form-item style="margin-top: 20px">
        <el-button :loading="loading" type="primary" :icon="Search" native-type="submit" @click="powerSearchHandler">查询</el-button>
        <el-button :icon="Refresh" @click="resetPowerHandler">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import {defineEmits, defineProps} from "vue";
import {Search, Refresh} from "@element-plus/icons-vue";

const nioDataURL = window.api.nioDataURL;
const props = defineProps({
  loading: {
    required: true
  },
  powerSearchForm: {
    required: true,
  },
  showPowerSearchForm: {
    required: true,
  }
});
const emit = defineEmits(['powerSearchHandler', 'resetPowerHandler'])

const powerSearchHandler = function () {
  emit('powerSearchHandler');
};
const resetPowerHandler = function () {
  emit('resetPowerHandler');
};
</script>

<style scoped>

</style>

