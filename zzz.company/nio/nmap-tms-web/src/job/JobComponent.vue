<template>
    <div id="JobComponent" class="component">
        <!-- 面包屑：展示任务管理 -->
        <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
            <el-breadcrumb-item>
                <div class="breadcrumbItem">工作流引擎</div>
            </el-breadcrumb-item>
            <el-breadcrumb-item @click="backJobPage">
                <div @click="changeBreadcrumb(1)"
                     :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1}"
                     class="breadcrumbItem">Job管理
                </div>
            </el-breadcrumb-item>
            <el-breadcrumb-item v-if="breadcrumbInstanceShow">
                <div @click="changeBreadcrumb(2)"
                     :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 2}"
                     class="breadcrumbItem">运行记录
                </div>
            </el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 搜索工具栏组件 -->
        <JobMetaTool v-if="!breadcrumbInstanceShow"
                     :loading="loading"
                     :jobMetaSearchForm="jobMetaSearchForm"
                     :jobTypeOptions="jobTypeOptions"
                     @onSearch="onSearch"
                     @reset="reset"
                     @handleAdd="handleAdd"
        ></JobMetaTool>
        <!-- 主表格信息组件 -->
        <JobMetaTable v-if="!breadcrumbInstanceShow"
                      :tableData="tableData"
                      :total="total"
                      @handleUpdate="handleUpdate"
                      @handleInstance="handleInstance"
                      @handlePaginationChange="handlePaginationChange"
        ></JobMetaTable>
        <!-- 资源详情表单组件 -->
        <JobMetaForm
                :jobMetaFormData="jobMetaFormData"
                :jobTypeOptions="jobTypeOptions"
                :workerTypeOptions="workerTypeOptions"
                :header="header"
                :addUpdateVisible="addUpdateVisible"
                :normalJobVisible="normalJobVisible"
                :forkJoinJobVisible="forkJoinJobVisible"
                :isAdd="isAdd"
                @onJobTypeChanged="onJobTypeChanged"
                @closeAddUpdate="closeAddUpdate"
                @addFun="addFun"
                @updateFun="updateFun"
        ></JobMetaForm>
        <JobInstanceTool v-if="breadcrumbInstanceShow"
                         :loading="loading"
                         :instanceForm="instanceForm"
                         :instanceStatusOptions="instanceStatusOptions"
                         @onInstanceSearch="onInstanceSearch"
                         @instanceReset="instanceReset"
                         @handleRun="handleRun"
        ></JobInstanceTool>
        <JobInstanceTable v-if="breadcrumbInstanceShow"
                          :instanceTableData="instanceTableData"
                          :instanceTotal="instanceTotal"
                          :routeTaskId="routeTaskId"
                          @handleInstancePaginationChange="handleInstancePaginationChange"
                          @handleInstanceDetail="handleInstanceDetail"
                          @handleInstanceCancel="handleInstanceCancel"
                          @handleTaskInstance="handleTaskInstance"
                          @handleCopyToCreate="handleCopyToCreate"
                          @handleTaskLog="handleTaskLog"
                          @backTaskDetail="backTaskDetail"
        ></JobInstanceTable>
        <JobInstanceForm
                :jobInstanceFormData="jobInstanceFormData"
                :jobInstanceVisible="jobInstanceVisible"
                :priorityOptions="priorityOptions"
                :header="header"
                :isAdd="isAdd"
                @closeRunForm="closeRunForm"
                @runFun="runFun"
        ></JobInstanceForm>
        <TaskInstanceTable
                :taskInstanceTableData="taskInstanceTableData"
                :taskInstanceVisible="taskInstanceVisible"
                @closeTaskInstance="closeTaskInstance"
        ></TaskInstanceTable>
    </div>
</template>

