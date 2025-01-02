<template>
  <!-- 主表格信息组件 -->
  <div id="PublishTable" class="table">
    <div
      id="PublishTableContainer"
      class="table-container"
      element-loading-text="拼命加载中..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-table id="p_column" :data="tableData" border @selection-change="handleSelectionChange" :max-height="tableHeight">
        <el-table-column align="center" type="selection" width="55" fixed="left"></el-table-column>
        <el-table-column
          fixed
          align="center"
          prop="number"
          label="序号"
          key="id"
          :sortable="false"
          min-width="60"
        ></el-table-column>
        <el-table-column
          fixed
          align="center"
          prop="releaseVersion"
          label="版本编号"
          key="releaseVersion"
          min-width="220"
        ></el-table-column>
        <el-table-column
            align="center"
            prop="descName"
            label="版本名称"
            key="descName"
            min-width="150"
            show-overflow-tooltip
        ></el-table-column>
        <el-table-column
            align="center"
            prop="ndsVersion"
            label="编译版本号"
            key="ndsVersion"
            min-width="100"
        ></el-table-column>
        <el-table-column
            align="center"
            prop="releaseTemplate"
            label="版本类型"
            key="releaseTemplate"
            min-width="140"
        >
          <template #default="scope">
            <el-tag type="success">{{scope.row.releaseTemplate}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
            align="center"
            prop="releaseStatus"
            label="版本状态"
            key="releaseStatus"
            min-width="110"
        >
          <template #default="scope">
            <el-tag :type="getReleaseStatus(scope.row.releaseStatus)">{{scope.row.releaseStatus}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
            align="center"
            prop="productCompileStatus"
            label="编译状态"
            key="productCompileStatus"
            min-width="100"
        >
          <template #default="scope">
            <el-tag :type="getReleaseStatus(scope.row.productCompileStatus)">{{scope.row.productCompileStatus}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="parentReleaseVersion"
          label="前继版本"
          key="parentReleaseVersion"
          minWidth="100"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          align="center"
          prop="baseLineVersion"
          label="大版发布版本"
          key="baseLineVersion"
          minWidth="150"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column align="center" prop="current" label="项目阶段" key="" min-width="160"></el-table-column>
        <el-table-column align="center" prop="owner" label="创建人" key="owner" min-width="100"></el-table-column>
        <el-table-column align="center" label="创建时间" min-width="180" prop="createTs"></el-table-column>
        <el-table-column align="center" label="结束时间" min-width="180" prop="completeTs"></el-table-column>
        <el-table-column fixed="right" label="版本操作" min-width="130">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleDetail(scope.row)">详情</el-button>
            <el-button type="primary" link size="small" @click="linkRule(scope.row)">项目信息</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <div style="padding-top: 10px" class="tPaginationContainer">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page="currentPage" :page-sizes="[20, 50, 100,500, 1000]" :default-page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
    </div>
  </div>
</template>

<script>
// 引入需要的组件
import store from '../../store/index.js';
import { svg } from '@/js/loading_data.js';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

export default {
  name: 'PublishTable',
  // 组件注册
  components: {},
  // 接收父组件传来的参数
  props: {
    loading: Boolean,
    tableData: Array,
    total: Number,
  },
  data() {
    return {
      startVisible: false,
      taskId: 0,
      table_height: 0,
      // 每次表格展示多少条信息
      pageSize: 20,
      // 表格当前页码
      currentPage: 1,
      svg: svg,
      tableHeight: 0,
    };
  },
  setup() {
    // //跳转到项目历史页面
    // const router = useRouter();
    // const linkRule = function (rowDetial) {
    //   // let projectId = rowDetial.projectId;
    //   // router.push({ path: '/ProjectPage', query: { projectId} });

    //   this.$emit('handleDetail', rowDetial);
    //   store.commit('breadChange', 2);
    //   const baseLineVersion = rowDetial.baseLineVersion;
    //   router.push({
    //     path: '/PublishPage/PublishDetail',
    //     query: {
    //       baseLineVersion,
    //       tab: 'third',
    //     }
    //   })
    // };
    // return {
    //   linkRule,
    // };
  },
  methods: {
    // 详情按钮
    handleDetail(row) {
      console.log('入口进入的 row', row.releaseVersion)
      this.$emit('handleDetail', row);
      store.commit('breadChange', 2);
    },
    // 跳转到项目历史页面
    linkRule(rowDetail) {
      this.$emit('handleDetail', rowDetail);
      store.commit('breadChange', 2);
      const baseLineVersion = rowDetail.releaseVersion;
      console.log('baseLineVersion', baseLineVersion);
      this.$router.push({
        path: '/PublishPage/PublishDetail',
        query: {
          baseLineVersion,
          tab: 'third',
        }
      });
    },

    // // 复制按钮
    // handleCopy(row) {
    //   this.$emit('handleCopy', row);
    // },

    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.currentPage = page;
      this.$emit('handleCurrentChange', page, this.pageSize);
    },

    // 表格size改变时触发函数
    handleSizeChange(page_size) {
      this.pageSize = page_size;
      this.$emit('handleSizeChange', page_size);
    },
    // 选中的方法
    handleSelectionChange(val) {
      this.$emit('handleSelectionChange', val);
    },
    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.tableHeight =
        document.getElementById('PublishTableContainer') === null
          ? 0
          : document.getElementsByClassName('table')[0].offsetHeight -50;
    },
    // getReleaseTemplate(template) {
    //   if(template === '已取消'){
    //     return 'info'
    //   }else if(template === '编排失败' || template === '执行失败' || template === '失败'){
    //     return 'danger'
    //   }else if(template === '编排中' || template === '执行中' || template === '运行中' || template === '已结束'){
    //     return 'warning'
    //   }else if(template === '已完成'){
    //     return 'success'
    //   }else{
    //     return ''
    //   }
    // },
    getReleaseStatus(status) {
      if(status === '取消' || status === '检查不通过'){
        return 'info'
      }else if(status === '编译失败' || status === '执行失败' || status === '失败'){
        return 'danger'
      }else if(status === '进行中'){
        return 'warning'
      }else if(status === '成功'){
        return 'success'
      }else{
        return ''
      }
    }
  },
  computed: {},
  mounted() {
    this.$nextTick(() => {
      this.adaptiveTableHeight();
    });
    window.addEventListener('resize', this.adaptiveTableHeight);
  },
  unmounted() {
    window.removeEventListener('resize', this.adaptiveTableHeight)
  }
};
</script>

<style scoped>
#PublishTable {
  overflow: hidden;
}
</style>
