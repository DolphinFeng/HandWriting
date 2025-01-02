<template>
  <!-- 搜索工具栏组件 -->
    <div>
        <div id="workTool">
            <el-form inline style="font-weight: 700" :data="work_search" label-position="right" label-width="100px"
                     ref="form" id="formDiv" @submit.prevent="onSearch">
                <el-form-item label="任 务 号：">
                    <el-input style="width: 160px" v-model.trim="work_search.taskId" placeholder="请输入任务号"
                              @change="changeNum(1)" clearable></el-input>
                </el-form-item>
                <el-form-item label="任务类型：">
                    <el-select style="width: 160px" v-model="work_search.taskType" placeholder="请选择任务类型"
                               clearable @change="changeStep">
                        <el-option
                                v-for="item in taskTypeOptions"
                                :key="item.code"
                                :label="item.name"
                                :value="item.code">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="作业名称：">
                    <el-input style="width: 160px" v-model.trim="work_search.workName" placeholder="请选择作业名称"
                              clearable></el-input>
                </el-form-item>
                <el-form-item label="作业状态：">
                    <el-select style="width: 160px" v-model="work_search.workStatus" placeholder="请选择作业状态"
                               clearable>
                        <el-option
                                v-for="item in workStatusOptions"
                                :key="item.code"
                                :label="item.name"
                                :value="item.code">
                        </el-option>
                    </el-select>
                </el-form-item>
              <el-form-item label="作业标签：">
                <el-select style="width: 160px" v-model="work_search.workTagKey" placeholder="请选择作业标签"
                           clearable>
                  <el-option
                      v-for="item in workTagOptions"
                      :key="item.code"
                      :label="item.name"
                      :value="item.code">
                  </el-option>
                </el-select>
              </el-form-item>
                <el-form-item label="作业员id：">
                    <el-input style="width: 160px" v-model.trim="work_search.assignee" placeholder="请输入作业员id"
                              clearable></el-input>
                </el-form-item>
                <el-form-item label="创建时间：">
                    <el-date-picker
                            v-model="dateValue.workCreate"
                            type="datetimerange"
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            style="width: 452px"
                            range-separator="至"
                            start-placeholder="作业创建时间区间开始"
                            end-placeholder="作业创建时间区间结束">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="开始时间：">
                    <el-date-picker
                            v-model="dateValue.workStart"
                            type="datetimerange"
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            style="width: 452px"
                            range-separator="至"
                            start-placeholder="作业开始时间区间开始"
                            end-placeholder="作业开始时间区间结束">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="完成时间：">
                    <el-date-picker
                            v-model="dateValue.workComplete"
                            type="datetimerange"
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            style="width: 452px"
                            range-separator="至"
                            start-placeholder="作业完成时间区间开始"
                            end-placeholder="作业完成时间区间结束">
                    </el-date-picker>
                </el-form-item>
                <div style="height: 36px;">
                    <el-button :icon="Search" type="primary" native-type="submit" v-if="workShow.workSearchShow">
                        查询
                    </el-button>
                    <el-button :icon="Refresh" @click="resetForm" v-if="workShow.workSearchShow">
                        重置
                    </el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script>
import {Search, Refresh, FolderAdd, RefreshRight} from "@element-plus/icons-vue";

const nioTaskURL = window.api.nioTaskURL;
if (nioTaskURL === null || nioTaskURL === undefined) {
    console.log("获取nioTaskURL失败" + nioTaskURL)
}

export default {
    name: "workTool",
    // 接收父组件传来的参数
    props: {
        work_search: Object,
        taskTypeOptions: Array,
        workStatusOptions: Array,
        workTagOptions: Array,
        workNameOptions: Array,
        workShow: Object,
    },
    data() {
        return {
            dateValue: {
                workCreate: '',
                workStart: '',
                workComplete: '',
            }
        }
    },
    setup() {
        return {
            Search, Refresh, FolderAdd, RefreshRight,
        }
    },
    methods: {
        changeStep(value) {
            this.$emit('changeStep', value)
        },
        // 数字检查函数
        changeNum(val) {
            this.$emit('changeNum', val)
        },
        // 筛选查询功能
        onSearch() {
            console.log('onsearch')
            for (let i in this.dateValue) {
                if (this.dateValue[i] !== null && this.dateValue[i].length !== 0) {
                    this.work_search[i + 'TimeFrom'] = this.dateValue[i][0]
                    this.work_search[i + 'TimeTo'] = this.dateValue[i][1]
                } else {
                    this.work_search[i + 'TimeFrom'] = ''
                    this.work_search[i + 'TimeTo'] = ''
                }
            }
            this.$emit('onSearch')
        },
        // 重置功能
        resetForm() {
            this.dateValue = {
                workCreate: '',
                workStart: '',
                workComplete: '',
            }
            this.$emit('resetForm')
        },
        handleAssign() {
            this.$emit('handleAssign')
        },
        // 清空排序
        clearOrders() {
            this.$emit('clearOrders')
        }
    },
}
</script>

<style scoped>
#workTool {
    padding: 5px 0 5px 20px;
    text-align: left;
    color: black;
    font-size: 15px;
}

.el-form-item {
    margin-bottom: 10px;
}
</style>
