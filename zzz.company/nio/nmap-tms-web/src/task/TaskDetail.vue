<template>
  <!-- 任务详情整体 -->
  <div id="detailCom">
    <el-tabs v-model="activeName.value" type="border-card" @tab-click="tabClick" class="detail-panel">
      <!-- 任务详情表单 -->
      <el-tab-pane label="任务详情" name="first" class="detail-tab">
        <div>
          <el-button v-if="editShow.value" :icon="FolderAdd" type="success" @click="saveFun">保存</el-button>
        </div>
        <el-scrollbar id="detail_component" max-height="350px">
          <NioDynamicForm :init-form="initForm" ref="dynamicFormRef" :disabled="!editShow.value">
            <template #field>
              <el-form-item label="任务名称：">
                <el-input v-model.trim="createForm.name" placeholder="任务名称(必填)" style="width: 582px" clearable
                          v-if="editShow.value"></el-input>
                <el-input v-model.trim="createForm.name" style="width: 582px" disabled v-else></el-input>
              </el-form-item>
              <el-form-item label="任 务 ID：" v-if="!LineShow.value">
                <el-input v-model.trim="createForm.id" style="width: 200px" disabled></el-input>
              </el-form-item>
              <el-form-item label="任务类型：">
                <el-input v-model="createForm.type" style="width: 200px" disabled></el-input>
              </el-form-item>
              <el-form-item label="优 先 级：">
                <template v-if="editShow.value">
                  <el-select v-model="createForm.priority" style="width: 150px" placeholder="任务优先级(必填)"
                             filterable>
                    <el-option
                        v-for="item in priorityOptions"
                        :key="item.code"
                        :label="item.name"
                        :value="item.code">
                    </el-option>
                  </el-select>
                </template>
                <!--仅显示不可更改即可-->
                <el-select v-model="createForm.priority" style="width: 200px" disabled v-else>
                  <el-option
                      v-for="item in priorityOptions"
                      :key="item.code"
                      :label="item.name"
                      :value="item.code">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="任务备注：">
                <el-input v-model="createForm.remark" style="min-width:200px; max-width:400px" disabled></el-input>
              </el-form-item>
              <br/>
            </template>
          </NioDynamicForm>
        </el-scrollbar>
        <div id="taskDetailTable" style="flex: 1;overflow: hidden;">
          <el-table :data="variablesTable" border :max-height="run_table_height">
            <el-table-column v-for="item in variablesTableColumn"
                             :key="item.prop"
                             :prop="item.prop"
                             :label="item.label"
                             :min-width="item.width"
            >
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <!-- 任务历史 -->
      <el-tab-pane label="任务历史" name="second" class="detail-tab">
        <div style="margin: 0 10px 5px 0">
          <el-button :icon="Back" type="primary" @click="backProjectDetail(this.routeProjectId)" v-if="top == -1 && routeProjectId !== undefined">返回项目详情</el-button>
          <el-button :icon="Back" type="primary" @click="backFun" id="backDiv" v-if="top > -1">返回</el-button>
          <el-button :icon="Refresh" @click="refresh" id="refresh">刷新</el-button>
        </div>
        <div id="bpmn-container">
          <div id="process-preview" ref="processPreview">
            <div id="container" @wheel="mouseWheel"></div>
            <div class="button-group">
              <div style="margin-left: 5px;margin-right: 5px">
                <el-icon @click="aim">
                  <Aim/>
                </el-icon>
              </div>
            </div>
          </div>
          <div id="invoke-detail" ref="invokeDetail">
            <div class="push-pull" @click="openInvokeDetail">调用详情</div>
            <el-table
                :data="invokeTable"
                :max-height="400"
                element-loading-text=""
                v-loading="loading"
                element-loading-svg-view-box="-10, -10, 50, 50"
                :element-loading-spinner="svg"
            >
              <el-table-column type="expand">
                <template #default="props">
                  <el-link type="success" @click="copyData(props.row['requestContent'])" :underline="false">
                    <span
                        style="font-size: 14px;font-weight: normal;word-break: break-all;padding: 0 20px">{{
                        props.row['requestContent']
                      }}</span>
                  </el-link>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="requestTime" label="请求时间（倒序）" width="170px"></el-table-column>
              <el-table-column align="center" prop="responseTime" label="响应时间" width="170px"></el-table-column>
              <el-table-column align="center" label="响应内容" min-width="100px">
                <template #default="scope">
                  <el-link :underline="false" type="primary" style="font-size: 13px;font-weight: normal;"
                           @click="showJson(scope.row['responseContent'])">查看响应内容
                  </el-link>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <el-table :data="msgTable" border :max-height="history_table_height">
          <el-table-column v-for="item in msgTableColumn"
                           :key="item.prop"
                           :prop="item.prop"
                           :label="item.label"
                           :min-width="item.width"
                           align="center">
          </el-table-column>
          <el-table-column align="center" label="操作" min-width="200px">
            <template #default="scope">
              <el-button v-if="scope.row.activityType === 'serviceTask'" @click="showInvokeDetail(scope.row.activityId)" link type="primary" size="small">调用记录
              </el-button>
              <el-button v-if="scope.row.activityType === 'serviceTask' && scope.row.activityId === 'step_job_run'" @click="linkToJobPage(scope.row.activityId)" link type="primary" size="small">查看JOB
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <!-- 异常信息 -->
      <el-tab-pane label="异常信息" name="third" class="detail-tab">
        <el-table :data="jobTable" border :max-height="job_table_height">
          <el-table-column v-for="item in jobTableColumn"
                           :key="item.prop"
                           :prop="item.prop"
                           :label="item.label"
                           :min-width="item.width"
                           align="center"></el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button @click="handleRetry(scope.row)" link type="primary" size="small">重试</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <!-- 异常重试对话框 -->
    <el-dialog
        title="异常重试"
        v-model="jobVisible"
        show-close
        @close=" () => { this.jobVisible = false; }"
        width="480px"
    >
      <div>
        <div>
          确认异常jobId <b>{{ taskId }}</b> 重试吗?
        </div>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="jobVisible = false">取 消</el-button>
        <el-button type="primary" @click="retryFun">确 认</el-button>
      </template>
    </el-dialog>
    <!-- 查看JSON -->
    <JsonView
        :data="jsonData"
        title="响应内容"
        v-model:visible="jsonVisible"
    ></JsonView>
    <!-- 上传表单 -->
    <el-dialog
        title="作业"
        v-model="workShow"
        show-close
        @close="closeWorkForm"
        width="480px"
    >
      <el-form ref="workFormRef" :model="workForm" label-width="130px" label-position="right">
        <el-form-item v-for="item in workForm" :label="item.label + '：'">
          <el-select v-if="item.type === 'enum'"
                     v-model="item.value"
                     clearable
                     :placeholder="'请选择' + item.label"
                     style="width: 220px"
          >
            <el-option
                v-for="childItem in item.options"
                :label="childItem.label"
                :key="childItem.value"
                :value="childItem.value"
            ></el-option>
          </el-select>
          <el-input v-else-if="item.type === 'string'"
                    v-model="item.value"
                    clearable
                    :placeholder="'请填写' + item.label"
                    style="width: 220px"
          ></el-input>
          <el-input-number v-else-if="item.type === 'long'"
                           v-model="item.value"
                           clearable
                           :placeholder="'请填写' + item.label"
                           style="width: 220px"
          ></el-input-number>
          <el-switch v-else-if="item.type === 'boolean'"
                     active-text="是"
                     inactive-text="否"
                     inline-prompt
                     v-model="item.value"
                     clearable
          ></el-switch>
          <el-date-picker v-else-if="item.type === 'date'"
                          v-model="item.value"
                          type="datetime"
                          placeholder="请选择时间"
                          format="YYYY-MM-DD hh:mm:ss"
                          style="width: 220px;"
                          :default-time="new Date()"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer class="dialog-footer">
        <el-button @click="workShow = false">取 消</el-button>
        <el-button type="primary" @click="workHandler">确 认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
