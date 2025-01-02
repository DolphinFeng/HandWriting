<template>
  <!-- 资源详情表单组件 -->
    <div>
        <!-- 对话框 -->
        <el-dialog
                :title="header"
                v-model="showDialog"
                show-close
                @close="closeAddUpdate"
                width="900px"
                destroy-on-close>
            <div style="margin: 0 30px 0 10px">
                <el-form inline :model="formData" :rules="rules" ref="form" label-position="right" label-width="150px"
                         id="formId">
                    <el-form-item label="引擎编码：" prop="code">
                        <el-input v-if="isAdd" v-model="formData.code" placeholder="请填写引擎编码" style="width:220px"
                                  clearable></el-input>
                        <el-input v-else v-model="formData.code" style="width:220px" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="引擎名称：" prop="name">
                        <el-input v-model="formData.name" placeholder="请填写引擎名称" style="width:220px"
                                  clearable></el-input>
                    </el-form-item>
                    <el-form-item label="镜像地址：" prop="image">
                        <el-input v-model="formData.image" placeholder="请填写镜像地址" style="width:622px"
                                  clearable></el-input>
                    </el-form-item>
                    <el-form-item label="启动命令：" prop="command">
                        <el-input v-model="formData.command" placeholder="请填写启动命令" style="width:622px"
                                  clearable></el-input>
                    </el-form-item>
                    <el-form-item label="工作目录：">
                        <el-input v-model="formData.workingDir" placeholder="请填写工作目录" style="width:220px"
                                  clearable></el-input>
                    </el-form-item>
                    <el-form-item label="使用显卡：" prop="gpu">
                        <el-switch
                                v-model="formData.gpu"
                                active-value="Y"
                                inactive-value="N"
                                active-text="是"
                                inactive-text="否">>
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="CPU预留：" prop="requestCpu">
                        <el-input v-model="formData.requestCpu" placeholder="e.g. 1000" style="width:220px"
                                  clearable @input="changeNum(1)">
                            <template v-slot:append="append">mCPUs</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="内存预留：" prop="requestMemory">
                        <el-input v-model="formData.requestMemory" placeholder="e.g. 128"
                                  style="width:220px"
                                  clearable @input="changeNum(2)">
                            <template v-slot:append="append">Mi</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="CPU限制：" prop="limitCpu">
                        <el-input v-model="formData.limitCpu" placeholder="e.g. 1000" style="width:220px"
                                  clearable @input="changeNum(3)">
                            <template v-slot:append="append">mCPUs</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="内存限制：" prop="limitMemory">
                        <el-input v-model="formData.limitMemory" placeholder="e.g. 128" style="width:220px"
                                  clearable @input="changeNum(4)">
                            <template v-slot:append="append">Mi</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item v-if="formData.gpu==='Y'" label="vcuda-core：" prop="gpuCore">
                        <el-input v-model="formData.gpuCore" placeholder="[0-100]或100的整数倍"
                                  style="width:220px"
                                  clearable @input="changeNum(5)">
                        </el-input>
                    </el-form-item>
                    <el-form-item v-if="formData.gpu==='Y'" label="vcuda-memory：" prop="gpuMemory">
                        <el-input v-model="formData.gpuMemory" placeholder="最终可用的显存为n*256MiB"
                                  style="width:220px"
                                  clearable @input="changeNum(6)">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="挂载目录：">
                        <el-input v-model="formData.mountPath" placeholder="请填写挂载目录" style="width:220px"
                                  clearable></el-input>
                    </el-form-item>
                    <el-form-item label="卷内子目录：">
                        <el-input v-model="formData.subPath" placeholder="请填写卷内子目录" style="width:220px"
                                  clearable></el-input>
                    </el-form-item>
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
    name: "ExecutionEngineForm",
    // 接收父组件传来的参数
    props: {
        formData: Object,
        header: String,
        addUpdateVisible: Boolean,
        isAdd: Boolean,
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
                    {required: true, message: '引擎编码必填', trigger: 'blur'},
                ],
                name: [
                    {required: true, message: '引擎名称必填', trigger: 'blur'},
                ],
                image: [
                    {required: true, message: '镜像地址必填', trigger: 'blur'},
                ],
                command: [
                    {required: true, message: '启动命令必填', trigger: 'blur'},
                ],
                gpu: [
                    {required: true, message: '必须选择是否使用显卡', trigger: 'blur'},
                ],
                requestCpu: [
                    {required: true, message: 'CPU预留必填', trigger: 'blur'},
                ],
                requestMemory: [
                    {required: true, message: '内存预留必填', trigger: 'blur'},
                ],
                limitCpu: [
                    {required: true, message: 'CPU限制必填', trigger: 'blur'},
                ],
                limitMemory: [
                    {required: true, message: '内存限制必填', trigger: 'blur'},
                ],
                gpuCore: [
                    {required: true, message: 'vcuda-core必填', trigger: 'blur'},
                ],
                gpuMemory: [
                    {required: true, message: 'vcuda-memory必填', trigger: 'blur'},
                ],
            },
        }
    },
    methods: {
        // 数字检查函数
        changeNum(val) {
            switch (val) {
                case 1:
                    this.formData.requestCpu = this.formData.requestCpu.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
                case 2:
                    this.formData.requestMemory = this.formData.requestMemory.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
                case 3:
                    this.formData.limitCpu = this.formData.limitCpu.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
                case 4:
                    this.formData.limitMemory = this.formData.limitMemory.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
                case 5:
                    this.formData.gpuCore = this.formData.gpuCore.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
                case 6:
                    this.formData.gpuMemory = this.formData.gpuMemory.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
            }
        },
        closeAddUpdate() {
            if (this.addUpdateVisible === false) {
                return;
            }
            this.$emit('closeAddUpdate')
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
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    this.$emit('updateFun')
                } else {
                    return false
                }
            })
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

.el-select .el-input {
    width: 130px;
}

.input-with-select .el-input-group__prepend {
    background-color: #fff;
}
</style>
