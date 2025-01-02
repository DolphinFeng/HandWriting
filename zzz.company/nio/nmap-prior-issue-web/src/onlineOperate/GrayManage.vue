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
          灰度管理
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索表单 -->
    <el-form :model="searchForm" label-position="right" inline class="search-form">
      <el-form-item prop="grayGroup">
        <el-select v-model="searchForm.grayGroup" placeholder="灰度组" style="width: 200px" clearable>
          <el-option v-for="item in grayGroupOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item prop="carStandard">
        <el-select v-model="searchForm.carStandard" placeholder="车辆标签名称" style="width: 200px" clearable>
          <el-option v-for="item in carStandardOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item prop="highwayVersion">
        <el-select v-model="searchForm.highwayVersion" placeholder="高快城市版本" style="width: 200px" clearable>
          <el-option v-for="item in highwayVersionOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item prop="pspVersion">
        <el-select v-model="searchForm.pspVersion" placeholder="PSP服务区版本" style="width: 200px" clearable>
          <el-option v-for="item in pspVersionOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <!-- 工具按钮 -->
      <el-form-item class="search-button">
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button type="primary" @click="resetForm">重置</el-button>
        <el-button type="primary" @click="openCreateDialog">新增灰度组</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格区域 -->
    <div class="table">
      <div class="table-container" id="table-container">
        <el-table :data="tableData" border v-loading="loading" element-loading-text="加载中" 
                  :element-loading-spinner="svg" element-loading-svg-view-box="-10, -10, 50, 50"
                  height="calc(100vh - 250px)" row-key="id">
          <!-- 展开列 -->
          <el-table-column type="expand" fixed="left">
            <template #default="{ row }">
              <el-table :data="row.children" border :cell-style="{ height: '50px', overflow: 'hidden' }">
                <el-table-column prop="id" label="id" align="center" width="100" />
                <el-table-column prop="carStandardId" label="车辆标签id" align="center" width="150" />
                <el-table-column prop="highwayVersion" label="高快城市版本" align="center" width="150" />
                <el-table-column prop="highwayFormat" label="高快城市规格" align="center" width="150" />
                <el-table-column prop="pspVersion" label="服务区版本" align="center" width="150" />
                <el-table-column prop="pspFormat" label="服务区规格" align="center" width="150" />
                <el-table-column prop="dataVersion" label="数据版本" align="center" width="200" />
                <el-table-column prop="updater" label="更新人" align="center" width="150" />
                <el-table-column prop="updateDesc" label="更新说明" align="center" width="200" />
                <el-table-column prop="updateTime" label="更新时间" align="center" width="200" />
                <el-table-column label="操作" align="center" width="150">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="handleViewData(row)">查看数据</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>

          <!-- 主表格列 -->
          <el-table-column prop="grayGroup" label="灰度组" align="center" width="150" />
          <el-table-column prop="environment" label="环境" align="center" width="150" />
          <el-table-column prop="carStandardId" label="车辆标签id" align="center" width="150" />
          <el-table-column prop="carStandardName" label="车辆标签名称" align="center" width="200" />
          <el-table-column prop="configCarNum" label="配置车辆数" align="center" width="150" />
          <el-table-column prop="standardDesc" label="标签描述" align="center" width="200" />
          <el-table-column prop="highwayVersion" label="地图版本" align="center" width="150" />
          <el-table-column prop="highwayFormat" label="地图规格" align="center" width="150" />
          <el-table-column prop="pspVersion" label="地图版本" align="center" width="150" />
          <el-table-column prop="pspFormat" label="地图规格" align="center" width="150" />
          <el-table-column prop="dataVersion" label="数据版本" align="center" width="200" />
          <el-table-column prop="updater" label="更新人" align="center" width="150" />
          <el-table-column prop="updateDesc" label="更新说明" align="center" width="200" />
          <el-table-column prop="updateTime" label="更新时间" align="center" width="200" />
          <el-table-column label="更新时间" align="center" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEdit(row)">编辑配置</el-button>
              <el-button type="primary" size="small" @click="openCreateDialog(row)">查看数据</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 编辑配置对话框 -->
    <el-dialog 
      :title="`灰度组配置：灰度组 ${editForm.id}，${getEnvironmentText()}环境`" 
      v-model="editVisible" 
      width="800px"
      draggable
    >
      <el-form :model="editForm" label-width="160px" ref="editFormRef" class="gray-config-form">
        <!-- 第一行 -->
        <div class="form-row">
          <el-form-item label="车辆标签id" prop="carStandardId">
            <el-select 
              v-model="editForm.carStandardId" 
              placeholder="下拉选择，获取aip已有车辆标签id" 
              style="width: 240px"
              @focus="fetchCarTags"
            >
              <el-option v-for="item in carTagOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="标签名称" prop="tagName" label-width="100px">
            <el-input v-model="editForm.tagName" placeholder="按标签id自动输入" disabled style="width: 240px" />
          </el-form-item>
        </div>

        <!-- 第二行 -->
        <div class="form-row">
          <el-form-item label="配置车辆数" prop="vehicleNum">
            <el-input v-model="editForm.vehicleNum" placeholder="按标签id自动输入" disabled style="width: 240px" />
          </el-form-item>
          <el-form-item label="标签描述" prop="tagDesc" label-width="100px">
            <el-input v-model="editForm.tagDesc" placeholder="按标签id自动输入" disabled style="width: 240px" />
          </el-form-item>
        </div>

        <!-- 第三行 -->
        <div class="form-row">
          <el-form-item label="高快城市地图版本" prop="highwayVersion">
            <el-select v-model="editForm.highwayVersion" placeholder="请选择" style="width: 240px">
              <el-option v-for="item in highwayVersionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="规格" prop="highwayFormat" label-width="100px">
            <el-input v-model="editForm.highwayFormat" placeholder="按版本自动输入" style="width: 240px" disabled />
          </el-form-item>
        </div>

        <!-- 第四行 -->
        <div class="form-row">
          <el-form-item label="PSP服务区地图版本" prop="pspVersion">
            <el-select v-model="editForm.pspVersion" placeholder="请选择" style="width: 240px">
              <el-option v-for="item in pspVersionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="规格" prop="pspFormat" label-width="100px">
            <el-input v-model="editForm.pspFormat" placeholder="按版本自动输入" style="width: 240px" disabled />
          </el-form-item>
        </div>

        <!-- 先验事件数据版本表格 -->
        <el-form-item label="先验事件数据版本">
          <div class="prior-events-table">
            <el-table :data="priorEventsData" border style="width: 100%" height="300">
              <el-table-column prop="index" label="序号" width="80" align="center" />
              <el-table-column prop="type" label="先验事件业务类型" min-width="150" align="center">
                <template #default="{ row }">
                  {{ getPriorEventType(row.type) }}
                </template>
              </el-table-column>
              <el-table-column prop="version" label="数据版本" min-width="150" align="center">
                <template #default="{ row }">
                  <el-select v-model="row.version" placeholder="请选择" style="width: 100%">
                    <el-option v-for="item in row.versionOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="count" label="事件数量" min-width="120" align="center" />
            </el-table>
          </div>
        </el-form-item>

        <!-- 更新说明 -->
        <el-form-item label="更新说明" prop="updateDesc">
          <el-input v-model="editForm.updateDesc" type="textarea" :rows="3" placeholder="请输入更新说明" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveEdit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增灰度组对话框 -->
    <el-dialog 
      title="新增灰度组" 
      v-model="createVisible" 
      width="400px"
      center
    >
      <div class="dialog-content">
        请确定是否新增空的灰度组？
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCreate">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ArrowRight } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const DOMAIN = 'http://prior-issue-web-service.map-tencent-dev.nioint.com'