// 引入需要的组件
import DynamicForm from "./DynamicForm.vue";
import BpmnViewer from "bpmn-js/lib/Viewer";
import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";
import ModelingModule from "bpmn-js/lib/features/modeling";
import zoomScroll from "../js/zoom_scroll.js";
import {
  invokeTableColumn,
  jobTableColumn,
  msgTableColumn,
  priorityOptions,
  variablesTableColumn,
} from "@/js/task_data";
import axios from "axios";
import JsonView from "../jsonView/JsonView.vue";
import {Back, FolderAdd, Refresh} from "@element-plus/icons-vue";
import {copyTextToClipboard} from "../utils/index.js";
import {ElMessage} from "element-plus";
import {svg} from "../js/loading_data.js";
import {reactive, ref, watch} from "vue";
import NioDynamicForm from "@/components/DynamicForm/NioDynamicForm.vue";
import { useRouter } from 'vue-router';

const nioTaskURL = window.api.nioTaskURL;
const nioStorageServiceURL = window.api.nioStorageServiceURL;

if (nioTaskURL === null || nioTaskURL === undefined) {
  console.log("获取nioTaskURL失败" + nioTaskURL);
}

export default {
  name: "TaskDetail",
  // 组件注册
  components: {
    NioDynamicForm,
    JsonView,
    DynamicForm,
  },
  // 接收父组件传来的参数
  props: {
    taskId: Number,
    procDefKey: String,
    procInstId: String,
    routeProjectId:String,
    createForm: Object,
    taskTypeOptions: Array,
    formProperty: Array,
    variablesTable: Array,
    activeName: Object,
    editShow: Object,
    LineShow: Object,
  },
  data() {
    return {
      dynamicVisible: true,
      jsonData: '{}',
      //json显示器
      jsonVisible: false,
      // 表格高度初始化
      run_table_height: 0,
      history_table_height: 0,
      job_table_height: 0,
      // 参数信息表格
      variablesTableColumn: [...variablesTableColumn],
      // 历史信息表格
      msgTableColumn: [...msgTableColumn],
      msgTable: [],
      invokeTableColumn: [...invokeTableColumn],
      invokeTable: [],
      // 异常信息表格
      jobTableColumn: [...jobTableColumn],
      jobTable: [],
      incidentId: "",
      jobVisible: false,
      containerEl: null,
      bpmnViewer: null,
      invokeDetailOpen: false,
      historyStack: [],
      top: -1,
      currentProcDefKey: null,
      currentProcInstId: null,
      callActivityMap: [],
      callStack: [],
      loading: false, //调用详情加载中
      curViewBox: null, //记录返回时的canvas位置以定位
      currentEle: [],
      workShow: false,
      workForm: [],
      workId: '',
      workMap: {},
      priorityOptions: priorityOptions
    };
  },
  setup(props) {
    const processPreview = ref(null);
    const invokeDetail = ref(null);
    const showDetail = ref(false);

    watch(showDetail, (newVal, oldVal) => {
      invokeDetail.value.style.cssText = newVal ? 'transform: translate(0)' : 'transform: translate(100%)';
    });

    const switchDetail = (state) => {
      showDetail.value = state;
    };
    const initForm = reactive(props.createForm.input.reduce((prev, item) => (prev[item.name] = item.value, prev), {}));

    const router = useRouter();
    const backProjectDetail = function (projectId) {
      // router.push({ path: '/ProjectPage', query: { projectId: projectId } });
      router.go(-1);
    };
    const jobRoute = function (jobId, taskId) {
      router.push({ path: '/JobPage', query: { jobId, taskId } });
    }

    return {
      Back, Refresh, svg, showDetail, processPreview, invokeDetail, initForm, backProjectDetail,
      switchDetail, FolderAdd, jobRoute
    }
  },
  methods: {
    backTaskPage() {
      this.$emit('backTaskPage');
      this.$emit('loadingPage');
    },
    closeWorkForm() {
      this.workShow = false;
      this.workForm = [];
      this.workId = '';
      this.workMap = {};
    },
    copyData(content) {
      copyTextToClipboard(content);
    },
    showJson(jsonData) {
      this.jsonData = jsonData;
      this.jsonVisible = true;
    },
    aim() {
      this.bpmnViewer.get("canvas").zoom("fit-viewport", 1);
    },
    zoom(n, x = 0, y = 0) {
      this.bpmnViewer.get("zoomScroll").zoom(n, {
        x: x,
        y: y,
      });
    },
    mouseWheel(ev) {
      if (ev.deltaY > 0) {
        this.zoom(-1, ev.offsetX, ev.offsetY);
      } else if (ev.deltaY < 0) {
        this.zoom(1, ev.offsetX, ev.offsetY);
      }
    },
    refresh() {
      this.switchDetail(false);
      this.loadingBpmnModel();
      this.loadingHistory();
    },
    loadingHistory() {
      if (this.currentProcInstId) {
        axios({
          url: nioTaskURL + "/process/history",
          method: "get",
          params: {
            procInstId: this.currentProcInstId
          },
        }).then((response) => {
          if (response.data.code === 200) {
            this.msgTable = response.data.data.activities;
          }
        }).catch(() => {
          ElMessage.error({
            message: '获取流程历史失败',
            showClose: true,
          });
        });
      } else {
        this.msgTable = []
      }
    },
    loadingInvokeDetail(activityId) {
      this.loading = true;
      axios({
        url: nioTaskURL + "/task/func-invoke/list",
        method: "post",
        data: {
          taskId: this.taskId,
          callStack: this.callStack,
          activityId: activityId,
          desc: true,
        },
      }).then((response) => {
        if (response.data.code === 200) {
          this.invokeTable = response.data.data;
        }
      }).catch(() => {
        ElMessage.error({
          message: '获取调用详情失败',
          showClose: true,
        });
      }).finally(() => {
        this.loading = false;
      });
    },
    // 返回
    backFun() {
      const history = this.historyStack.pop();
      this.currentProcDefKey = history.currentProcDefKey;
      this.currentProcInstId = history.currentProcInstId;
      this.curViewBox = history.viewbox;
      this.top--;
      this.callStack.pop();
      this.refresh();
    },
    // 动态form表单数据获取
    dynamicForm(value) {
      this.$emit("detail", value);
    },
    // tab点击函数
    tabClick(tab, event) {
      if (tab.paneName === 'first') {
      } else if (tab.paneName === "second") {
        this.refresh();
      } else if (tab.paneName === "third") {
        this.loadingJob();
      }
    },
    loadingBpmnModel() {
      this.containerEl = document.getElementById("container");
      // 避免缓存，每次清一下
      this.bpmnViewer && this.bpmnViewer.destroy();
      this.bpmnViewer = new BpmnViewer({
        container: this.containerEl,
        height: "100%",
        width: "100%",
        additionalModules: [zoomScroll, MoveCanvasModule, ModelingModule],
      });
      axios({
        url: nioTaskURL + "/process/model",
        params: {
          procDefKey: this.currentProcDefKey,
          procInstId: this.currentProcInstId,
        },
        method: "get",
      }).then((response) => {
        if (response.data.code === 200) {
          const bpmnXML = response.data.data.bpmnXML;
          const completedActivityIds = response.data.data.completedActivityIds;
          const completedSequenceFlows = response.data.data.completedSequenceFlows;
          const currentActivityIds = response.data.data.currentActivityIds;
          this.currentEle = currentActivityIds;
          const incidentMap = response.data.data.incidentMap;
          const triggerMap = response.data.data.triggerMap;
          this.callActivityMap = response.data.data.callActivityMap;
          this.workMap = response.data.data.workMap;
          const viewer = this.bpmnViewer;
          this.bpmnViewer.importXML(bpmnXML, (err) => {
            if (err) {
              console.error(err);
            } else {
              let i;
              const canvas = viewer.get("canvas");
              if (!!this.curViewBox) {
                canvas.viewbox({
                  x: this.curViewBox.x,
                  y: this.curViewBox.y,
                  width: this.curViewBox.width,
                  height: this.curViewBox.height,
                });
                this.curViewBox = null;
              } else {
                canvas.zoom("fit-viewport", 1);
              }
              const elementRegistry = viewer.get("elementRegistry");
              const modeling = viewer.get("modeling");
              const completeElements = [];
              for (i = 0; i < completedActivityIds.length; i++) {
                completeElements.push(
                    elementRegistry.get(completedActivityIds[i])
                );
              }
              for (i = 0; i < completedSequenceFlows.length; i++) {
                completeElements.push(
                    elementRegistry.get(completedSequenceFlows[i])
                );
              }
              const currentElements = [];
              for (i = 0; i < currentActivityIds.length; i++) {
                currentElements.push(
                    elementRegistry.get(currentActivityIds[i])
                );
              }
              modeling.setColor(completeElements, {
                stroke: "#ec9135",
              });
              modeling.setColor(currentElements, {
                stroke: "#5d9d52",
              });
              const overlays = viewer.get('overlays');
              for (let k in incidentMap) {
                overlays.add(elementRegistry.get(k), {
                  position: {
                    bottom: 10,
                    left: 0
                  },
                  html: '<span style="display: inline-block; min-width: 10px; padding: 3px 7px; font-size: 12px; font-weight: bold; line-height: 1; border: 1px solid black; text-align: center; white-space: nowrap; vertical-align: middle; background-color: #b94a48; border-radius: 10px;">' + incidentMap[k] + '</span>'
                });
              }
              for (let k in triggerMap) {
                overlays.add(elementRegistry.get(k), {
                  position: {
                    bottom: 10,
                    left: 0
                  },
                  html: '<span style="display: inline-block; min-width: 10px; padding: 3px 7px; font-size: 12px; font-weight: bold; line-height: 1; border: 1px solid black; text-align: center; white-space: nowrap; vertical-align: middle; background-color: #ffe2b6; border-radius: 10px;">' + triggerMap[k][0] + '</span>'
                });
                overlays.add(elementRegistry.get(k), {
                  position: {
                    bottom: 10,
                    left: 40
                  },
                  html: '<span style="display: inline-block; min-width: 10px; padding: 3px 7px; font-size: 12px; font-weight: bold; line-height: 1; border: 1px solid black; text-align: center; white-space: nowrap; vertical-align: middle; background-color: #cbe7cc; border-radius: 10px;">' + triggerMap[k][1] + '</span>'
                });
              }
              const eventBus = viewer.get("eventBus");
              const eventTypes = ["element.click"];
              const elementClick = (e) => this.elementClick(e);
              eventTypes.forEach(function (eventType) {
                eventBus.on(eventType, elementClick);
              });
            }
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '获取流程定义文件失败',
          showClose: true,
        });
      });
    },
    getValue(type) {
      if (type === 'long') return 0;
      if (type === 'boolean') return false;
      return '';
    },
    showInvokeDetail(id) {
      this.switchDetail(true);
      this.loadingInvokeDetail(id);
    },
    linkToJobPage(id) {
      axios({
        url: nioTaskURL + "/task/func-invoke/list",
        method: "post",
        data: {
          taskId: this.taskId,
          callStack: this.callStack,
          activityId: id,
          desc: true,
        },
      }).then((response) => {
        if (response.data.code === 200) {
          this.jobRoute(JSON.parse(response.data.data[0].responseContent).data, this.taskId)
        }
      }).catch(() => {
        ElMessage.error({
          message: '获取调用详情失败',
          showClose: true,
        });
      }).finally(() => {
        this.loading = false;
      });
    },
    elementClick(e) {
      if (e.element) {
        const id = e.element.id;
        this.workId = id;
        const type = e.element.type;
        const canvas = this.bpmnViewer.get('canvas');
        if ("bpmn:CallActivity" === type) {
          const history = {};
          history.currentProcDefKey = this.currentProcDefKey;
          history.currentProcInstId = this.currentProcInstId;
          history.viewbox = canvas.viewbox();
          this.historyStack.push(history);
          this.top++;
          this.callStack.push(id);
          this.currentProcDefKey = e.element.businessObject.calledElement;
          this.currentProcInstId = this.callActivityMap[id];
          this.refresh();
        }
        if ("bpmn:ServiceTask" === type) {
          //查看节点调用信息
          this.switchDetail(true);
          this.loadingInvokeDetail(id);
        } else {
          this.invokeTable = [];
        }
        if ("bpmn:UserTask" === type) {
          this.switchDetail(false);
          if (this.currentEle.indexOf(id) >= 0) {
            if (!e.element.businessObject['extensionElements']) {
              return;
            }
            const formList = e.element.businessObject['extensionElements'].values[0].$children;
            this.workForm = [];
            //生成workForm
            for (let i = 0; i < formList.length; i++) {
              this.workForm[i] = {
                type: formList[i].type,
                value: this.getValue(formList[i].type),
                options: [],
                id: formList[i].id,
                label: formList[i].label
              };
              if (formList[i].type === 'enum') {
                this.workForm[i].options = formList[i].$children.map(item => {
                  return {
                    label: item.name,
                    value: item.id,
                  };
                });
              }
            }
            this.workShow = true;
          }
        }
        if ('bpmn:Process' === type) {
          this.switchDetail(false);
        }
      }
    },
    //作业回调函数
    workHandler() {
      const variables = {};
      for (let i = 0; i < this.workForm.length; i++) {
        let item = this.workForm[i];
        if (item.value === '') {
          ElMessage.warning({
            message: '有字段未填写',
            grouping: true,
            showClose: false,
          });
          return;
        }
        variables[item.id] = item.type === 'date' ? item.value.toString() : item.value;
      }
      axios.post(nioTaskURL + `/work/complete/${this.workMap[this.workId]}`, {
        variables: variables,
      }).then(res => {
        if (res.data.code === 200) {
          ElMessage.success({
            message: '已提交作业',
            grouping: true,
            showClose: false,
          });
          this.closeWorkForm();
          this.refresh();
        }
      }).catch(err => {
        ElMessage.error({
          message: '错误：' + err.message,
          grouping: true,
          showClose: false,
        });
      });
    },
    openInvokeDetail() {
      this.showDetail = !this.showDetail;
    },
    loadingJob() {
      if (this.currentProcInstId) {
        this.jobTable = [];
        // 获取异常信息
        axios({
          url: nioTaskURL + "/task/dead-letter-job/query/" + this.currentProcInstId,
          method: "get",
        }).then((response) => {
          if (response.data.code === 200) {
            this.jobTable = response.data.data;
          }
        }).catch(() => {
          ElMessage.error({
            message: '获取异常信息失败',
            showClose: true,
          });
        });
      }
    },
    // 异常重试
    handleRetry(row) {
      this.incidentId = row.incidentId;
      this.jobVisible = true;
    },
    // 异常重试函数
    retryFun() {
      axios({
        url: nioTaskURL + "/task/dead-letter-job/retry/" + this.incidentId,
        method: "post",
      }).then((response) => {
        if (response.data.code === 200) {
          ElMessage.success({
            message: "incidentId：" + this.incidentId + "重试成功",
            showClose: true,
          });
          this.jobVisible = false;
          this.loadingJob();
        }
      }).catch(() => {
        ElMessage.error({
          message: '重试失败',
          showClose: true,
        });
      });
    },
    // 任务修改函数
    saveFun() {
      let dynamicForm = this.$refs.dynamicFormRef;
      dynamicForm.validate(isValid => {
        if (isValid) {
          dynamicForm.uploadFiles().then(res => {
            this.createForm.input = dynamicForm.form;
            //将数组类型的值改为用逗号分割
            for (let key in this.createForm.input) {
              let val = this.createForm.input[key];
              if (Array.isArray(val)) {
                this.createForm.input[key] = val.join(',');
              }
            }
            this.createForm.owner = localStorage.getItem('realName');
            // 调接口
            axios({
              url: nioTaskURL + "/task/update",
              method: "post",
              data: this.createForm,
            }).then((response) => {
              if (response.data.code === 200) {
                ElMessage.success({
                  message: '任务修改成功',
                  showClose: true,
                });
                this.$emit('backTaskPage');
                this.$emit("loadingPage");
              } else {
                throw new Error(response.data.msg);
              }
            }).catch((err) => {
              ElMessage.error({
                message: '修改失败：' + err.message,
                showClose: false,
                grouping: true,
              });
            });
          }).catch(err => {
            ElMessage.error({
              message: '文件上传失败：' + err.message,
              showClose: false,
              grouping: true,
            });
          });
        }
      });
    },
    // 调整表格高度：设置表格的最大高度
    adaptiveTableHeight() {
      this.run_table_height = document.getElementById("taskDetailTable") === null ? 0 : document.getElementById("taskDetailTable").offsetHeight;
      this.history_table_height = document.getElementById("detailCom") === null ? 0 : document.getElementById("detailCom").offsetHeight - document.getElementById("bpmn-container").offsetHeight - 160;
      this.job_table_height = document.getElementById("detailCom") === null ? 0 : document.getElementById("detailCom").offsetHeight - 100;
    },
  },
  mounted() {
    this.$refs.dynamicFormRef.changeURL(`${nioTaskURL}/task/form?code=${this.createForm.type}`);
    setTimeout(() => {
      this.adaptiveTableHeight();
    }, 100);
    this.$nextTick(() => {
      this.adaptiveTableHeight();
    });
    window.addEventListener("resize", this.adaptiveTableHeight, false);
    this.currentProcDefKey = this.procDefKey;
    this.currentProcInstId = this.procInstId;
    if(this.routeProjectId !== undefined){
      this.refresh()
    }
  },
  unmounted() {
    window.removeEventListener('resize', this.adaptiveTableHeight, false);
  }
};
</script>

<style scoped>
:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

#detailCom {
  margin: 5px 20px 5px 20px;
  height: calc(100% - 40px);
}

