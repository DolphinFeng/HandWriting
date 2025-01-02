<template>
  <!-- 资源详情表单组件 -->
    <div>
        <!-- 对话框 -->
        <el-dialog
                :title="header"
                v-model="showDialog"
                show-close
                @close="closeRunForm"
                width="950px"
                destroy-on-close>
            <div style="margin: 0 10px 0 10px;">
                <el-form :model="jobInstanceFormData" ref="form" inline label-position="right" label-width="150px"
                         id="formId"
                         :rules="rules">
                    <div v-if="showMainDiv">
                        <el-form-item label="Job编码：">
                            <el-input v-model="jobInstanceFormData.jobCode" style="width:220px" disabled></el-input>
                        </el-form-item>
                        <el-form-item label="唯一ID：">
                            <el-input v-model="jobInstanceFormData.uniqueId" style="width:270px" disabled></el-input>
                        </el-form-item>
                        <el-form-item label="优先级：" prop="priority">
                            <el-select v-if="isAdd" v-model="jobInstanceFormData.priority" placeholder="请选择优先级"
                                       style="width:220px"
                                       clearable>
                                <el-option
                                        v-for="item in priorityOptions"
                                        :key="item.code"
                                        :label="item.name"
                                        :value="item.code">
                                </el-option>
                            </el-select>
                            <el-select v-else v-model="jobInstanceFormData.priority" style="width:220px"
                                       disabled>
                                <el-option
                                        v-for="item in priorityOptions"
                                        :key="item.code"
                                        :label="item.name"
                                        :value="item.code">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Job名称：" prop="name">
                            <el-input v-if="isAdd" v-model="jobInstanceFormData.name" placeholder="请填写Job名称"
                                      style="width:270px"></el-input>
                            <el-input v-else v-model="jobInstanceFormData.name" style="width:270px" disabled></el-input>
                        </el-form-item>
                        <div v-for="(runInfo,index) in jobInstanceFormData.runInfos">
                            <el-divider content-position="left">阶段{{ index + 1 }} [ {{ runInfo.stage }} :
                                {{ runInfo.type }} ]
                            </el-divider>
                            <el-form-item label="执行引擎：" prop="runInfo.coreEngineCode">
                                <el-input v-model="runInfo.coreEngineCode" style="width:220px" disabled></el-input>
                                <el-button v-if="isAdd" type="primary" @click="defineCoreEngine(index)"
                                           style="margin-left: 10px;width: 60px">
                                    自定义
                                </el-button>
                                <el-button v-else type="primary" @click="defineCoreEngine(index)"
                                           style="margin-left: 10px;width: 60px">查看
                                </el-button>
                            </el-form-item>
                            <el-form-item label="执行参数：" prop="runInfo.coreArgs">
                                <el-input type="textarea" :rows="2" v-if="isAdd" v-model="runInfo.coreArgs"
                                          style="width:643px"
                                          clearable></el-input>
                                <el-input type="textarea" :rows="2" v-else v-model="runInfo.coreArgs"
                                          style="width:643px"
                                          disabled></el-input>
                            </el-form-item>
                            <el-form-item v-if="runInfo.initEngineCode!==''" label="初始化引擎："
                                          prop="runInfo.initEngineCode">
                                <el-input v-model="runInfo.initEngineCode" style="width:220px" disabled></el-input>
                                <el-button v-if="isAdd" type="primary" @click="defineInitEngine(index)"
                                           style="margin-left: 10px;width: 60px">
                                    自定义
                                </el-button>
                                <el-button v-else type="primary" @click="defineInitEngine(index)"
                                           style="margin-left: 10px;width: 60px">查看
                                </el-button>
                            </el-form-item>
                            <el-form-item v-if="runInfo.initEngineCode!==''" label="初始化参数："
                                          prop="runInfo.initArgs">
                                <el-input type="textarea" :rows="2" v-if="isAdd" v-model="runInfo.initArgs"
                                          style="width:643px"
                                          clearable></el-input>
                                <el-input type="textarea" :rows="2" v-else v-model="runInfo.initArgs"
                                          style="width:643px"
                                          disabled></el-input>
                            </el-form-item>
                        </div>
                    </div>
                    <div v-if="showCoreEngineDiv">
                        <div v-for="(runInfo,index) in jobInstanceFormData.runInfos">
                            <div v-if="index===currentIndex">
                                <el-form-item label="执行引擎：" prop="runInfo.coreEngineCode">
                                    <el-input v-model="runInfo.coreEngineCode" style="width:200px" disabled></el-input>
                                </el-form-item>
                                <el-form-item label="镜像地址：" prop="runInfo.coreEngine.image">
                                    <el-input v-if="isAdd" v-model="runInfo.coreEngine.image"
                                              placeholder="请填写镜像地址"
                                              style="width:592px"
                                              clearable></el-input>
                                    <el-input v-else v-model="runInfo.coreEngine.image" style="width:592px"
                                              disabled></el-input>
                                </el-form-item>
                                <el-form-item label="启动命令：" prop="runInfo.coreEngine.command">
                                    <el-input v-if="isAdd" v-model="runInfo.coreEngine.command"
                                              placeholder="请填写启动命令"
                                              style="width:592px"
                                              clearable></el-input>
                                    <el-input v-else v-model="runInfo.coreEngine.command" style="width:592px"
                                              disabled></el-input>
                                </el-form-item>
                                <el-form-item label="工作目录：">
                                    <el-input v-if="isAdd" v-model="runInfo.coreEngine.workingDir"
                                              placeholder="请填写工作目录"
                                              style="width:220px"
                                              clearable></el-input>
                                    <el-input v-else v-model="runInfo.coreEngine.workingDir" style="width:220px"
                                              disabled></el-input>
                                </el-form-item>
                                <el-form-item label="使用显卡：">
                                    <el-switch v-if="isAdd"
                                               v-model="runInfo.coreEngine.gpu"
                                               active-value="Y"
                                               inactive-value="N"
                                               active-text="是"
                                               inactive-text="否">
                                    </el-switch>
                                    <el-switch v-else
                                               v-model="runInfo.coreEngine.gpu"
                                               active-value="Y"
                                               inactive-value="N"
                                               active-text="是"
                                               inactive-text="否"
                                               disabled>
                                    </el-switch>
                                </el-form-item>
                                <el-form-item label="CPU预留：" prop="runInfo.coreEngine.requestCpu">
                                    <el-input v-if="isAdd" v-model="runInfo.coreEngine.requestCpu"
                                              placeholder="e.g. 1000"
                                              style="width:220px"
                                              clearable @input="changeNum(1,index)">
                                        <template v-slot:append="append">mCPUs</template>
                                    </el-input>
                                    <el-input v-else v-model="runInfo.coreEngine.requestCpu"
                                              style="width:220px"
                                              disabled>
                                        <template v-slot:append="append">mCPUs</template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="内存预留：" prop="runInfo.coreEngine.requestMemory">
                                    <el-input v-if="isAdd" v-model="runInfo.coreEngine.requestMemory"
                                              placeholder="e.g. 128"
                                              style="width:220px"
                                              clearable @input="changeNum(2,index)">
                                        <template v-slot:append="append">Mi</template>
                                    </el-input>
                                    <el-input v-else v-model="runInfo.coreEngine.requestMemory"
                                              style="width:220px" disabled>
                                        <template v-slot:append="append">Mi</template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="CPU限制：" prop="runInfo.coreEngine.limitCpu">
                                    <el-input v-if="isAdd" v-model="runInfo.coreEngine.limitCpu"
                                              placeholder="e.g. 1000"
                                              style="width:220px"
                                              clearable @input="changeNum(3,index)">
                                        <template v-slot:append="append">mCPUs</template>
                                    </el-input>
                                    <el-input v-else v-model="runInfo.coreEngine.limitCpu"
                                              style="width:220px"
                                              disabled>
                                        <template v-slot:append="append">mCPUs</template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="内存限制：" prop="runInfo.coreEngine.limitMemory">
                                    <el-input v-if="isAdd" v-model="runInfo.coreEngine.limitMemory"
                                              placeholder="e.g. 128"
                                              style="width:220px"
                                              clearable @input="changeNum(4,index)">
                                        <template v-slot:append="append">Mi</template>
                                    </el-input>
                                    <el-input v-else v-model="runInfo.coreEngine.limitMemory"
                                              style="width:220px" disabled>
                                        <template v-slot:append="append">Mi</template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item v-if="runInfo.coreEngine.gpu==='Y'" label="vcuda-core："
                                              prop="runInfo.coreEngine.gpuCore">
                                    <el-input v-if="isAdd" v-model="runInfo.coreEngine.gpuCore"
                                              placeholder="[0-100]或100的整数倍"
                                              style="width:220px"
                                              clearable @input="changeNum(5,index)">
                                    </el-input>
                                    <el-input v-else v-model="runInfo.coreEngine.gpuCore"
                                              style="width:220px" disabled>
                                    </el-input>
                                </el-form-item>
                                <el-form-item v-if="runInfo.coreEngine.gpu==='Y'" label="vcuda-memory："
                                              prop="runInfo.coreEngine.gpuMemory">
                                    <el-input v-if="isAdd" v-model="runInfo.coreEngine.gpuMemory"
                                              placeholder="最终可用的显存为n*256MiB"
                                              style="width:220px"
                                              clearable @input="changeNum(6,index)">
                                    </el-input>
                                    <el-input v-else v-model="runInfo.coreEngine.gpuMemory"
                                              style="width:220px" disabled>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="挂载目录：">
                                    <el-input v-if="isAdd" v-model="runInfo.coreEngine.mountPath"
                                              placeholder="请填写挂载目录"
                                              style="width:220px"
                                              clearable></el-input>
                                    <el-input v-else v-model="runInfo.coreEngine.mountPath" style="width:220px"
                                              disabled></el-input>
                                </el-form-item>
                                <el-form-item label="卷内子目录：">
                                    <el-input v-if="isAdd" v-model="runInfo.coreEngine.subPath"
                                              placeholder="请填写卷内子目录"
                                              style="width:220px"
                                              clearable></el-input>
                                    <el-input v-else v-model="runInfo.coreEngine.subPath" style="width:220px"
                                              disabled></el-input>
                                </el-form-item>
                                <el-divider content-position="left">环境变量</el-divider>
                                <div v-for="(env,index) in runInfo.coreEngine.envs">
                                    <el-form-item :label="'key-'+(index+1)+'：'">
                                        <el-input v-if="isAdd" v-model="env.name" placeholder="请填写环境变量key"
                                                  style="width:220px"
                                                  clearable></el-input>
                                        <el-input v-else v-model="env.name" style="width:220px" disabled></el-input>
                                    </el-form-item>
                                    <el-form-item :label="'value-'+(index+1)+'：'">
                                        <el-input v-if="isAdd" v-model="env.value" placeholder="请填写环境变量value"
                                                  style="width:220px"
                                                  clearable></el-input>
                                        <el-input v-else v-model="env.value" style="width:220px" disabled></el-input>
                                        <el-button v-if="isAdd" style="margin-left: 5px"
                                                   @click.prevent="removeEnv(index)">删除
                                        </el-button>
                                    </el-form-item>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="showInitEngineDiv">
                        <div v-for="(runInfo,index) in jobInstanceFormData.runInfos">
                            <!--                            <div v-if="index===currentIndex&&runInfo.initEngineCode!==''">-->
                            <el-form-item label="执行引擎：" prop="runInfo.initEngineCode">
                                <el-input v-model="runInfo.initEngineCode" style="width:200px" disabled></el-input>
                            </el-form-item>
                            <el-form-item label="镜像地址：" prop="runInfo.initEngine.image">
                                <el-input v-if="isAdd" v-model="runInfo.initEngine.image"
                                          placeholder="请填写镜像地址"
                                          style="width:592px"
                                          clearable></el-input>
                                <el-input v-else v-model="runInfo.initEngine.image" style="width:592px"
                                          disabled></el-input>
                            </el-form-item>
                            <el-form-item label="启动命令：" prop="runInfo.initEngine.command">
                                <el-input v-if="isAdd" v-model="runInfo.initEngine.command"
                                          placeholder="请填写启动命令"
                                          style="width:592px"
                                          clearable></el-input>
                                <el-input v-else v-model="runInfo.initEngine.command" style="width:592px"
                                          disabled></el-input>
                            </el-form-item>
                            <el-form-item label="工作目录：">
                                <el-input v-if="isAdd" v-model="runInfo.initEngine.workingDir"
                                          placeholder="请填写工作目录"
                                          style="width:220px"
                                          clearable></el-input>
                                <el-input v-else v-model="runInfo.initEngine.workingDir" style="width:220px"
                                          disabled></el-input>
                            </el-form-item>
                            <el-form-item label="使用显卡：">
                                <el-switch v-if="isAdd"
                                           v-model="runInfo.initEngine.gpu"
                                           active-value="Y"
                                           inactive-value="N"
                                           active-text="是"
                                           inactive-text="否">
                                </el-switch>
                                <el-switch v-else
                                           v-model="runInfo.initEngine.gpu"
                                           active-value="Y"
                                           inactive-value="N"
                                           active-text="是"
                                           inactive-text="否"
                                           disabled>
                                </el-switch>
                            </el-form-item>
                            <el-form-item label="CPU预留：" prop="runInfo.initEngine.requestCpu">
                                <el-input v-if="isAdd" v-model="runInfo.initEngine.requestCpu"
                                          placeholder="e.g. 1000"
                                          style="width:220px"
                                          clearable @input="changeNum(7,index)">
                                    <template v-slot:append="append">mCPUs</template>
                                </el-input>
                                <el-input v-else v-model="runInfo.initEngine.requestCpu"
                                          style="width:220px"
                                          disabled>
                                    <template v-slot:append="append">mCPUs</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="内存预留：" prop="runInfo.initEngine.requestMemory">
                                <el-input v-if="isAdd" v-model="runInfo.initEngine.requestMemory"
                                          placeholder="e.g. 128"
                                          style="width:220px"
                                          clearable @input="changeNum(8,index)">
                                    <template v-slot:append="append">Mi</template>
                                </el-input>
                                <el-input v-else v-model="runInfo.initEngine.requestMemory"
                                          style="width:220px" disabled>
                                    <template v-slot:append="append">Mi</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="CPU限制：" prop="runInfo.initEngine.limitCpu">
                                <el-input v-if="isAdd" v-model="runInfo.initEngine.limitCpu"
                                          placeholder="e.g. 1000"
                                          style="width:220px"
                                          clearable @input="changeNum(9,index)">
                                    <template v-slot:append="append">mCPUs</template>
                                </el-input>
                                <el-input v-else v-model="runInfo.initEngine.limitCpu"
                                          style="width:220px"
                                          disabled>
                                    <template v-slot:append="append">mCPUs</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="内存限制：" prop="runInfo.initEngine.limitMemory">
                                <el-input v-if="isAdd" v-model="runInfo.initEngine.limitMemory"
                                          placeholder="e.g. 128"
                                          style="width:220px"
                                          clearable @input="changeNum(10,index)">
                                    <template v-slot:append="append">Mi</template>
                                </el-input>
                                <el-input v-else v-model="runInfo.initEngine.limitMemory"
                                          style="width:220px" disabled>
                                    <template v-slot:append="append">Mi</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item v-if="runInfo.initEngine.gpu==='Y'" label="vcuda-core："
                                          prop="runInfo.initEngine.gpuCore">
                                <el-input v-if="isAdd" v-model="runInfo.initEngine.gpuCore"
                                          placeholder="[0-100]或100的整数倍"
                                          style="width:220px"
                                          clearable @input="changeNum(11,index)">
                                </el-input>
                                <el-input v-else v-model="runInfo.initEngine.gpuCore"
                                          style="width:220px" disabled>
                                </el-input>
                            </el-form-item>
                            <el-form-item v-if="runInfo.initEngine.gpu==='Y'" label="vcuda-memory："
                                          prop="runInfo.initEngine.gpuMemory">
                                <el-input v-if="isAdd" v-model="runInfo.initEngine.gpuMemory"
                                          placeholder="最终可用的显存为n*256MiB"
                                          style="width:220px"
                                          clearable @input="changeNum(12,index)">
                                </el-input>
                                <el-input v-else v-model="runInfo.initEngine.gpuMemory"
                                          style="width:220px" disabled>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="挂载目录：">
                                <el-input v-if="isAdd" v-model="runInfo.initEngine.mountPath"
                                          placeholder="请填写挂载目录"
                                          style="width:220px"
                                          clearable></el-input>
                                <el-input v-else v-model="runInfo.initEngine.mountPath" style="width:220px"
                                          disabled></el-input>
                            </el-form-item>
                            <el-form-item label="卷内子目录：">
                                <el-input v-if="isAdd" v-model="runInfo.initEngine.subPath"
                                          placeholder="请填写卷内子目录"
                                          style="width:220px"
                                          clearable></el-input>
                                <el-input v-else v-model="runInfo.initEngine.subPath" style="width:220px"
                                          disabled></el-input>
                            </el-form-item>
                            <el-divider content-position="left">环境变量</el-divider>
                            <div v-for="(env,index) in runInfo.initEngine.envs">
                                <el-form-item :label="'key-'+(index+1)+'：'">
                                    <el-input v-if="isAdd" v-model="env.name" placeholder="请填写环境变量key"
                                              style="width:220px"
                                              clearable></el-input>
                                    <el-input v-else v-model="env.name" style="width:220px" disabled></el-input>
                                </el-form-item>
                                <el-form-item :label="'value-'+(index+1)+'：'">
                                    <el-input v-if="isAdd" v-model="env.value" placeholder="请填写环境变量value"
                                              style="width:220px"
                                              clearable></el-input>
                                    <el-input v-else v-model="env.value" style="width:220px" disabled></el-input>
                                    <el-button v-if="isAdd" style="margin-left: 5px"
                                               @click.prevent="removeEnv(index)">删除
                                    </el-button>
                                </el-form-item>
                            </div>
                            <!--                            </div>-->
                        </div>
                    </div>
                </el-form>
            </div>
            <template #footer class="dialog-footer">
                <el-button v-if="showMainDiv" type="primary" @click="closeRunForm"
                           style="margin-left: 0px;width: 100px">取消
                </el-button>
                <el-button v-if="isAdd&&showMainDiv" type="primary" @click="runFun"
                           style="margin-left: 30px;width: 100px">运行
                </el-button>
                <el-button v-if="isAdd&&!showMainDiv" type="primary" @click="addEnv"
                           style="margin-left: 30px;width: 120px">
                    新增环境变量
                </el-button>
                <el-button v-if="showCoreEngineDiv" type="primary" @click="coreBackMainDiv"
                           style="margin-left: 30px;width: 120px">返回
                </el-button>
                <el-button v-if="showInitEngineDiv" type="primary" @click="initBackMainDiv"
                           style="margin-left: 30px;width: 120px">返回
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script>

