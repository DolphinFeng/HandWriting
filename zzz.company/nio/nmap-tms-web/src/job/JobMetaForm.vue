<template>
  <!-- 资源详情表单组件 -->
    <div>
        <!-- 对话框 -->
        <el-dialog
                :title="header"
                v-model="showDialog"
                @close="closeAddUpdate"
                show-close
                width="1000px"
                destroy-on-close>
            <div style="margin: 0 30px 0 10px">
                <el-form inline :model="jobMetaFormData" :rules="rules" ref="form" label-position="right"
                         label-width="120px"
                         id="formId">
                    <el-form-item label="Job编码：" prop="code">
                        <el-input v-if="isAdd" v-model="jobMetaFormData.code" placeholder="请填写Job编码"
                                  style="width:220px"
                                  clearable></el-input>
                        <el-input v-else v-model="jobMetaFormData.code" style="width:220px" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="Job名称：" prop="name">
                        <el-input v-model="jobMetaFormData.name" placeholder="请填写Job名称" style="width:220px"
                                  clearable></el-input>
                    </el-form-item>
                    <el-form-item label="Job类型：" prop="type">
                        <el-select v-if="isAdd" v-model="jobMetaFormData.type" placeholder="请选择Job类型"
                                   style="width: 220px"
                                   clearable
                                   @change="onJobTypeChanged(jobMetaFormData.type)">
                            <el-option
                                    v-for="item in jobTypeOptions"
                                    :key="item.code"
                                    :label="item.name"
                                    :value="item.code">
                            </el-option>
                        </el-select>
                        <el-input v-else v-model="jobMetaFormData.type" style="width:220px" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="执行桶个数：" prop="bucketCount">
                        <el-input-number v-model="jobMetaFormData.bucketCount" controls-position="right"
                                         :min="1"
                                         style="width:220px"></el-input-number>
                    </el-form-item>
                    <el-divider v-if="normalJobVisible" content-position="left">
                        阶段1：{{ jobMetaFormData.taskMetaList[0].stage }}
                    </el-divider>
                    <el-tabs type="border-card" v-if="normalJobVisible">
                        <el-tab-pane label="核心引擎">
                            <el-form-item label="执行类型：" v-if="normalJobVisible" prop="taskMetaList[0].type">
                                <el-select v-model="jobMetaFormData.taskMetaList[0].type" placeholder="请选择执行类型"
                                           style="width: 220px"
                                           clearable>
                                    <el-option
                                            v-for="item in workerTypeOptions"
                                            :key="item.code"
                                            :label="item.name"
                                            :value="item.code">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="引擎编码：" v-if="normalJobVisible" prop="taskMetaList[0].engineCode">
                                <el-input v-model="jobMetaFormData.taskMetaList[0].coreEngineCode"
                                          placeholder="请填写引擎编码"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                            <el-form-item label="超时时间：" v-if="normalJobVisible" prop="taskMetaList[0].timeout">
                                <el-input v-model="jobMetaFormData.taskMetaList[0].timeout" placeholder="请选择超时时间"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                            <el-form-item label="补偿次数：" v-if="normalJobVisible" prop="taskMetaList[0].backoffLimit">
                                <el-input v-model="jobMetaFormData.taskMetaList[0].backoffLimit"
                                          placeholder="请选择补偿次数"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                        </el-tab-pane>
                        <el-tab-pane label="初始化引擎">
                            <el-form-item label="引擎编码：" v-if="normalJobVisible"
                                          prop="taskMetaList[0].initEngineCode">
                                <el-input v-model="jobMetaFormData.taskMetaList[0].initEngineCode"
                                          placeholder="请填写引擎编码"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                            <el-form-item label="共享目录：" v-if="normalJobVisible" prop="taskMetaList[0].shareDir">
                                <el-input v-model="jobMetaFormData.taskMetaList[0].shareDir"
                                          placeholder="请填写共享目录"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                        </el-tab-pane>
                    </el-tabs>
                    <el-divider v-if="forkJoinJobVisible" content-position="left">阶段1：{{
                        jobMetaFormData.taskMetaList[0].stage
                        }}
                    </el-divider>
                    <el-tabs type="border-card" v-if="forkJoinJobVisible">
                        <el-tab-pane label="核心引擎">
                            <el-form-item label="执行类型：" v-if="forkJoinJobVisible" prop="taskMetaList[0].type">
                                <el-input v-model="jobMetaFormData.taskMetaList[0].type" style="width:220px"
                                          disabled></el-input>
                            </el-form-item>
                            <el-form-item label="执行引擎：" v-if="forkJoinJobVisible" prop="taskMetaList[0].engineCode">
                                <el-input v-model="jobMetaFormData.taskMetaList[0].coreEngineCode"
                                          placeholder="请选择执行引擎"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                            <el-form-item label="超时时间：" v-if="forkJoinJobVisible" prop="taskMetaList[0].timeout">
                                <el-input v-model="jobMetaFormData.taskMetaList[0].timeout" placeholder="请选择超时时间"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                            <el-form-item label="补偿次数：" v-if="forkJoinJobVisible"
                                          prop="taskMetaList[0].backoffLimit">
                                <el-input v-model="jobMetaFormData.taskMetaList[0].backoffLimit"
                                          placeholder="请选择补偿次数"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                        </el-tab-pane>
                        <el-tab-pane label="初始化引擎">
                            <el-form-item label="引擎编码：" v-if="forkJoinJobVisible"
                                          prop="taskMetaList[0].initEngineCode">
                                <el-input v-model="jobMetaFormData.taskMetaList[0].initEngineCode"
                                          placeholder="请填写引擎编码"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                            <el-form-item label="共享目录：" v-if="forkJoinJobVisible" prop="taskMetaList[0].shareDir">
                                <el-input v-model="jobMetaFormData.taskMetaList[0].shareDir"
                                          placeholder="请填写共享目录"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                        </el-tab-pane>
                    </el-tabs>
                    <el-divider v-if="forkJoinJobVisible" content-position="left">阶段2：{{
                        jobMetaFormData.taskMetaList[1].stage
                        }}
                    </el-divider>
                    <el-tabs type="border-card" v-if="forkJoinJobVisible">
                        <el-tab-pane label="核心引擎">
                            <el-form-item label="执行类型：" v-if="forkJoinJobVisible" prop="taskMetaList[1].type">
                                <el-input v-model="jobMetaFormData.taskMetaList[1].type" style="width:220px"
                                          disabled></el-input>
                            </el-form-item>
                            <el-form-item label="执行引擎：" v-if="forkJoinJobVisible" prop="taskMetaList[1].engineCode">
                                <el-input v-model="jobMetaFormData.taskMetaList[1].coreEngineCode"
                                          placeholder="请选择执行引擎"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                            <el-form-item label="超时时间：" v-if="forkJoinJobVisible" prop="taskMetaList[1].timeout">
                                <el-input v-model="jobMetaFormData.taskMetaList[1].timeout" placeholder="请选择超时时间"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                            <el-form-item label="补偿次数：" v-if="forkJoinJobVisible"
                                          prop="taskMetaList[1].backoffLimit">
                                <el-input v-model="jobMetaFormData.taskMetaList[1].backoffLimit"
                                          placeholder="请选择补偿次数"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                            <el-form-item label="最大并发数：" v-if="forkJoinJobVisible"
                                          prop="taskMetaList[1].parallelism">
                                <el-input v-model="jobMetaFormData.taskMetaList[1].parallelism"
                                          placeholder="请填写并发个数"
                                          style="width:220px"
                                          clearable @input="changeNum(1)"></el-input>
                            </el-form-item>
                        </el-tab-pane>
                        <el-tab-pane label="初始化引擎">
                            <el-form-item label="引擎编码：" v-if="forkJoinJobVisible"
                                          prop="taskMetaList[1].initEngineCode">
                                <el-input v-model="jobMetaFormData.taskMetaList[1].initEngineCode"
                                          placeholder="请填写引擎编码"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                            <el-form-item label="共享目录：" v-if="forkJoinJobVisible" prop="taskMetaList[0].shareDir">
                                <el-input v-model="jobMetaFormData.taskMetaList[1].shareDir"
                                          placeholder="请填写共享目录"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                        </el-tab-pane>
                    </el-tabs>
                    <el-divider v-if="forkJoinJobVisible" content-position="left">阶段3：{{
                        jobMetaFormData.taskMetaList[2].stage
                        }}
                    </el-divider>
                    <el-tabs type="border-card" v-if="forkJoinJobVisible">
                        <el-tab-pane label="核心引擎">
                            <el-form-item label="执行类型：" v-if="forkJoinJobVisible" prop="taskMetaList[2].type">
                                <el-select v-model="jobMetaFormData.taskMetaList[2].type" placeholder="请选择执行类型"
                                           style="width: 220px"
                                           clearable>
                                    <el-option
                                            v-for="item in workerTypeOptions"
                                            :key="item.code"
                                            :label="item.name"
                                            :value="item.code">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="执行引擎：" v-if="forkJoinJobVisible" prop="taskMetaList[2].engineCode">
                                <el-input v-model="jobMetaFormData.taskMetaList[2].coreEngineCode"
                                          placeholder="请选择执行引擎"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                            <el-form-item label="超时时间：" v-if="forkJoinJobVisible" prop="taskMetaList[2].timeout">
                                <el-input v-model="jobMetaFormData.taskMetaList[2].timeout" placeholder="请选择超时时间"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                            <el-form-item label="补偿次数：" v-if="forkJoinJobVisible"
                                          prop="taskMetaList[2].backoffLimit">
                                <el-input v-model="jobMetaFormData.taskMetaList[2].backoffLimit"
                                          placeholder="请选择补偿次数"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                        </el-tab-pane>
                        <el-tab-pane label="初始化引擎">
                            <el-form-item label="引擎编码：" v-if="forkJoinJobVisible"
                                          prop="taskMetaList[2].initEngineCode">
                                <el-input v-model="jobMetaFormData.taskMetaList[2].initEngineCode"
                                          placeholder="请填写引擎编码"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                            <el-form-item label="共享目录：" v-if="forkJoinJobVisible" prop="taskMetaList[0].shareDir">
                                <el-input v-model="jobMetaFormData.taskMetaList[2].shareDir"
                                          placeholder="请填写共享目录"
                                          style="width:220px"
                                          clearable></el-input>
                            </el-form-item>
                        </el-tab-pane>
                    </el-tabs>
                </el-form>
            </div>
            <template #footer class="dialog-footer">
                <el-button @click="closeAddUpdate" style="width: 120px">取消</el-button>
                <el-button type="primary" v-if="isAdd" @click="addFun" style="margin-left: 30px;width: 120px">保存
                </el-button>
                <el-button type="primary" v-else @click="updateFun" style="margin-left: 30px;width: 120px">保存
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script>

