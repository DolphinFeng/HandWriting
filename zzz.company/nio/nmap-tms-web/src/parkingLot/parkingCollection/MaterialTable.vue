<template>
  <!-- 主表格信息组件 -->
  <div id="MaterialTable" class="table">
    <div id="MaterialTableContainer" class="table-container">
      <el-table :data="tableData" border :max-height="tableHeight" @selection-change="selectionChange">
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column fixed prop="id" label="记录id" min-width="100" align="center"></el-table-column>
        <el-table-column fixed="left" align="center" prop="businessType" label="业务场景类型" key="businessType"
          min-width="120">
          <template #default="{ row }">
            <el-tag v-if="row.businessType == 'PN'">停车场</el-tag>
            <el-tag v-else-if="row.businessType == 'PSP'">换电站</el-tag>
            <el-tag v-else-if="row.businessType == 'KX'">快修</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed prop="businessId" label="业务编号" min-width="150" align="center"></el-table-column>
        <el-table-column fixed prop="businessName" label="业务名称" min-width="150" align="center"></el-table-column>
        <el-table-column prop="sessionId" label="会话编号" min-width="150" align="center"></el-table-column>
        <el-table-column label="资料运营方式" width="150" align="center">
          <template #default="{row}">
            {{ getSourcesType(row.collectionTaskId) }}
          </template>
        </el-table-column>
        <el-table-column prop="collectionTaskId" label="采集任务编号" min-width="150" align="center"></el-table-column>
        <el-table-column prop="geofenceName" label="地理围栏名称" min-width="150" align="center"></el-table-column>
        <el-table-column prop="vid" label="车辆编号" min-width="150" align="center"></el-table-column>
        <el-table-column prop="mapVsn" label="地图版本号" min-width="150" align="center">
          <template #default="{row}">
            {{ getMapVsn(row.mapVsn, row) }}
          </template>
        </el-table-column>
        <el-table-column prop="firstTime" label="第一个资料包的时间戳(秒值)" min-width="170" align="center"></el-table-column>
        <el-table-column prop="endTime" label="最后一个资料包的时间戳(秒值)" min-width="170" align="center"></el-table-column>
        <el-table-column prop="fileNum" label="实际文件数量" min-width="150" align="center"></el-table-column>
        <el-table-column prop="totalFileNum" label="总计文件数" min-width="150" align="center"></el-table-column>
        <el-table-column prop="keyPrefix" label="cos地址前缀" min-width="130" align="center">
          <template #default="{row}">
            <el-button v-if="!!row.keyPrefix" type="success" @click="showKeyPrefix(row.id)">查看</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="integrity" label="资料是否采集完成" min-width="150" align="center"></el-table-column>
        <el-table-column prop="materialStatus" label="资料状态" min-width="150" align="center">
          <template #default="{row}">
            {{ getMaterialStatus(row.materialStatus) }}
          </template>
        </el-table-column>
        <el-table-column prop="source" label="采集资料来源" min-width="120" align="center">
          <template #default="{row}">
            {{ getSourceName(row.source) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="记录创建时间" min-width="170" align="center"></el-table-column>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <div style="padding-top: 10px" class="pagination-container">
      <el-pagination background :total="total" :page-size="pageSize" v-model="currentPage" :page-sizes="[20, 50, 500, 1000]"
        @current-change="handleCurrentChange" @size-change="handleSizeChange"
        layout="total, sizes, prev, pager, next, jumper"></el-pagination>
    </div>
    <JsonView title="cos地址前缀" v-model:visible="keyPrefixVisible" :data="curKeyPrefix"> </JsonView>
  </div>
</template>

<script>
// 引入js数据
import { tableColumn } from "@/js/material_data";
import JsonView from "@/jsonView/JsonView.vue";

export default {
  name: "MaterialTable",
  components: {
    JsonView
  },
  // 接收父组件传来的参数
  props: {
    tableData: Array,
    total: Number,
    currentCopyPage: Number,
    pageCopySize: Number,
    selectionRows: Object,
    materialStatusOptions: Array,
    sourceOptions: Array
  },
  data() {
    return {
      //表格的最大高度
      tableHeight: 0,
      tableColumn: [
        ...tableColumn
      ],
      // 每次表格展示多少条信息
      pageSize: 20,
      // 表格当前页码
      currentPage: 0,
      jsonVisible: false,
      jsonData: '',
      keyPrefixVisible: false,
      curKeyPrefix: ''
    }
  },
  methods: {
    selectionChange(rows) {
      this.selectionRows.list = rows;
    },
    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.currentPage = page;
      this.$emit('handleCurrentChange', page);
    },
    // 表格size改变时触发函数
    handleSizeChange(page_size) {
      this.pageSize = page_size;
      this.$emit('handleSizeChange', page_size);
    },
    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.tableHeight = document.getElementById('MaterialTableContainer') === null ? 0 : document.getElementById('MaterialTableContainer').offsetHeight;
    },
    getMapVsn(mapVsn, row) {
      return (mapVsn === '' || mapVsn === null) ? '000000' : mapVsn;
    },
    getMaterialStatus(materialStatus) {
      for (var t in this.materialStatusOptions) {
        const option = this.materialStatusOptions[t];
        if (option.name === materialStatus) {
          return option.desc;
        }
      }
      return '';
    },
    getSourceName(source) {
      for (var t in this.sourceOptions) {
        const option = this.sourceOptions[t];
        if (option.name === source) {
          return option.desc;
        }
      }
      return '';
    },
    //从采集任务编号得到资料运营方式
    getSourcesType(collectId) {
      const prefixes = ['dc', 'zb', 'gx-pointcloud', 'gx-vector'];
      for (const prefix of prefixes) {
        if (collectId.startsWith(prefix)) {
          return prefix;
        }
      }
      return '';
    },
    showKeyPrefix(rowId) {
      const row = this.tableData.find((row) => row.id === rowId);
      if (!row) {
        return;
      }
      this.curKeyPrefix = row.keyPrefix;
      this.keyPrefixVisible = true;
    },
    closeKeyPrefix() {
      this.keyPrefixVisible = false;
      this.curKeyPrefix = '';
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.adaptiveTableHeight();
    })
    window.addEventListener('resize', this.adaptiveTableHeight, false);
  },
  created() {
    if (this.pageCopySize.length !== 0) {
      this.pageSize = this.pageCopySize;
    } else {
      this.pageSize = 20;
    }
    if (this.currentCopyPage.length !== 0) {
      this.currentPage = this.currentCopyPage
    } else {
      this.currentPage = 0
    }
  }
}
</script>
