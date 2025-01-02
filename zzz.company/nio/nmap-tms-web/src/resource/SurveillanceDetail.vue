<template>
  <!-- 资源详情组件 -->
  <div id="SurveillanceDetail">
    <div id="detail" class="baseDiv">
      <div><b>基本信息</b></div>
      <div class="info">
        <t-form :data="detailForm" ref="detailForm" labelAlign="right" id="formId">
          <t-form-item label="资源编码：" name="code">
            <div style="width:200px">{{detailForm.code}}</div>
          </t-form-item>
          <t-form-item label="资源名称：" name="name">
            <div style="width:200px">{{detailForm.name}}</div>
          </t-form-item>
          <t-form-item label="资源状态：" name="statusText">
            <div style="width:200px">{{detailForm.statusText}}</div>
          </t-form-item>
          <t-form-item label="容量阈值：" name="threshold">
            <div style="width:200px">{{detailForm.threshold}}</div>
          </t-form-item>
          <t-form-item label="剩余容量：" name="capacity">
            <div style="width:200px">{{detailForm.capacity}}</div>
          </t-form-item>
        </t-form>
      </div>
    </div>
    <div id="run" class="baseDiv">
      <div><b>运行中（{{detailForm.runningCount}}）个</b></div>
      <div class="info">
        <t-table :data="detailForm.runningExecutionList" :columns="columns" rowKey="id" :hover="true" :bordered="true"></t-table>
      </div>
    </div>
    <div id="wait" class="baseDiv">
      <div><b>等待中（{{detailForm.waitingCount}}）个</b></div>
      <div class="info">
        <t-table :data="detailForm.waitingExecutionList" :columns="columnsWait" rowKey="id" :hover="true" :bordered="true">
        </t-table>
      </div>
    </div>
  </div>
</template>

<script>
  // 引入js数据
  import {columnsWait} from "../js/resource_data";

  const nioTaskURL = window.api.nioTaskURL;

  export default {
    name: "SurveillanceDetail",
    // 接收父组件传来的参数
    props: {
      detailForm: Object,
      dataId: Array,
      totalId: Number,
      dataWait: Array,
      totalWait: Number,
      code: String
    },
    data() {
      return {
        columns: [
          {colKey: 'executionId', title: '执行id', minWidth: 80, width: 80, align: 'center', ellipsis: true,},
          {colKey: 'taskId', title: '任务id', minWidth: 80, width: 80, align: 'center', ellipsis: true,}
        ],
        columnsWait: [
          ...columnsWait
        ],
      }
    },
    methods: {
      handleSurveillance() {
        this.$emit('handleSurveillance', this.code)
      },
    },
    created() {
      window.setInterval(() => {
        setTimeout(this.handleSurveillance, 0)
      }, 10000)
    }
  }
</script>

<style scoped>
  #SurveillanceDetail {
    position: relative;
    margin: 5px 20px 10px 20px;
    height: calc(100% - 55px);
    font-size: 14px;
    overflow-y: scroll;
    background-color: white;
  }

  .baseDiv {
    width: calc(100% - 70px);
    height: auto;
    margin: 5px 30px;
    padding: 5px 20px 10px 20px;
  }

  .info {
    padding: 10px;
  }

  #formId :deep(.t-form__label) {
    padding-right: 4px !important;
    width: 170px !important;
  }

  .tPaginationContainer {
    width: 100%;
    padding-top: 10px;
    height: 42px;
  }

</style>
