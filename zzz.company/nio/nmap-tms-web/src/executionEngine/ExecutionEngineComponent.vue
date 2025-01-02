<template>
    <div id="ExecutionEngineComponent" class="component">
        <!-- 面包屑：展示任务管理 -->
        <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
            <el-breadcrumb-item>
                <div class="breadcrumbItem">工作流引擎</div>
            </el-breadcrumb-item>
            <el-breadcrumb-item @click="backExecutionEnginePage">
                <div @click="changeBreadcrumb(1)"
                     :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1}"
                     class="breadcrumbItem">引擎管理
                </div>
            </el-breadcrumb-item>
            <el-breadcrumb-item v-if="envShow">
                <div @click="changeBreadcrumb(2)"
                     :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 2}"
                     class="breadcrumbItem">环境变量
                </div>
            </el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 搜索工具栏组件 -->
        <ExecutionEngineTool v-if="mainShow"
                             :searchForm="searchForm"
                             @onSearch="onSearch"
                             @reset="reset"
                             @handleAdd="handleAdd"
        ></ExecutionEngineTool>
        <!-- 主表格信息组件 -->
        <ExecutionEngineTable v-if="mainShow"
                              :tableData="tableData"
                              :total="total"
                              @handleUpdate="handleUpdate"
                              @handleEnv="handleEnv"
                              @handlePaginationChange="handlePaginationChange"
        ></ExecutionEngineTable>
        <!-- 资源详情表单组件 -->
        <ExecutionEngineForm
                :formData="formData"
                :header="header"
                :addUpdateVisible="addUpdateVisible"
                :isAdd="isAdd"
                @closeAddUpdate="closeAddUpdate"
                @addFun="addFun"
                @updateFun="updateFun"
        ></ExecutionEngineForm>
        <EngineEnv v-if="envShow"
                   :formData="formData"
                   :envDate="envDate"
                   @loadingEnv="loadingEnv"></EngineEnv>
    </div>
</template>

<script>
// 引入需要的组件
import ExecutionEngineTool from "./ExecutionEngineTool.vue";
import ExecutionEngineTable from "./ExecutionEngineTable.vue";
import ExecutionEngineForm from "./ExecutionEngineForm.vue";
// 引入js数据
import {formData} from "../js/executionEngine_data";
import axios from "axios";
import {ElMessage} from "element-plus";
import {ArrowRight} from "@element-plus/icons-vue";
import {useStore} from "vuex";
import {reactive} from "vue";
import store from "@/store/index.js";
import EngineEnv from "@/executionEngine/EngineEnv.vue";

const scheduleURL = window.api.scheduleURL;