#bpmn-container {
  position: relative;
  height: 500px;
  border: 1px solid #ebeef5;
  margin-bottom: 10px;
  overflow: hidden;
}

#process-preview {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 0;
  position: relative;
}

#invoke-detail {
  position: absolute;
  right: 0;
  transform: translateX(100%);
  top: 0;
  width: 500px;
  height: 100%;
  border-left: 1px solid #ebeef5;
  background-color: #f6f6f6;
  transition: transform .3s;
  z-index: 100;
}

#container {
  height: 100%;
  width: 100%;
}

.push-pull {
  position: absolute;
  background-color: #f6f6f6;
  width: 25px;
  height: 100px;
  left: -25px;
  top: calc(50% - 50px);
  display: flex;
  align-items: center;
  text-align: center;
  border-left: 1px solid #ebeef5;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
}

.button-group {
  height: 32px;
  left: calc(50% - 60px);
  bottom: 0;
  position: absolute;
  font-size: 30px;
  color: #303132;
  background-color: #f6f6f6;
  border-left: 1px solid #ebeef5;
  border-top: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
  display: flex;
  cursor: pointer;
}

#detail_component {
  border: 1px solid #ebeef5;
  margin: 5px 0 10px;
  padding-top: 10px;
  height: auto;
}
</style>