import {ElMessage} from "element-plus";

export default {
    name: "JobForm",
    // 接收父组件传来的参数
    props: {
        jobInstanceFormData: Object,
        jobInstanceVisible: Boolean,
        priorityOptions: Array,
        header: String,
        isAdd: Boolean
    },
    computed: {
        showDialog: {
            get() {
                return this.jobInstanceVisible;
            },
            set(value) {
            }
        }
    },
    data() {
        return {
            showMainDiv: true,
            showCoreEngineDiv: false,
            showInitEngineDiv: false,
            currentIndex: 0,
            rules: {
                name: [
                    {required: true, message: 'JOB名称必填', trigger: 'blur'},
                ],
                priority: [
                    {required: true, message: '优先级必填', trigger: 'blur'},
                ]
            },
        }
    },
    methods: {
        closeRunForm() {
            if (this.jobInstanceVisible === false) {
                return;
            }
            this.showMainDiv = true
            this.showCoreEngineDiv = false
            this.showInitEngineDiv = false
            this.$emit('closeRunForm')
        },
        defineCoreEngine(idx) {
            this.currentIndex = idx
            this.showMainDiv = false
            this.showCoreEngineDiv = true
            this.showInitEngineDiv = false
        },
        defineInitEngine(idx) {
            this.currentIndex = idx
            this.showMainDiv = false
            this.showCoreEngineDiv = false
            this.showInitEngineDiv = true
        },
        coreBackMainDiv() {
            let image = this.jobInstanceFormData.runInfos[this.currentIndex].coreEngine.image
            let imageCheck = this.checkRequired(image, "镜像地址必填")
            if (!imageCheck) {
                return;
            }
            let command = this.jobInstanceFormData.runInfos[this.currentIndex].coreEngine.command
            let commandCheck = this.checkRequired(command, "启动命令必填")
            if (!commandCheck) {
                return;
            }
            let cpuRequest = this.jobInstanceFormData.runInfos[this.currentIndex].coreEngine.requestCpu
            let cpuRequestCheck = this.checkRequired(cpuRequest, "CPU预留必填")
            if (!cpuRequestCheck) {
                return;
            }
            let memoryRequest = this.jobInstanceFormData.runInfos[this.currentIndex].coreEngine.requestMemory
            let memoryRequestCheck = this.checkRequired(memoryRequest, "内存预留必填")
            if (!memoryRequestCheck) {
                return;
            }
            let cpuLimit = this.jobInstanceFormData.runInfos[this.currentIndex].coreEngine.limitCpu
            let cpuLimitCheck = this.checkRequired(cpuLimit, "CPU限制必填")
            if (!cpuLimitCheck) {
                return;
            }
            let memoryLimit = this.jobInstanceFormData.runInfos[this.currentIndex].coreEngine.limitMemory
            let memoryLimitCheck = this.checkRequired(memoryLimit, "内存限制必填")
            if (!memoryLimitCheck) {
                return;
            }
            let gpu = this.jobInstanceFormData.runInfos[this.currentIndex].coreEngine.gpu
            if ('Y' === gpu) {
                let gpuCore = this.jobInstanceFormData.runInfos[this.currentIndex].coreEngine.gpuCore
                let gpuCoreCheck = this.checkRequired(gpuCore, "vcuda-core必填")
                if (!gpuCoreCheck) {
                    return;
                }
                let gpuMemory = this.jobInstanceFormData.runInfos[this.currentIndex].coreEngine.gpuMemory
                let gpuMemoryCheck = this.checkRequired(gpuMemory, "vcuda-memory必填")
                if (!gpuMemoryCheck) {
                    return;
                }
            }
            this.showMainDiv = true
            this.showCoreEngineDiv = false
            this.showInitEngineDiv = false
        },
        initBackMainDiv() {
            let image = this.jobInstanceFormData.runInfos[this.currentIndex].initEngine.image
            let imageCheck = this.checkRequired(image, "镜像地址必填")
            if (!imageCheck) {
                return;
            }
            let command = this.jobInstanceFormData.runInfos[this.currentIndex].initEngine.command
            let commandCheck = this.checkRequired(command, "启动命令必填")
            if (!commandCheck) {
                return;
            }
            let cpuRequest = this.jobInstanceFormData.runInfos[this.currentIndex].initEngine.requestCpu
            let cpuRequestCheck = this.checkRequired(cpuRequest, "CPU预留必填")
            if (!cpuRequestCheck) {
                return;
            }
            let memoryRequest = this.jobInstanceFormData.runInfos[this.currentIndex].initEngine.requestMemory
            let memoryRequestCheck = this.checkRequired(memoryRequest, "内存预留必填")
            if (!memoryRequestCheck) {
                return;
            }
            let cpuLimit = this.jobInstanceFormData.runInfos[this.currentIndex].initEngine.limitCpu
            let cpuLimitCheck = this.checkRequired(cpuLimit, "CPU限制必填")
            if (!cpuLimitCheck) {
                return;
            }
            let memoryLimit = this.jobInstanceFormData.runInfos[this.currentIndex].initEngine.limitMemory
            let memoryLimitCheck = this.checkRequired(memoryLimit, "内存限制必填")
            if (!memoryLimitCheck) {
                return;
            }
            let gpu = this.jobInstanceFormData.runInfos[this.currentIndex].initEngine.gpu
            if ('Y' === gpu) {
                let gpuCore = this.jobInstanceFormData.runInfos[this.currentIndex].initEngine.gpuCore
                let gpuCoreCheck = this.checkRequired(gpuCore, "vcuda-core必填")
                if (!gpuCoreCheck) {
                    return;
                }
                let gpuMemory = this.jobInstanceFormData.runInfos[this.currentIndex].initEngine.gpuMemory
                let gpuMemoryCheck = this.checkRequired(gpuMemory, "vcuda-memory必填")
                if (!gpuMemoryCheck) {
                    return;
                }
            }
            this.showMainDiv = true
            this.showCoreEngineDiv = false
            this.showInitEngineDiv = false
        },
        checkRequired(content, message) {
            if (!content || content === '') {
                ElMessage.error({
                    message: message,
                    showClose: true,
                });
                return false;
            }
            return true;
        },
        removeEnv(index) {
            if (this.showCoreEngineDiv) {
                this.jobInstanceFormData.runInfos[this.currentIndex].coreEngine.envs.splice(index, 1)
            } else if (this.showInitEngineDiv) {
                this.jobInstanceFormData.runInfos[this.currentIndex].initEngine.envs.splice(index, 1)
            }
        },
        addEnv() {
            if (this.showCoreEngineDiv) {
                this.jobInstanceFormData.runInfos[this.currentIndex].coreEngine.envs.push({
                    name: '',
                    value: ''
                })
            } else if (this.showInitEngineDiv) {
                this.jobInstanceFormData.runInfos[this.currentIndex].initEngine.envs.push({
                    name: '',
                    value: ''
                })
            }
        },
        runFun() {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    this.$emit('runFun')
                } else {
                    return false
                }
            })
        },
        // 数字检查函数
        changeNum(val, idx) {
            switch (val) {
                case 1:
                    this.jobInstanceFormData.runInfos[idx].coreEngine.requestCpu = this.jobInstanceFormData.runInfos[idx].coreEngine.requestCpu.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
                case 2:
                    this.jobInstanceFormData.runInfos[idx].coreEngine.requestMemory = this.jobInstanceFormData.runInfos[idx].coreEngine.requestMemory.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
                case 3:
                    this.jobInstanceFormData.runInfos[idx].coreEngine.limitCpu = this.jobInstanceFormData.runInfos[idx].coreEngine.limitCpu.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
                case 4:
                    this.jobInstanceFormData.runInfos[idx].coreEngine.limitMemory = this.jobInstanceFormData.runInfos[idx].coreEngine.limitMemory.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
                case 5:
                    this.jobInstanceFormData.runInfos[idx].coreEngine.gpuCore = this.jobInstanceFormData.runInfos[idx].coreEngine.gpuCore.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
                case 6:
                    this.jobInstanceFormData.runInfos[idx].coreEngine.gpuMemory = this.jobInstanceFormData.runInfos[idx].coreEngine.gpuMemory.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
                case 7:
                    this.jobInstanceFormData.runInfos[idx].initEngine.requestCpu = this.jobInstanceFormData.runInfos[idx].initEngine.requestCpu.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
                case 8:
                    this.jobInstanceFormData.runInfos[idx].initEngine.requestMemory = this.jobInstanceFormData.runInfos[idx].initEngine.requestMemory.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
                case 9:
                    this.jobInstanceFormData.runInfos[idx].initEngine.limitCpu = this.jobInstanceFormData.runInfos[idx].initEngine.limitCpu.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
                case 10:
                    this.jobInstanceFormData.runInfos[idx].initEngine.limitMemory = this.jobInstanceFormData.runInfos[idx].initEngine.limitMemory.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
                case 11:
                    this.jobInstanceFormData.runInfos[idx].initEngine.gpuCore = this.jobInstanceFormData.runInfos[idx].initEngine.gpuCore.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
                case 12:
                    this.jobInstanceFormData.runInfos[idx].initEngine.gpuMemory = this.jobInstanceFormData.runInfos[idx].initEngine.gpuMemory.replace(/[^\d]/g, "").replace(/^0{1,}/g, '');
                    break;
            }
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
