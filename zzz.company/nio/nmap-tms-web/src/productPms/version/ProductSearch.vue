<template>
  <div v-if="showSearchForm" class="search-tool">
    <el-form :model="searchForm" label-width="100px" label-position="right" inline @submit.prevent="searchHandler">
      <el-form-item prop="productIdentity" label="产品库名称：">
        <el-input v-model="searchForm.productIdentity" placeholder="请输入产品库名称" style="width: 200px" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" native-type="submit">查询</el-button>
        <el-button :icon="Refresh" @click="resetHandler">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import {defineEmits, defineProps} from "vue";
import {Search, Refresh} from "@element-plus/icons-vue";

const nioDataURL = window.api.nioDataURL;
const props = defineProps({
  searchForm: {
    required: true,
  },
  showSearchForm: {
    required: true,
  }
});
const emit = defineEmits(['searchHandler', 'resetHandler'])

const searchHandler = function () {
  emit('searchHandler');
};
const resetHandler = function () {
  emit('searchHandler');
};
</script>

<style scoped>

</style>
