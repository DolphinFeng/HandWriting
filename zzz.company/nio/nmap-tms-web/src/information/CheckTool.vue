<template>
  <!-- 搜索工具栏组件 -->
  <div>
    <div id="checkTool">
      <t-form layout="inline" :data="upload_search" ref="form" :colon="true">
        <t-form-item label="上传人" style="margin-left: 42px" name="upload_user">
          <t-input v-model.trim="upload_search.userName" placeholder="请输入上传人" style="width: 160px"
                   @change="changeNum(1)" clearable></t-input>
        </t-form-item>
        <t-form-item label="情报id" style="margin-left: 43px" name="info_id">
          <t-input v-model.trim="upload_search.intelligenceId" placeholder="请输入情报id" style="width: 160px"
                   @change="changeNum(2)" clearable></t-input>
        </t-form-item>
        <t-form-item label="任务id" style="margin-left: 43px" name="task_id">
          <t-input v-model.trim="upload_search.intelligenceTaskId" placeholder="请输入任务id" style="width: 160px"
                   @change="changeNum(3)" clearable></t-input>
        </t-form-item>
        <t-form-item label="上传时间" style="margin-left: 28px" name="unload_time_from">
          <el-date-picker
            v-model="dateUploadValue"
            size="small"
            type="daterange"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 420px"
            range-separator="至"
            start-placeholder="上传时间区间开始"
            end-placeholder="上传时间区间结束">
          </el-date-picker>
        </t-form-item>
        <t-form-item label="任务创建时间" name="task_time_from">
          <el-date-picker
            v-model="dateTaskValue"
            size="small"
            type="daterange"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 420px"
            range-separator="至"
            start-placeholder="任务创建时间区间开始"
            end-placeholder="任务创建时间区间结束">
          </el-date-picker>
        </t-form-item>
        <t-form-item label="省份" style="margin-left: 56px" name="belong">
          <t-input v-model.trim="upload_search.province" placeholder="请输入省份" style="width: 160px"
                   @change="changeNum(4)" clearable></t-input>
        </t-form-item>
        <t-form-item label="城市" style="margin-left: 56px" name="taskType">
          <t-input v-model.trim="upload_search.city" placeholder="请输入城市" style="width: 160px"
                   @change="changeNum(5)" clearable></t-input>
        </t-form-item>
        <t-form-item label="流程名称" style="margin-left: 28px" name="line_code">
          <t-select v-model="upload_search.productLineCode" placeholder="请选择流程名称" style="width: 160px"
                    clearable>
            <t-option
              v-for="item in lineCodeOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code">
            </t-option>
          </t-select>
        </t-form-item>
        <t-form-item label="情报状态" style="margin-left: 28px" name="status">
          <t-select v-model="upload_search.status" placeholder="请选择任务状态" style="width: 160px"
                    clearable>
            <t-option
              v-for="item in statusOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code">
            </t-option>
          </t-select>
        </t-form-item>
      </t-form>
      <div class="tool_button">
        <t-button theme="primary" variant="base" @click="onSearch" class="button_style"
                  v-if="infoShow.infoSearchShow">查询
        </t-button>
        <t-button theme="primary" variant="outline" @click="resetForm" class="button_style"
                  v-if="infoShow.infoSearchShow">重置
        </t-button>
      </div>
      <div class="tool_button" style="float: right;padding-right: 10px">
        <t-button theme="primary" variant="outline" @click="clearOrders" class="button_style"
                  v-if="infoShow.infoSearchShow">清空排序
        </t-button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "CheckTool",
    // 接收父组件传来的参数
    props: {
      upload_search: Object,
      lineCodeOptions: Array,
      statusOptions: Array,
      infoShow: Object
    },
    data() {
      return {
        dateUploadValue: '',
        dateTaskValue: '',
        provinceOptions: [],
        cityOptions: [],
      }
    },
    methods: {
      // 数字检查函数
      changeNum(val) {
        this.$emit('changeNum', val)
      },
      // 筛选查询功能
      onSearch() {
        if (this.dateUploadValue !== null && this.dateUploadValue.length !== 0) {
          this.upload_search.uploadFrom = this.dateUploadValue[0]
          this.upload_search.uploadTo = this.dateUploadValue[1]
        } else {
          this.upload_search.uploadFrom = null
          this.upload_search.uploadTo = null
        }
        if (this.dateTaskValue !== null && this.dateTaskValue.length !== 0) {
          this.upload_search.createFrom = this.dateTaskValue[0]
          this.upload_search.createTo = this.dateTaskValue[1]
        } else {
          this.upload_search.createFrom = null
          this.upload_search.createTo = null
        }
        this.$emit('onSearch')
      },
      // 重置功能
      resetForm() {
        this.dateUploadValue = null
        this.dateTaskValue = null
        this.$emit('resetForm')
      },
      // 清空排序
      clearOrders() {
        this.$emit('clearOrders')
      }
    }
  }
</script>

<style scoped>
  #checkTool {
    padding: 5px 0 5px 20px;
    text-align: left;
    color: black;
    font-size: 15px;
  }

  .tool_button {
    display: inline-block;
  }

  .button_style {
    margin: 5px 10px 0 0;
  }
</style>