export default {
  name: 'GrayManage',
  data() {
    return {
      ArrowRight,
      loading: false,
      searchForm: {
        grayGroup: '',
        carStandard: '',
        highwayVersion: '',
        pspVersion: ''
      },
      editVisible: false,
      createVisible: false,
      editForm: {},
      createForm: {
        grayGroup: '',
        carStandardName: '',
        highwayVersion: '',
        highwayFormat: '',
        pspVersion: '',
        pspFormat: '',
        updateDesc: ''
      },
      tableData: [],
      rawData: [],
      grayGroupOptions: [],
      carStandardOptions: [],
      highwayVersionOptions: [],
      pspVersionOptions: [],
      priorEventsData: [
        { index: 1, type: 'HD_WHITE', version: '', count: 0, versionOptions: [] },
        { index: 2, type: 'SD_WHITE', version: '', count: 0, versionOptions: [] },
        { index: 3, type: 'HD_BLACK', version: '', count: 0, versionOptions: [] },
        { index: 4, type: 'SD_BLACK', version: '', count: 0, versionOptions: [] },
        { index: 5, type: 'SPEED_LIMIT', version: '', count: 0, versionOptions: [] },
        { index: 6, type: 'TRAJECTORY', version: '', count: 0, versionOptions: [] },
        { index: 7, type: 'PSP_LINK', version: '', count: 0, versionOptions: [] }
      ],
      carTagOptions: [],
      lastGrayGroupId: 0
    }
  },
  methods: {
    changeBreadcrumb(index) {
      this.$store.commit('breadChange', index)
    },

    // 初始化数据加载
    async initData() {
      try {
        this.loading = true
        const response = await axios.post(`${DOMAIN}/dlayer/prior_events/vid_group_config/list`, {
          gray_group: this.searchForm.grayGroup,
          car_standard: this.searchForm.carStandard,
          highway_version: this.searchForm.highwayVersion,
          psp_version: this.searchForm.pspVersion
        })
        
        if (response.data.code === 0) {
          this.rawData = response.data.data.result
          // 找出当前最大的灰度组ID
          this.lastGrayGroupId = Math.max(
            0,
            ...this.rawData.map(item => parseInt(item.id) || 0)
          )
          // 生成下拉选项
          this.generateOptions(response.data.data.result)
          // 处理显示数据
          this.processTableData(response.data.data.result)
        } else {
          ElMessage.error(response.data.msg || '查询失败')
        }
      } catch (error) {
        console.error('查询失败:', error)
        ElMessage.error('查询失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    // 搜索方法
    onSearch() {
      // 如果没有任何筛选条件，重新请求接口
      if (!this.hasFilterConditions()) {
        this.initData()
        return
      }

      // 有筛选条件时，前端过滤
      const filteredData = this.filterData(this.rawData)
      this.processTableData(filteredData)
    },

    // 检查是否有筛选条件
    hasFilterConditions() {
      return this.searchForm.grayGroup !== '' || 
             this.searchForm.carStandard !== '' || 
             this.searchForm.highwayVersion !== '' || 
             this.searchForm.pspVersion !== ''
    },

    // 处理表格数据
    processTableData(data) {
      this.tableData = data.map(item => ({
        id: item.id,
        grayGroup: item.id,
        environment: item.environment || '-',
        carStandardId: item.id,
        carStandardName: item.name,
        configCarNum: item.vehicle_num,
        standardDesc: item.vehicle_tag || '-',
        highwayVersion: item.map_version,
        highwayFormat: item.map_spec,
        pspVersion: item.psp_map_version,
        pspFormat: item.psp_map_spec,
        dataVersion: '-',
        updater: item.update_persion,
        updateDesc: item.update_info || '-',
        updateTime: item.update_ts,
        children: [
          {
            id: item.id,
            carStandardId: item.vehicle_tag || '-',
            highwayVersion: item.map_version,
            highwayFormat: item.map_spec,
            pspVersion: item.psp_map_version,
            pspFormat: item.psp_map_spec,
            dataVersion: item.data_version || '-',
            updater: item.update_persion,
            updateDesc: item.update_info || '-',
            updateTime: item.update_ts
          }
        ]
      }))
    },

    // 重置表单
    resetForm() {
      this.searchForm = {
        grayGroup: '',
        carStandard: '',
        highwayVersion: '',
        pspVersion: ''
      }
      // 重置后重新加载数据
      this.initData()
    },

    generateOptions(data) {
      this.grayGroupOptions = [...new Set(data.map(item => item.id))].map(id => ({
        label: id,
        value: id
      }))

      this.carStandardOptions = [...new Set(data.map(item => item.name))].map(name => ({
        label: name,
        value: name
      }))

      this.highwayVersionOptions = [...new Set(data.map(item => item.map_version))].filter(Boolean).map(version => ({
        label: String(version),
        value: version
      }))

      this.pspVersionOptions = [...new Set(data.map(item => item.psp_map_version))].filter(Boolean).map(version => ({
        label: String(version),
        value: version
      }))
    },

    filterData(data) {
      return data.filter(item => {
        const matchGrayGroup = !this.searchForm.grayGroup || item.id === this.searchForm.grayGroup
        const matchCarStandard = !this.searchForm.carStandard || item.name === this.searchForm.carStandard
        const matchHighwayVersion = !this.searchForm.highwayVersion || item.map_version === this.searchForm.highwayVersion
        const matchPspVersion = !this.searchForm.pspVersion || item.psp_map_version === this.searchForm.pspVersion
        
        return matchGrayGroup && matchCarStandard && matchHighwayVersion && matchPspVersion
      })
    },

    openCreateDialog() {
      this.createVisible = true
      this.createForm = {
        grayGroup: '',
        carStandardName: '',
        highwayVersion: '',
        highwayFormat: '',
        pspVersion: '',
        pspFormat: '',
        updateDesc: ''
      }
    },

    async handleCreate() {
      try {
        // 生成新的递增灰度组ID
        this.lastGrayGroupId++
        const newGrayGroupId = this.lastGrayGroupId.toString()
        
        // 创建新的空行数据
        const newRow = {
          id: newGrayGroupId,
          grayGroup: newGrayGroupId,
          environment: this.getEnvironmentText(),
          carStandardId: '-',
          carStandardName: '-',
          configCarNum: 0,
          standardDesc: '-',
          highwayVersion: '-',
          highwayFormat: '-',
          pspVersion: '-',
          pspFormat: '-',
          dataVersion: '-',
          updater: '-',
          updateDesc: '-',
          updateTime: new Date().toLocaleString(),
          children: []
        }

        // 添加到表格数据中
        this.tableData.unshift(newRow)
        
        // 关闭对话框并显示成功消息
        this.createVisible = false
        ElMessage.success('新增灰度组成功')
        
      } catch (error) {
        console.error('创建失败:', error)
        ElMessage.error('创建失败，请稍后重试')
      }
    },

    handleEdit(row) {
      this.editVisible = true
      this.editForm = { ...row }
    },

    handleView(row) {
      // 打开新窗口跳转到指定平台
      window.open(`http://nmap-web-editor.idc-prod.nioint.com/#/home`, '_blank')
    },

    async handleSaveEdit() {
      try {
        const response = await axios.post(`${DOMAIN}/dlayer/prior_events/vid_group_config/update`, {
          gray_group: this.editForm.grayGroup,
          car_standard_name: this.editForm.carStandardName,
          highway_version: this.editForm.highwayVersion,
          highway_format: this.editForm.highwayFormat,
          psp_version: this.editForm.pspVersion,
          psp_format: this.editForm.pspFormat,
          update_desc: this.editForm.updateDesc
        })
        
        if (response.data.code === 0) {
          ElMessage.success('更新成功')
          this.editVisible = false
          this.onSearch()
        } else {
          ElMessage.error(response.data.msg || '更新失败')
        }
      } catch (error) {
        console.error('更新失败:', error)
        ElMessage.error('更新失败，请稍后重试')
      }
    },

    handleViewData(row) {
      // 子表格中的查看数据按钮也跳转到同一平台
      window.open(`http://nmap-web-editor.idc-prod.nioint.com/#/home`, '_blank')
    },

    // 获取环境文本
    getEnvironmentText() {
      if (DOMAIN.includes('dev')) return 'stg'
      if (DOMAIN.includes('prod')) return 'prod'
      return 'stg' // 默认返回stg
    },

    // 获取先验事件类型名称
    getPriorEventType(type) {
      const typeMap = {
        'HD_WHITE': 'HD白名单',
        'SD_WHITE': 'SD白名单',
        'HD_BLACK': 'HD黑名单',
        'SD_BLACK': 'SD黑名单',
        'SPEED_LIMIT': '经验限速',
        'TRAJECTORY': '经验轨迹',
        'PSP_LINK': 'PSP LINK事件'
      }
      return typeMap[type] || type
    },

    // 获取车辆标签列表
    async fetchCarTags() {
      try {
        const response = await axios.get(`${DOMAIN}/dlayer/prior_events/vid_group_config/available_tag`)
        if (response.data.code === 0) {
          this.carTagOptions = response.data.data.map(tag => ({
            label: tag.id,
            value: tag.id,
            ...tag
          }))
        }
      } catch (error) {
        console.error('获取车辆标签失败:', error)
        ElMessage.error('获取车辆标签失败')
      }
    },

    // 监听车辆标签选择
    handleCarTagChange(value) {
      const selectedTag = this.carTagOptions.find(tag => tag.value === value)
      if (selectedTag) {
        this.createForm.tagName = selectedTag.name
        this.createForm.vehicleNum = selectedTag.vehicle_num
        this.createForm.tagDesc = selectedTag.description
      }
    }
  },
  watch: {
    'createForm.carStandardId'(newVal) {
      this.handleCarTagChange(newVal)
    }
  },
  mounted() {
    // 页面加载时初始化数据
    this.initData()
  }
}
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
}

.table-container {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.el-table .cell) {
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-button {
  margin-left: 20px;
}

.prior-events-table {
  border: 1px solid #EBEEF5;
  border-radius: 4px;
}

.prior-events-table :deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

/* 设置滚动条样式 */
.prior-events-table::-webkit-scrollbar {
  width: 6px;
}

.prior-events-table::-webkit-scrollbar-thumb {
  background-color: #909399;
  border-radius: 3px;
}

.prior-events-table::-webkit-scrollbar-track {
  background-color: #F5F7FA;
}

.gray-config-form {
  padding: 0 20px;
}

.form-row {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 18px;
}

.form-row .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.form-row .el-form-item:last-child {
  margin-right: 0;
}

.prior-events-table {
  border: 1px solid #EBEEF5;
  border-radius: 4px;
}

:deep(.el-dialog__body) {
  padding: 20px 0;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-input.is-disabled .el-input__inner) {
  background-color: #f5f7fa;
  color: #909399;
}

/* 设置滚动条样式 */
.prior-events-table :deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 6px;
}

.prior-events-table :deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background-color: #909399;
  border-radius: 3px;
}

.prior-events-table :deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background-color: #F5F7FA;
}

.dialog-content {
  text-align: center;
  padding: 20px 0;
  font-size: 16px;
}
</style>