<template>
  <!-- 环境变量 -->
  <div id="EngineEnv" :style="breadcrumbContainerHeight">
    <div id="evnTool">
      <div>
        <el-form inline :model="formData" ref="form" label-position="right" label-width="120px" id="formId">
          <el-form-item label="引擎编码：">
            <el-input v-model.trim="formData.code" style="width: 300px" disabled></el-input>
          </el-form-item>
          <el-form-item label="引擎名称：">
            <el-input v-model.trim="formData.name" style="width: 300px" disabled></el-input>
          </el-form-item>
          <el-form-item>
            <el-button :icon="FolderAdd" type="success" @click="handleAdd">添加</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div id="tableEnvContainer">
      <el-table :data="envDate" border :max-height="table_height">
        <el-table-column
            v-for="item in engineEnvColumn"
            :key="item.prop"
            :prop="item.prop"
            :label="item.label"
            :min-width="item.width"
            align="center"
        ></el-table-column>
        <el-table-column fixed="right" label="操作" width="130">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleUpdate(scope.row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 对话框 -->
    <el-dialog
        :title="header"
        v-model="envEditVisible"
        show-close
        @close="()=>{this.envEditVisible = false}"
        width="700px">
      <div>
        <el-form :data="envForm" label-position="right" label-width="120px" ref="editForm">
          <el-form-item label="变量名：" prop="name">
            <el-input v-model.trim="envForm.name" placeholder="请输入变量名" style="width: 300px" clearable
                      v-if="isAdd"></el-input>
            <span v-else style="width: 460px">{{ envForm.name }}</span>
          </el-form-item>
          <el-form-item label="变量值：" prop="value">
            <el-input type="textarea" :rows="5" v-model.trim="envForm.value" placeholder="请输入变量值"
                      style="width: 500px" clearable></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer" style="text-align: center">
        <el-button variant="outline" @click="()=>{this.envEditVisible = false}">
          取消
        </el-button>
        <el-button type="primary" v-if="isAdd" @click="addFun">保存</el-button>
        <el-button type="primary" v-else @click="updateFun">保存</el-button>
      </div>
    </el-dialog>
    <!-- 删除环境变量对话框 -->
    <el-dialog
        title="删除环境变量"
        v-model="deleteVisible"
        show-close
        @close="()=>{this.deleteVisible = false}"
        width="500px">
      <div style="word-break: break-all;margin-bottom: 15px">
        <span>确认删除环境变量 <b>{{ envName }}</b> 吗？</span>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button @click="deleteFun" type="primary">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
// 引入js数据
import {engineEnvColumn, envForm} from "../js/executionEngine_data";
import {FolderAdd} from "@element-plus/icons-vue";
import axios from "axios";
import {ElMessage, ElForm} from "element-plus";

const scheduleURL = window.api.scheduleURL;

export default {
  name: "EngineEnv",
  // 接收父组件传来的参数
  props: {
    formData: Object,
    envDate: Array,
  },
  data() {
    return {
      breadcrumbContainerHeight: {
        height: '100%'
      },
      table_height: 0,
      engineEnvColumn: engineEnvColumn,
      header: '添加环境变量',
      envEditVisible: false,
      deleteVisible: false,
      envForm: envForm,
      isAdd: false,
      envId: '',
      envName: '',
      rules: {
        name: [
          {required: true, message: '变量名必填', trigger: 'blur'},
        ],
        value: [
          {required: true, message: '变量值必填', trigger: 'blur'},
        ],
      },
    }
  },
  setup() {
    return {
      FolderAdd,
    }
  },
  methods: {
    handleAdd() {
      for (let i in this.envForm) {
        this.envForm[i] = ''
      }
      this.envForm.engineId = this.formData.id
      this.envEditVisible = true
      this.isAdd = true
      this.header = '添加环境变量'
    },
    addFun() {
      if (this.envForm.name !== '' && this.envForm.value !== '') {
        axios({
          url: scheduleURL + '/schedule-service/execution-engine/env/add',
          method: 'post',
          data: this.envForm,
        }).then(response => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: '环境变量添加成功',
              showClose: true,
            });
            this.envEditVisible = false;
            this.$emit('loadingEnv')
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '环境变量添加失败',
            showClose: true,
          });
        });
      }
    },
    handleUpdate(row) {
      for (let i in row) {
        for (let j in this.envForm) {
          if (i === j) {
            this.envForm[j] = row[i]
          }
        }
      }
      this.envEditVisible = true
      this.isAdd = false
      this.header = '修改环境变量'
    },
    updateFun() {
      if (this.envForm.value !== '') {
        axios({
          url: scheduleURL + '/schedule-service/execution-engine/env/update',
          method: 'post',
          data: this.envForm,
        }).then(response => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: '环境变量修改成功',
              showClose: true,
            });
            this.envEditVisible = false;
            this.$emit('loadingEnv')
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '环境变量修改失败',
            showClose: true,
          });
        });
      } else {
        ElMessage.warning({
          message: '变量值未填',
          showClose: true,
        });
      }
    },
    handleDelete(row) {
      this.envName = row.name;
      this.envId = row.id;
      this.deleteVisible = true;
    },
    deleteFun() {
      axios({
        url: scheduleURL + '/schedule-service/execution-engine/env/delete?id=' + this.envId,
        method: 'post',
      }).then(response => {
        if (response.data.code === 200) {
          ElMessage.success({
            message: '环境变量' + this.envName + '删除成功',
            showClose: true,
          });
          this.deleteVisible = false;
          this.$emit('loadingEnv')
        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '环境变量删除失败',
          showClose: true,
        });
      });
    },
    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.table_height = document.getElementById('tableEnvContainer') === null ? 0 : document.getElementById('tableEnvContainer').offsetHeight - 5
    },
  },
  mounted() {
    this.breadcrumbContainerHeight.height = `calc(100%-${document.getElementById('evnTool').offsetHeight + 6}px)`
    this.$nextTick(() => {
      this.adaptiveTableHeight()
    })
    window.addEventListener('resize', this.adaptiveTableHeight, false)
  }
}
</script>

<style scoped>
#EngineEnv {
  position: relative;
  margin: 10px 20px 10px 20px;
}

#tableEnvContainer {
  position: absolute;
  top: 60px;
  bottom: 87px;
  width: 100%;
  height: calc(100% - 167px);
}
</style>
