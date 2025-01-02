<template>
  <!-- 主表格信息组件 -->
  <div id="ApproveTable" class="table">
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleTabClick">
      <el-tab-pane label="批次情况" name="ApproveState" disabled>
      </el-tab-pane>
      <el-tab-pane label="场站情况" name="PowerStationState">
        <div id="ApproveTableContainer" class="table-container">
          <el-table :max-height="tableHeight" :data="tableData" border @selection-change="selectionChange">
            <el-table-column type="selection" width="60" align="center"></el-table-column>
            <el-table-column v-for="item in tableColumns" :key="item.prop" v-bind="item">
              <template #default="{row}">
                <div v-if="item.prop === 'permit'">
                  <el-button v-if="row.permit !== null" :type="row.permit ? 'success' : 'danger'">{{ row.permit }}</el-button>
                </div>
                <div v-else-if="item.prop === 'autoqaValueCosUrl'">
                  <el-button type="success" @click="handleDownload(row.autoqaValueCosUrl)">下载</el-button>
                </div>
                <div v-else-if="item.prop === 'autoqaResultCosUrl'">
                  <el-button type="success" @click="handleDownload(row.autoqaResultCosUrl)">下载</el-button>
                </div>
                <span v-else>
                  {{ row[item.prop] }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 分页组件 -->
        <div id="ApprovePagination" style="padding-top: 10px" class="pagination-container">
          <el-pagination background :total="total" :page-size="pageSize" v-model="currentPage" :page-sizes="[20, 50, 100, 500]"
            @current-change="handleCurrentChange" @size-change="handleSizeChange"
            layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch, defineEmits, onMounted, onUnmounted } from "vue";
import { approveTableColumns } from "@/js/autoqa_data.js";

const emit = defineEmits();

interface Props {
  tableData: Array<any>[];
  total: Number;
}

const props = withDefaults(defineProps<Props>(), {
  tableData: () => [],
  total: () => 0
});

let tableColumns = ref([ ... approveTableColumns ]);
let pageSize = ref(20);
let currentPage = ref(0);
let tableHeight = ref(0);
let activeName = ref('PowerStationState');

const adaptiveTableHeight = () => {
  tableHeight.value = document.getElementById('ApproveTable') === null ? 0 : ((document.getElementById('AutoQAApprove').offsetHeight - document.getElementById('PackagesTool').offsetHeight) - 146);
}
const selectionChange = (rows) => {
  emit('selectionRows', rows);
}
const handleCurrentChange = (page) => {
  currentPage.value = page;
  emit('handleCurrentChange', page);
}
const handleSizeChange = (page_size) => {
  pageSize.value = page_size;
  emit('handleSizeChange', page_size);
}
const handleDownload = (url) => {
  window.open(url);
}
const handleTabClick = (tab) => {
  console.log(tab)
}
watch(props.tableData, (newVal, ) => {
  nextTick(() => {
    adaptiveTableHeight();
  });
});

onMounted(() => {
  nextTick(() => {
    adaptiveTableHeight();
  });
  window.addEventListener('resize', adaptiveTableHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', adaptiveTableHeight);
});
</script>