export default {
    name: "JobMetaForm",
    // 接收父组件传来的参数
    props: {
        jobMetaFormData: Object,
        jobTypeOptions: Array,
        workerTypeOptions: Array,
        header: String,
        addUpdateVisible: Boolean,
        isAdd: Boolean,
        normalJobVisible: Boolean,
        forkJoinJobVisible: Boolean
    },
    computed: {
        showDialog: {
            get() {
                return this.addUpdateVisible;
            },
            set(value) {
            }
        }
    },
    data() {
        return {
            height: '400px',
            rules: {
                code: [
                    {required: true, message: 'JOB编码必填', trigger: 'blur'},
                ],
                name: [
                    {required: true, message: 'JOB名称必填', trigger: 'blur'},
                ],
                type: [
                    {required: true, message: 'JOB类型必填', trigger: 'blur'},
                ],
                bucketCount: [
                    {required: true, message: '执行桶个数必填', trigger: 'blur'},
                ],
                'taskMetaList[0].type': [
                    {required: true, message: '执行类型必填', trigger: 'blur'},
                ],
                'taskMetaList[0].coreEngineCode': [
                    {required: true, message: '执行引擎必填', trigger: 'blur'},
                ],
                'taskMetaList[0].timeout': [
                    {required: true, message: '超时时间必填', trigger: 'blur'},
                ],
                'taskMetaList[0].backoffLimit': [
                    {required: true, message: '补偿次数必填', trigger: 'blur'},
                ],
                'taskMetaList[1].type': [
                    {required: true, message: '执行类型必填', trigger: 'blur'},
                ],
                'taskMetaList[1].coreEngineCode': [
                    {required: true, message: '执行引擎必填', trigger: 'blur'},
                ],
                'taskMetaList[1].timeout': [
                    {required: true, message: '超时时间必填', trigger: 'blur'},
                ],
                'taskMetaList[1].backoffLimit': [
                    {required: true, message: '补偿次数必填', trigger: 'blur'},
                ],
                'taskMetaList[1].parallelism': [
                    {required: true, message: '并发个数必填', trigger: 'blur'},
                ],
                'taskMetaList[2].type': [
                    {required: true, message: '执行类型必填', trigger: 'blur'},
                ],
                'taskMetaList[2].coreEngineCode': [
                    {required: true, message: '执行引擎必填', trigger: 'blur'},
                ],
                'taskMetaList[2].timeout': [
                    {required: true, message: '超时时间必填', trigger: 'blur'},
                ],
                'taskMetaList[2].backoffLimit': [
                    {required: true, message: '补偿次数必填', trigger: 'blur'},
                ],
            },
        }
    },
    methods: {
        // 数字检查函数
        changeNum(val) {
            switch (val) {
                case 1:
                    this.jobMetaFormData.taskMetaList[1].parallelism = this.jobMetaFormData.taskMetaList[1].parallelism.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
            }
        },
        onJobTypeChanged(e) {
            this.$emit('onJobTypeChanged', e)
        },
        closeAddUpdate() {
            if (this.addUpdateVisible === false) {
                return;
            }
            this.$emit('closeAddUpdate');
        },
        addFun() {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    this.$emit('addFun')
                } else {
                    return false
                }
            })
        },
        updateFun() {
            this.$emit('updateFun')
        },
    },
}
</script>

<style scoped>

#formId :deep(.t-form__label) {
    padding-right: 4px !important;
    width: 170px !important;
}

#itemForm :deep(.t-form__label) {
    padding-right: 4px !important;
    width: 85px !important;
    margin: 5px 0;
    font-size: 17px;
    color: rgb(22, 106, 190);
}

</style>
