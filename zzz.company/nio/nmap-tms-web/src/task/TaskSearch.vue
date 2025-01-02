<template>
  <!-- 搜索工具栏组件 -->
    <div id="taskTool">
        <el-form inline :data="task_search" label-position="right" label-width="100px" style="font-weight: 700"
                 ref="form" id="formDiv" @submit.prevent="onSearch">
            <el-form-item label="任 务 号：">
                <el-input v-model.trim="task_search.id" placeholder="请输入任务号" style="width: 160px"
                          @change="changeNum(1)" clearable></el-input>
            </el-form-item>
            <el-form-item label="父任务号：">
                <el-input v-model.trim="task_search.parentId" placeholder="请输入父任务号" style="width: 160px"
                          @change="changeNum(4)" clearable></el-input>
            </el-form-item>
            <el-form-item label="任务名称：">
                <el-input v-model.trim="task_search.name" placeholder="请输入任务名称" style="width: 160px"
                          clearable></el-input>
            </el-form-item>
            <el-form-item label="任务类型：">
                <el-select filterable v-model="task_search.type" placeholder="请选择任务类型" style="width: 160px" clearable>
                    <el-option
                            v-for="item in taskTypeOptions"
                            :key="item.code"
                            :label="item.name"
                            :value="item.code">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="任务状态：">
                <el-select v-model="task_search.status" placeholder="请选择任务状态" style="width: 160px" clearable>
                    <el-option
                            v-for="item in statusOptions"
                            :key="item.code"
                            :label="item.name"
                            :value="item.code">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="优 先 级：">
                <el-select v-model="task_search.priority" placeholder="请选择优先级" style="width: 160px" clearable>
                    <el-option
                            v-for="item in priorityOptions"
                            :key="item.code"
                            :label="item.name"
                            :value="item.code">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="创 建 人：">
                <el-input v-model.trim="task_search.owner" placeholder="请输入创建人" style="width: 160px"
                          clearable></el-input>
            </el-form-item>
            <el-form-item label="创建时间：">
                <el-date-picker
                        v-model="dateCreateValue"
                        type="datetimerange"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 452px"
                        range-separator="至"
                        start-placeholder="任务创建时间区间开始"
                        end-placeholder="任务创建时间区间结束">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="启动时间：">
                <el-date-picker
                        v-model="dateStartValue"
                        type="datetimerange"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 452px"
                        range-separator="至"
                        start-placeholder="任务启动时间区间开始"
                        end-placeholder="任务启动时间区间结束">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="完成时间：">
                <el-date-picker
                        v-model="dateFinishValue"
                        type="datetimerange"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 452px"
                        range-separator="至"
                        start-placeholder="任务完成时间区间开始"
                        end-placeholder="任务完成时间区间结束">
                </el-date-picker>
            </el-form-item>
            <div style="height: 36px;">
                <el-button :icon="Search" type="primary" native-type="submit" v-if="pmsShow.pmsSearchShow">查询</el-button>
                <el-button :icon="Refresh" @click="resetForm" v-if="pmsShow.pmsSearchShow">重置</el-button>
                <el-button :icon="FolderAdd" type="success" @click="createButton" v-if="pmsShow.pmsCreateShow">创建任务
                </el-button>
                <el-button :icon="Delete" type="danger" @click="cancelButton" v-if="pmsShow.pmsCancelShow">取消任务
                </el-button>
            </div>
        </el-form>
    </div>
</template>

<script>
import {Search, Refresh, FolderAdd, Delete, RefreshRight} from '@element-plus/icons-vue';

const nioTaskURL = window.api.nioTaskURL;
if (nioTaskURL === null || nioTaskURL === undefined) {
    console.log("获取nioTaskURL失败" + nioTaskURL)
}

export default {
    name: "TaskSearch",
    // 接收父组件传来的参数
    props: {
        task_search: Object,
        taskTypeOptions: Array,
        priorityOptions: Array,
        statusOptions: Array,
        pmsShow: Object,
    },
    data() {
        return {
            // 时间选择器绑定的数据
            dateCreateValue: '',
            dateStartValue: '',
            dateFinishValue: '',
        }
    },
    setup() {
        return {
            Search, Refresh, FolderAdd, Delete, RefreshRight,
        }
    },
    methods: {
        // 数字检查函数
        changeNum(val) {
            this.$emit('changeNum', val)
        },
        // 筛选查询功能
        onSearch() {
            if (this.dateCreateValue !== null && this.dateCreateValue.length !== 0) {
                this.task_search.createTimeFrom = this.dateCreateValue[0]
                this.task_search.createTimeTo = this.dateCreateValue[1]
            } else {
                this.task_search.createTimeFrom = ''
                this.task_search.createTimeTo = ''
            }
            if (this.dateStartValue !== null && this.dateStartValue.length !== 0) {
                this.task_search.startTimeFrom = this.dateStartValue[0]
                this.task_search.startTimeTo = this.dateStartValue[1]
            } else {
                this.task_search.startTimeFrom = ''
                this.task_search.startTimeTo = ''
            }
            if (this.dateFinishValue !== null && this.dateFinishValue.length !== 0) {
                this.task_search.finishTimeFrom = this.dateFinishValue[0]
                this.task_search.finishTimeTo = this.dateFinishValue[1]
            } else {
                this.task_search.finishTimeFrom = ''
                this.task_search.finishTimeTo = ''
            }
            this.$emit('onSearch')
        },
        // 重置功能
        resetForm() {
            this.dateCreateValue = ''
            this.dateStartValue = ''
            this.dateFinishValue = ''
            this.$emit('resetForm')
        },
        // 创建任务按钮
        createButton() {
            this.$emit('createButton')
        },
        // 取消任务按钮
        cancelButton() {
            this.$emit('cancelButton')
        },
        // 清空排序
        clearOrders() {
            this.$emit('clearOrders')
        }
    },
}
</script>

<style scoped>
#taskTool {
    padding: 5px 0 5px 20px;
    text-align: left;
    color: black;
    font-size: 15px;
}

.el-form-item {
    margin-bottom: 10px;
}

</style>