export default {
    name: "ExecutionEngineComponent",
    // 组件注册
    components: {
        EngineEnv,
        ExecutionEngineTool,
        ExecutionEngineTable,
        ExecutionEngineForm
    },
    data() {
        return {
            mainShow: true,
            envShow: false,
            searchForm: {
                code: '',
                name: '',
            },
            // 表格数据
            tableData: [],
            // 表格总条数
            total: 0,
            // 表格当前页码
            currentPage: 1,
            // 每次表格展示多少条信息
            pageSize: 20,
            formData: {
                ...formData
            },
            header: '编辑接口',
            addUpdateVisible: false,
            isAdd: false,
            envDate: [],
        }
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
        return {
            ArrowRight,
            breadcrumbActive,
            changeBreadcrumb,
        }
    },
    methods: {
        backExecutionEnginePage() {
            this.mainShow = true;
            this.envShow = false;
        },
        handleAdd() {
            for (let i in this.formData) {
                this.formData[i] = '';
            }
            this.formData.resources = null
            this.addUpdateVisible = true;
            this.header = '添加引擎';
            this.isAdd = true;
        },
        handleUpdate(row) {
            axios({
                url: scheduleURL + '/schedule-service/execution-engine/detail?id=' + row.id,
                method: 'get'
            }).then(response => {
                if (response.data.code === 200) {
                    this.formData = response.data.data
                    let resources = response.data.data.resources
                    if (resources) {
                        this.formData.requestCpu = resources.requests.cpu
                        this.formData.requestMemory = resources.requests.memory
                        this.formData.limitCpu = resources.limits.cpu
                        this.formData.limitMemory = resources.limits.memory
                        if ('Y' === this.formData.gpu) {
                            this.formData.gpuCore = resources.limits['tencent.com/vcuda-core']
                            this.formData.gpuMemory = resources.limits['tencent.com/vcuda-memory']
                        }
                    }
                    this.formData.resources = null
                    this.addUpdateVisible = true
                }
            }).catch(() => {
                ElMessage.error({
                    message: "查询引擎详情失败",
                    showClose: true,
                });
            });
            this.header = '编辑引擎'
            this.isAdd = false
        },
        handleEnv(row) {
            this.envShow = true;
            this.mainShow = false;
            this.formData = row;
            this.pageName = "环境变量列表";
            this.loadingEnv();
            store.commit('breadChange', 2);
        },
        closeAddUpdate() {
            this.addUpdateVisible = false
        },
        assembleResource() {
            let requests = new Map
            requests["cpu"] = this.formData.requestCpu
            requests["memory"] = this.formData.requestMemory
            let limits = new Map
            limits["cpu"] = this.formData.limitCpu
            limits["memory"] = this.formData.limitMemory
            if ('Y' === this.formData.gpu) {
                requests['tencent.com/vcuda-core'] = this.formData.gpuCore;
                requests['tencent.com/vcuda-memory'] = this.formData.gpuMemory;
                limits['tencent.com/vcuda-core'] = this.formData.gpuCore;
                limits['tencent.com/vcuda-memory'] = this.formData.gpuMemory;
            }
            let resources = new Map
            resources["requests"] = requests;
            resources["limits"] = limits;
            this.formData.resources = resources;
        },
        addFun() {
            this.assembleResource();
            axios({
                url: scheduleURL + '/schedule-service/execution-engine/create',
                method: 'post',
                data: this.formData
            }).then(response => {
                if (response.data.code === 200) {
                    ElMessage.success({
                        message: "引擎创建成功",
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
                    message: "引擎创建失败",
                    showClose: true,
                });
            });
        },
        updateFun() {
            this.assembleResource();
            axios({
                url: scheduleURL + '/schedule-service/execution-engine/update',
                method: 'post',
                data: this.formData
            }).then(response => {
                if (response.data.code === 200) {
                    ElMessage.success({
                        message: "引擎更新成功",
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
                    message: "引擎更新失败",
                    showClose: true,
                });
            });
        },
        // 筛选查询功能
        onSearch() {
            this.currentPage = 1
            this.loadingPage()
        },
        // 重置功能
        reset() {
            this.searchForm.code = ''
            this.searchForm.name = ''
        },
        // 获取表格信息功能
        loadingPage() {
            axios({
                url: scheduleURL + '/schedule-service/execution-engine/query',
                method: 'post',
                data: {
                    ...this.searchForm,
                    pageSize: this.pageSize,
                    pageNo: this.currentPage,
                }
            }).then(response => {
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
                ElMessage.error({
                    message: '没有获取到数据',
                    showClose: true,
                });
            })
        },
        loadingEnv() {
            axios({
                url: scheduleURL + "/schedule-service/execution-engine/env/list?engineId=" + this.formData.id,
                method: "get",
            }).then((response) => {
                if (response.data.code === 200) {
                    this.envDate = response.data.data;
                }
            }).catch(() => {
                ElMessage.error({
                    message: '获取环境变量列表失败',
                    showClose: true,
                });
            });
        },
        handlePaginationChange(currentPage, pageSize) {
            this.currentPage = currentPage;
            this.pageSize = pageSize;
            this.loadingPage()
        },
    },
    mounted() {
        // 页面加载时调用函数
        this.loadingPage()
    }
}
</script>

