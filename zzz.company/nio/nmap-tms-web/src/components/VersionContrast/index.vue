<template>
  <!-- 地图页面：发布时间组件 -->
  <div class="VersionContrast">
    <el-date-picker
      v-model="time1"
      type="date"
      size="mini"
      class="VersionContrastContainer"
      placeholder="发布时间1"
      value-format="YYYY-MM-DD"
    >
    </el-date-picker>
    <el-date-picker
      v-model="time2"
      type="date"
      size="mini"
      class="VersionContrastContainer"
      placeholder="发布时间2"
      value-format="YYYY-MM-DD"
    />
    <el-dialog
      :title="'发布时间' + currVersion"
      v-model="versionListVisible"
      width="70%"
    >
      <el-table
        :data="versionDatas"
        style="width: 100%"
        border
        show-overflow-tooltip="false"
        @row-click="getSelectData"
      >
        <el-table-column
          width="40"
          align="center"
        >
          <template slot-scope="scope">
            <el-radio
              v-model="versionRadio"
              :label="scope.row.task_id"
            >
              &nbsp;
            </el-radio>
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          align="center"
          prop="task_id"
          label="任务号"
        />
        <el-table-column
          min-width="400"
          max-height="30"
          align="center"
          prop="pub_mesh"
          label="发布mesh"
          show-overflow-tooltip
        />
        <el-table-column
          min-width="200"
          align="center"
          prop="pub_version"
          label="发布版本"
        />
        <el-table-column
          min-width="200"
          align="center"
          prop="create_time"
          label="创建时间"
        />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="renderVersion">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { queryPublishList } from '@/api'
export default {
  name: 'VersionContrast',
  // 组件注册
  components: {},
  // 接收父组件传来的参数
  props: {
    mapSource: Number,
  },
  data() {
    return {
      time1: '',
      time2: '',
      versionListVisible: false,
      currVersion: 1,
      versionDatas: [],
      selectedVersionMesh: [],
      versionRadio: ''
    };
  },
  watch: {
    time1(newTime) {
      this.currVersion = 1
      this.handleTimeChange(newTime)
    },
    time2(newTime) {
      this.currVersion = 2
      this.handleTimeChange(newTime)
    },
    mapSource() {
      this.time1 = ''
      this.time2 = ''
    }
  },
  methods: {
    handleTimeChange(time) {
      if (time) {
        this.getPublicList(time)
      } else {
        this.selectedVersionMesh = []
        this.renderVersion()
      }
    },
    getPublicList(time) {
      const startTime = time + ' 00:00:00'
      const endTime = time + ' 23:59:59'
      const data = {
        count: 20,
        page: 1,
        filters: {
          task_id: [],
          pub_mesh: [],
          pub_version: [],
          create_time: [startTime, endTime],
          product_type: this.mapSource
        }
      }
      // 根据时间搜索任务版本
      queryPublishList(data).then((res) => {
        const resData = res.data.data
        if (resData) {
          this.versionDatas = resData.list
          if (resData.list.length) {
            this.versionRadio = resData.list[0].task_id
            this.selectedVersionMesh = resData.list[0].pub_mesh ?
            resData.list[0].pub_mesh.split(',').map(meshId => Number(meshId)) : []
          }
          this.versionListVisible = true
        } else {
          this.$message({
            type: 'error',
            message: res.data.msg,
            showClose: true,
          });
        }
      })
    },
    renderVersion() {
      const options = {
        tileIds: this.selectedVersionMesh,
        version: this.currVersion,
      }
      this.$emit('renderVersion', options)
      this.versionListVisible = false
      this.versionRadio = ''
    },
    getSelectData(val) {
      this.versionRadio = val.task_id
      this.selectedVersionMesh = val.pub_mesh ? val.pub_mesh.split(',').map(meshId => Number(meshId)) : []
    }
  }
};
</script>

<style lang='scss' scoped>
.VersionContrast{
  display: inline-block;
  margin-top: 8px;
}
.VersionContrastContainer {
  display: inline-block;
  width: 150px;
  margin-left: 10px;
}

</style>