<script>
// 引入需要的组件
import JobMetaTool from "./JobMetaTool.vue";
import JobMetaTable from "./JobMetaTable.vue";
import JobMetaForm from "./JobMetaForm.vue";
import JobInstanceForm from "./JobInstanceForm.vue";
import JobInstanceTable from "./JobInstanceTable.vue";
import JobInstanceTool from "./JobInstanceTool.vue";
import TaskInstanceTable from "./TaskInstanceTable.vue";
// 引入js数据
import {
    engineData,
    instanceDetailData,
    instanceStatusOptions,
    jobInstanceFormData,
    jobMetaFormData,
    jobTypeOptions,
    priorityOptions,
    runInfoData,
    taskMetaFormData,
    workerTypeOptions
} from "../js/jobMeta_data.js";
import axios from "axios";
import {ElMessage} from "element-plus";
import {ArrowRight} from "@element-plus/icons-vue";
import {v4 as uuidv4} from 'uuid';
import {useStore} from "vuex";
import {reactive} from "vue";
import store from "@/store/index.js";
import { useRouter } from 'vue-router';

const scheduleURL = window.api.scheduleURL;
const grafanaURL = window.api.grafanaURL;
const namespace = window.api.namespace;
const datasource = window.api.datasource;

export default {
    name: "JobComponent",
    // 组件注册
    components: {
        JobMetaTool,
        JobMetaTable,
        JobMetaForm,
        JobInstanceForm,
        JobInstanceTable,
        JobInstanceTool,
        TaskInstanceTable
    },
    data() {
        return {
            jobMetaSearchForm: {
                code: '',
                name: '',
                type: '',
            },
            loading: false,
            // 表格数据
            tableData: [],
            // 表格总条数
            total: 0,
            // 表格当前页码
            currentPage: 1,
            // 每次表格展示多少条信息
            pageSize: 20,
            jobMetaFormData: {
                ...jobMetaFormData
            },
            jobTypeOptions: jobTypeOptions,
            workerTypeOptions: workerTypeOptions,
            jobInstanceFormData: {
                ...jobInstanceFormData
            },
            header: '编辑接口',
            addUpdateVisible: false,
            normalJobVisible: false,
            forkJoinJobVisible: false,
            jobInstanceVisible: false,
            taskInstanceVisible: false,
            isAdd: false,
            breadcrumbInstanceShow: false,
            instanceTableData: [],
            taskInstanceTableData: [],
            instanceTotal: 0,
            // 表格当前页码
            instanceCurrentPage: 1,
            // 每次表格展示多少条信息
            instancePageSize: 20,
            instanceForm: {
                jobCode: '',
                name: '',
                status: '',
                createTimeFrom: '',
                createTimeTo: '',
                id:null,
            },
            instanceDetailData: {
                ...instanceDetailData
            },
            instanceDetailVisible: false,
            instanceStatusOptions: instanceStatusOptions,
            jobId: '',
            priorityOptions: priorityOptions,
            routeTaskId: null,
        }
    },
    watch: {
      $route: {
        handler: 'handleQuery',
      },
    },
    setup() {
        const store = useStore();
        const breadcrumbActive = reactive({
            manage: true,
            detail: false
        });
        //切换面包屑
        const changeBreadcrumb = (index) => {
            store.commit('breadChange', index);
        }
        const router = useRouter()
        const backTaskDetail = function (taskId) {
          router.push({ path: '/TaskPage', query: { taskId } });
        };
        return {
            ArrowRight,
            breadcrumbActive,
            changeBreadcrumb,
            backTaskDetail
        }
    },
    methods: {
        handleQuery(route) {
          if (route.query.jobId && !isNaN(route.query.jobId)) {
            this.instanceForm.id = parseInt(route.query.jobId);
            this.instanceForm.jobCode = null;
            this.loadingInstancePage();
            this.breadcrumbInstanceShow = true
            return true;
          }
          return false;
        },
        backJobPage() {
            this.breadcrumbInstanceShow = false;
        },
        handleAdd() {
            for (let i in this.jobMetaFormData) {
                this.jobMetaFormData[i] = '';
            }
            this.jobMetaFormData.bucketCount = 1
            this.jobMetaFormData.taskMetaList = []
            this.addUpdateVisible = true;
            this.header = '添加Job';
            this.isAdd = true;
        },
        onJobTypeChanged(e) {
            if (e === 'NORMAL') {
                this.jobMetaFormData.taskMetaList = []
                let taskMeta = {...taskMetaFormData}
                taskMeta.stage = 'run'
                taskMeta.type = ''
                taskMeta.parallelism = 1
                taskMeta.backoffLimit = 3
                taskMeta.timeout = 7200
                this.jobMetaFormData.taskMetaList.push(taskMeta)
                this.normalJobVisible = true
                this.forkJoinJobVisible = false
            } else if (e === 'FORK-JOIN') {
                this.jobMetaFormData.taskMetaList = []
                let taskMeta1 = {...taskMetaFormData}
                taskMeta1.stage = 'dispatch'
                taskMeta1.type = 'dispatcher'
                taskMeta1.parallelism = 1
                taskMeta1.backoffLimit = 3
                taskMeta1.timeout = 7200
                this.jobMetaFormData.taskMetaList.push(taskMeta1)
                let taskMeta2 = {...taskMetaFormData}
                taskMeta2.stage = 'fork'
                taskMeta2.type = 'consumer'
                taskMeta2.backoffLimit = 3
                taskMeta2.timeout = 7200
                this.jobMetaFormData.taskMetaList.push(taskMeta2)
                let taskMeta3 = {...taskMetaFormData}
                taskMeta3.stage = 'join'
                taskMeta3.type = ''
                taskMeta3.parallelism = 1
                taskMeta3.backoffLimit = 3
                taskMeta3.timeout = 7200
                this.jobMetaFormData.taskMetaList.push(taskMeta3)
                this.normalJobVisible = false
                this.forkJoinJobVisible = true
            }
        },
        handleUpdate(row) {
            axios({
                url: scheduleURL + '/schedule-service/job-meta/detail?id=' + row.id,
                method: 'get'
            }).then(response => {
                if (response.data.code === 200) {
                    this.jobMetaFormData = response.data.data
                    if (this.jobMetaFormData.type === 'NORMAL') {
                        this.normalJobVisible = true
                    } else if (this.jobMetaFormData.type == 'FORK-JOIN') {
                        this.forkJoinJobVisible = true
                    }
                    this.addUpdateVisible = true
                } else {
                    ElMessage.error({
                        message: response.data.msg,
                        showClose: true,
                    });
                }
            }).catch(() => {
                ElMessage.error({
                    message: "查询Job元数据详情失败",
                    showClose: true,
                });
            });
            this.header = '编辑Job'
            this.isAdd = false
        },
        handleInstance(row) {
            this.instanceForm.jobCode = row.code
            this.jobId = row.id
            this.loadingInstancePage()
            this.breadcrumbInstanceShow = true
        },
        handleRun() {
            this.addJobInstance(null)
        },
        addJobInstance(fromJobInstance) {
            axios({
                url: scheduleURL + '/schedule-service/job-meta/detail?id=' + this.jobId,
                method: 'get'
            }).then(response => {
                if (response.data.code !== 200) {
                    ElMessage.error({
                        message: response.data.msg,
                        showClose: true,
                    });
                    return;
                }
                let data = response.data.data
                const uniqueId = uuidv4().replace(/-/g, '')
                const jobCode = data.code
                const name = ''
                const priority = 3
                const type = data.type
                let runInfos = []
                if (fromJobInstance) {
                    this.loadInstanceDetail(fromJobInstance, (jobInstanceData) => {
                        this.jobInstanceFormData = {
                            uniqueId,
                            jobCode,
                            name,
                            priority,
                            type,
                            runInfos: jobInstanceData.runInfos
                        }
                        this.jobInstanceVisible = true
                    })
                    return;
                }
                let taskMetaList = data.taskMetaList
                for (let i = 0; i < taskMetaList.length; i++) {
                    let taskMeta = taskMetaList[i];
                    let runInfo = {...runInfoData}
                    runInfo.stage = taskMeta.stage
                    runInfo.type = taskMeta.type
                    runInfo.coreEngineCode = taskMeta.coreEngineCode

                    if (taskMeta.coreEngine) {
                        let coreEngine = {...engineData}
                        coreEngine.image = taskMeta.coreEngine.image
                        coreEngine.command = taskMeta.coreEngine.command
                        coreEngine.gpu = taskMeta.coreEngine.gpu
                        coreEngine.workingDir = taskMeta.coreEngine.workingDir
                        coreEngine.mountPath = taskMeta.coreEngine.mountPath
                        coreEngine.subPath = taskMeta.coreEngine.subPath
                        if (taskMeta.coreEngine.envs) {
                            coreEngine.envs = taskMeta.coreEngine.envs
                        } else {
                            coreEngine.envs = []
                        }
                        let resources = taskMeta.coreEngine.resources
                        if (resources) {
                            coreEngine.requestCpu = resources.requests.cpu
                            coreEngine.requestMemory = resources.requests.memory
                            coreEngine.limitCpu = resources.limits.cpu
                            coreEngine.limitMemory = resources.limits.memory
                            if ('Y' === coreEngine.gpu) {
                                coreEngine.gpuCore = resources.limits['tencent.com/vcuda-core']
                                coreEngine.gpuMemory = resources.limits['tencent.com/vcuda-memory']
                            }
                        }
                        runInfo.coreEngine = coreEngine
                    }

                    runInfo.coreArgs = '[]'
                    runInfo.initEngineCode = taskMeta.initEngineCode

                    if (taskMeta.initEngine) {
                        let initEngine = {...engineData}
                        initEngine.image = taskMeta.initEngine.image
                        initEngine.command = taskMeta.initEngine.command
                        initEngine.gpu = taskMeta.initEngine.gpu
                        initEngine.workingDir = taskMeta.initEngine.workingDir
                        initEngine.mountPath = taskMeta.initEngine.mountPath
                        initEngine.subPath = taskMeta.initEngine.subPath
                        if (taskMeta.initEngine.envs) {
                            initEngine.envs = taskMeta.initEngine.envs
                        } else {
                            initEngine.envs = []
                        }
                        let resources = taskMeta.initEngine.resources
                        if (resources) {
                            initEngine.requestCpu = resources.requests.cpu
                            initEngine.requestMemory = resources.requests.memory
                            initEngine.limitCpu = resources.limits.cpu
                            initEngine.limitMemory = resources.limits.memory
                            if ('Y' === initEngine.gpu) {
                                initEngine.gpuCore = resources.limits['tencent.com/vcuda-core']
                                initEngine.gpuMemory = resources.limits['tencent.com/vcuda-memory']
                            }
                        }
                        runInfo.initEngine = initEngine
                    }

                    runInfo.initArgs = '[]'
                    runInfos.push(runInfo)
                }
                this.jobInstanceFormData = {
                    uniqueId,
                    jobCode,
                    name,
                    priority,
                    type,
                    runInfos
                }
                this.jobInstanceVisible = true
            }).catch(() => {
                ElMessage.error({
                    message: "查询Job元数据详情失败",
                    showClose: true,
                });
            });
            this.header = 'Job调试'
            this.isAdd = true
        },
        handleInstanceDetail(row) {
            this.loadInstanceDetail(row, (jobInstanceData) => {
                this.jobInstanceFormData = jobInstanceData
                this.jobInstanceVisible = true
            })
            this.header = 'Job详情'
            this.isAdd = false
        },
        loadInstanceDetail(row, callback) {
            axios({
                url: scheduleURL + '/schedule-service/job-instance/detail?id=' + row.id,
                method: 'get'
            }).then(response => {
                if (response.data.code !== 200) {
                    ElMessage.error({
                        message: response.data.msg,
                        showClose: true,
                    });
                    return;
                }
                let data = response.data.data
                const uniqueId = data.uniqueId
                const jobCode = data.jobCode
                const name = data.name
                const type = data.type
                const priority = data.priority
                const runInfos = []
                let runInfosDetail = data.runInfos
                for (let i = 0; i < runInfosDetail.length; i++) {
                    let ri = runInfosDetail[i];
                    let runInfo = {...runInfoData}
                    runInfo.stage = ri.stage
                    runInfo.type = ri.type
                    runInfo.coreEngineCode = ri.coreEngineCode
                    runInfo.coreArgs = JSON.stringify(ri.coreArgs)

                    let coreEngine = {...engineData}
                    if (ri.coreEngine) {
                        coreEngine.image = ri.coreEngine.image
                        coreEngine.command = ri.coreEngine.command
                        coreEngine.gpu = ri.coreEngine.gpu
                        coreEngine.workingDir = ri.coreEngine.workingDir
                        coreEngine.mountPath = ri.coreEngine.mountPath
                        coreEngine.subPath = ri.coreEngine.subPath
                        if (ri.coreEngine.envs) {
                            coreEngine.envs = ri.coreEngine.envs
                        } else {
                            coreEngine.envs = []
                        }
                        let resources = ri.coreEngine.resources
                        if (resources) {
                            coreEngine.requestCpu = resources.requests.cpu
                            coreEngine.requestMemory = resources.requests.memory
                            coreEngine.limitCpu = resources.limits.cpu
                            coreEngine.limitMemory = resources.limits.memory
                            if ('Y' === coreEngine.gpu) {
                                coreEngine.gpuCore = resources.limits['tencent.com/vcuda-core']
                                coreEngine.gpuMemory = resources.limits['tencent.com/vcuda-memory']
                            }
                        }
                    }
                    runInfo.coreEngine = coreEngine
                    runInfo.initEngineCode = ri.initEngineCode
                    runInfo.initArgs = JSON.stringify(ri.initArgs)
                    let initEngine = {...engineData}
                    if (ri.initEngine) {
                        initEngine.image = ri.initEngine.image
                        initEngine.command = ri.initEngine.command
                        initEngine.gpu = ri.initEngine.gpu
                        initEngine.workingDir = ri.initEngine.workingDir
                        initEngine.mountPath = ri.initEngine.mountPath
                        initEngine.subPath = ri.initEngine.subPath
                        if (ri.initEngine.envs) {
                            initEngine.envs = ri.initEngine.envs
                        } else {
                            initEngine.envs = []
                        }
                        let resources = ri.initEngine.resources
                        if (resources) {
                            initEngine.requestCpu = resources.requests.cpu
                            initEngine.requestMemory = resources.requests.memory
                            initEngine.limitCpu = resources.limits.cpu
                            initEngine.limitMemory = resources.limits.memory
                            if ('Y' === initEngine.gpu) {
                                initEngine.gpuCore = resources.limits['tencent.com/vcuda-core']
                                initEngine.gpuMemory = resources.limits['tencent.com/vcuda-memory']
                            }
                        }
                    } else {
                        initEngine = null;
                    }
                    runInfo.initEngine = initEngine
                    runInfos.push(runInfo)
                }
                callback && callback({
                    uniqueId,
                    jobCode,
                    name,
                    priority,
                    type,
                    runInfos
                })
            }).catch(() => {
                ElMessage.error({
                    message: '没有获取到数据',
                    showClose: true,
                });
            })
        },
        handleTaskInstance(jobInstanceId) {
            axios({
                url: scheduleURL + '/schedule-service/job-instance/task-instance/list?id=' + jobInstanceId,
                method: 'get'
            }).then(response => {
                if (response.data.code === 200) {
                    this.taskInstanceTableData = response.data.data
                    this.taskInstanceVisible = true
                } else {
                    ElMessage.error({
                        message: response.data.msg,
                        showClose: true,
                    });
                }
            }).catch(() => {
                ElMessage.error({
                    message: '没有获取到数据',
                    showClose: true,
                });
            })
        },
        handleCopyToCreate(row) {
            this.addJobInstance(row)
        },
        handleTaskLog(row,stage) {
          var startTimestamp = 'now-6h'
          var finishTimestamp = 'now'
          if(row.startTime){
            var startTime = new Date(row.startTime)
            startTimestamp = startTime.getTime() - 1800000
          }

          if(row.finishTime){
            var finishTime = new Date(row.finishTime)
             finishTimestamp = finishTime.getTime() + 1800000
          }
          let url = grafanaURL + '?orgId=1&var-cluster=idchl-cal&var-namespace=' + namespace +
              '&var-serviceName=' + row.jobCode +'-'+ stage +'-'+ row.id +
              '&var-host=All&var-pod=All&var-keyword=&var-keywordRegex=&var-maxCount=1000&var-container=All&from='+ startTimestamp +'&to=' + finishTimestamp;
          window.open(url)
        },
        handleInstanceCancel(jobInstanceId) {
            axios({
                url: scheduleURL + '/schedule-service/job-instance/cancel?id=' + jobInstanceId,
                method: 'post'
            }).then(response => {
                if (response.data.code === 200) {
                    ElMessage.success({
                        message: "取消成功",
                        showClose: true,
                    });
                    this.loadingInstancePage()
                } else {
                    ElMessage.error({
                        message: response.data.msg,
                        showClose: true,
                    });
                }
            }).catch(() => {
                ElMessage.error({
                    message: '取消失败',
                    showClose: true,
                });
            })
        },
        closeAddUpdate() {
            this.jobMetaFormData.id = ''
            this.jobMetaFormData.code = ''
            this.jobMetaFormData.name = ''
            this.jobMetaFormData.type = ''
            this.jobMetaFormData.bucketCount = 1
            this.jobMetaFormData.taskMetaList = []
            this.normalJobVisible = false
            this.forkJoinJobVisible = false
            this.addUpdateVisible = false
        },
        closeRunForm() {
            this.jobInstanceVisible = false
        },
        closeTaskInstance() {
            this.taskInstanceVisible = false
        },
        addFun() {
            axios({
                url: scheduleURL + '/schedule-service/job-meta/create',
                method: 'post',
                data: this.jobMetaFormData
            }).then(response => {
                if (response.data.code === 200) {
                    ElMessage.success({
                        message: "Job元数据创建成功",
                        showClose: true,
                    });
                    this.addUpdateVisible = false
                    this.loadingPage()
                } else {
                    ElMessage.error({
                        message: response.data.msg,
                        showClose: true,
                    });
                }
            }).catch(() => {
                ElMessage.error({
                    message: "Job元数据创建失败",
                    showClose: true,
                });
            });
        },
        updateFun() {
            axios({
                url: scheduleURL + '/schedule-service/job-meta/update',
                method: 'post',
                data: this.jobMetaFormData
            }).then(response => {
                if (response.data.code === 200) {
                    ElMessage.success({
                        message: "Job元数据更新成功",
                        showClose: true,
                    });
                    this.addUpdateVisible = false
                    this.loadingPage()
                } else {
                    ElMessage.error({
                        message: response.data.msg,
                        showClose: true,
                    });
                }
            }).catch(() => {
                ElMessage.error({
                    message: "Job元数据更新失败",
                    showClose: true,
                });
            });
        },
        assembleEngine(engine) {
            if (engine) {
                let requests = new Map
                requests["cpu"] = engine.requestCpu
                requests["memory"] = engine.requestMemory
                let limits = new Map
                limits["cpu"] = engine.limitCpu
                limits["memory"] = engine.limitMemory
                if ('Y' === engine.gpu) {
                    requests['tencent.com/vcuda-core'] = engine.gpuCore;
                    requests['tencent.com/vcuda-memory'] = engine.gpuMemory;
                    limits['tencent.com/vcuda-core'] = engine.gpuCore;
                    limits['tencent.com/vcuda-memory'] = engine.gpuMemory;
                }
                let resources = new Map
                resources["requests"] = requests;
                resources["limits"] = limits;
                engine.resources = resources;
            }
        },
        runFun() {
            let runInfos = this.jobInstanceFormData.runInfos
            let runInfoParam = []
            for (let i = 0; i < runInfos.length; i++) {
                let coreEngine = runInfos[i].coreEngine
                this.assembleEngine(coreEngine)
                let initEngine = runInfos[i].initEngine
                this.assembleEngine(initEngine)
                runInfoParam.push({
                    stage: runInfos[i].stage,
                    coreEngine: coreEngine,
                    coreArgs: JSON.parse(runInfos[i].coreArgs),
                    initEngine: initEngine,
                    initArgs: JSON.parse(runInfos[i].initArgs)
                })
            }
            axios({
                url: scheduleURL + '/schedule-service/job-instance/run',
                method: 'post',
                data: {
                    uniqueId: this.jobInstanceFormData.uniqueId,
                    jobCode: this.jobInstanceFormData.jobCode,
                    name: this.jobInstanceFormData.name,
                    priority: this.jobInstanceFormData.priority,
                    runInfos: runInfoParam
                }
            }).then(response => {
                if (response.data.code === 200) {
                    ElMessage.success({
                        message: "Job已启动运行",
                        showClose: true,
                    });
                    this.jobInstanceVisible = false
                    this.loadingInstancePage()
                } else {
                    ElMessage.error({
                        message: response.data.msg,
                        showClose: true,
                    });
                }
            }).catch(() => {
                ElMessage.error({
                    message: "Job启动运行失败",
                    showClose: true,
                });
            });
        },
        // 筛选查询功能
        onSearch() {
            this.currentPage = 1
            this.loadingPage()
        },
        // 筛选查询功能
        onInstanceSearch() {
            this.instanceCurrentPage = 1
            this.loadingInstancePage()
        },
        // 重置功能
        reset() {
            this.jobMetaSearchForm.code = ''
            this.jobMetaSearchForm.name = ''
            this.jobMetaSearchForm.type = ''
        },
        // 重置功能
        instanceReset() {
            this.instanceForm = {
                id: '',
                jobCode: this.instanceForm.jobCode,
                code: '',
                name: '',
                status: '',
                createTimeFrom: '',
                createTimeTo: ''
            };
        },
        // 获取表格信息功能
        loadingPage() {
            if (this.loading) {
                return;
            }
            this.loading = true;
            axios({
                url: scheduleURL + '/schedule-service/job-meta/query',
                method: 'post',
                data: {
                    ...this.jobMetaSearchForm,
                    pageSize: this.pageSize,
                    pageNo: this.currentPage,
                }
            }).then(response => {
                this.loading = false;
                if (response.data.code === 200) {
                    this.total = response.data.data.total
                    this.tableData = response.data.data.result
                } else {
                    ElMessage.error({
                        message: response.data.msg,
                        showClose: true,
                    });
                }
            }).catch(() => {
                this.loading = false;
                ElMessage.error({
                    message: '没有获取到数据',
                    showClose: true,
                });
            })
        },
        // 获取表格信息功能
        loadingInstancePage() {
            if (this.loading) {
                return;
            }
            this.loading = true;
            axios({
                url: scheduleURL + '/schedule-service/job-instance/query',
                method: 'post',
                data: {
                    ...this.instanceForm,
                    pageSize: this.instancePageSize,
                    pageNo: this.instanceCurrentPage,
                }
            }).then(response => {
                this.loading = false;
                if (response.data.code === 200) {
                    this.instanceTotal = response.data.data.total
                    this.instanceTableData = response.data.data.result
                } else {
                    ElMessage.error({
                        message: response.data.msg,
                        showClose: true,
                    });
                }
            }).catch(() => {
                this.loading = false;
                ElMessage.error({
                    message: '没有获取到数据',
                    showClose: true,
                });
            })
        },
        handlePaginationChange(currentPage, pageSize) {
            this.currentPage = currentPage;
            this.pageSize = pageSize;
            this.loadingPage()
        },
        handleInstancePaginationChange(currentPage, pageSize) {
            this.instanceCurrentPage = currentPage;
            this.instancePageSize = pageSize;
            this.loadingInstancePage()
        },
    },
    mounted() {
        this.handleQuery(this.$route);
        this.routeTaskId = this.$route['query'].taskId;
        // 页面加载时调用函数
        this.loadingPage()
    }
}
</script>

