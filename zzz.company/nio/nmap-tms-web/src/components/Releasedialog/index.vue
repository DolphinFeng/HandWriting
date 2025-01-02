<template>
  <!-- 任务管理：发起任务对话框 -->
  <div id="ReleaseDialog">
    <el-dialog
      v-model="handleVisible"
      :modal-append-to-body="false"
      modal
      width="88vw"
      top="4vh"
    >
      <div class="dialog-header">
        <div class="dialog-title">
          <span v-if="isBatch">合并封版</span>
          <span v-if="!isBatch">发起任务</span>
          <div v-if="stepCount === 2" class="tips">
            <span>温馨提示：按住alt+左键选择tile</span>
          </div>
        </div>
        <!-- 对话框上方的步骤条 -->
        <div class="dialog-steps">
          <el-steps
            :active="stepCount"
            finish-status="success"
            simple
            style="background: transparent; margin-top: 10px"
          >
            <el-step
              title="①  选择任务范围"
              class="step-1"
            />
            <el-step
              title="②  地图预览"
              :class="stepCount > 1 ? 'step-2-success' : 'step-2'"
            />
            <el-step
              title="③  问题列表"
              :class="stepCount > 2 ? 'step-3-success' : 'step-3'"
            />
            <el-step
              title="④  创建完成"
              :class="stepCount > 3 ? 'step-4-success' : 'step-4'"
            />
          </el-steps>
        </div>
      </div>
      <!-- 每个步骤对应的内容组件 -->
      <div class="dialog-wrap">
        <!-- 选择任务范围 -->
        <ReleaseChoseRange
          v-if="stepCount === 1"
          :start-relase-params="startRelaseParams"
          :is-batch="isBatch"
          @nextStep="nextStep"
          @closed="closed"
        />
        <!-- 地图预览 -->
        <EditorMap
          v-if="stepCount === 2"
          :pre-select-tile-ids="preSelectTileIds"
          @lastStep="lastStep"
          @nextStep="nextStep"
        />
        <!-- 问题列表 -->
        <ReleaseStartCompile
          v-if="stepCount === 3"
          :start-relase-params="startRelaseParams"
          :belong-options="belongOptions"
          @nextStep="nextStep"
          @lastStep="lastStep"
        />
        <!-- 创建完成结果显示 -->
        <div
          v-if="stepCount === 4" class="CrateSuccess">
          <div v-if="taskInfo.successShow" class="relaseInfo success">
            <div class="release-success"/>
            <div style="font-weight: 600; font-size: 26px">任务号{{taskInfo.taskStr}}创建成功</div>
          </div>
          <div v-if="!taskInfo.successShow" class="relaseInfo fail">
            <div class="release-fail"/>
            <div style="font-weight: 600; font-size: 26px">创建失败</div>
          </div>
          <div class="dialog-footer">
            <el-button @click="closed">取消</el-button>
            <el-button type="primary" @click="closed">确认</el-button>
          </div>
        </div>
      </div>
      <div v-show="handleVisible" class="close-btn" @click="closed">×</div>
    </el-dialog>
  </div>
</template>

<script>
  // 引入需要的组件
  import ReleaseChoseRange from '../ReleaseChoseRange';
  import ReleaseStartCompile from '../ReleaseStartCompile';
  import EditorMap from '../../map/EditorMap'

  const quickFixURL = window.api.apiquickFixURL;
  if (quickFixURL === null || quickFixURL === undefined) {
    console.log("获取人工快修quickFixURL失败" + quickFixURL)
  }

  const nioUrl = window.api.apiNioURL;
  if (nioUrl === null || nioUrl === undefined) {
    console.log("获取nioUrl失败" + nioUrl)
  }

  export default {
    name: 'ReleaseDialog',
    // 组件注册
    components: {
      ReleaseChoseRange,
      ReleaseStartCompile,
      EditorMap,
    },
    // 接收父组件传来的参数
    props: {
      title: String,
      visible: Boolean,
      isBatch: Boolean,
      belongOptions: Array
    },
    data() {
      return {
        // 步骤
        stepCount: 1,
        // 创建任务结果表单
        taskInfo: {
          successShow: true,
          // 创建成功的任务号
          taskStr: ''
        },
        startRelaseParams: {},
        preSelectTileIds: [],
        // 所有图幅
        allCompleteList: []
      };
    },
    computed: {
      // 控制对话框显示与隐藏
      handleVisible: {
        get() {
          return this.visible;
        },
        set(val) {
          console.log('sss', val);
        },
      },
    },
    methods: {
      closed() {
        this.$emit('closedModel');
      },
      // 下一步按钮方法
      nextStep(options) {
        if (options) {
          this.startRelaseParams = Object.assign(this.startRelaseParams, options);
        }
        if (this.stepCount === 1) {
          // showIndex左侧三块分类
          if (options.showIndex === 11) {
            if (!options.check_choose || !options.lock_choose || !options.product_type || !options.product_name || !options.product_version) {
              this.$message({
                type: 'error',
                message: '请检查是否有未填项',
                showClose: true,
              });
            } else {
              // 导入的正确的mesh列表传到地图组件
              this.preSelectTileIds = options.validTailIds
              this.stepCount = this.stepCount + 1;
            }
            // 人工快修任务--按列表快修任务
          } else if (options.showIndex === 22) {
            if (!options.product_type || !options.product_name || !options.product_version) {
              this.$message({
                type: 'error',
                message: '请检查是否有未填项',
                showClose: true,
              });
            } else {
              this.stepCount = this.stepCount + 2;
            }
            // 人工快修任务--按图幅快修任务
          } else if (options.showIndex === 21) {
            if (!options.issue_name || !options.product_type || !options.product_name || !options.product_version) {
              this.$message({
                type: 'error',
                message: '请检查是否有未填项',
                showClose: true,
              });
            } else {
              this.quickFix(options, 'meshInput')
            }
            // 大版融合任务
          } else if (options.showIndex === 3) {
            if (!options.task_name || !options.task_address) {
              this.$message({
                type: 'error',
                message: '请检查是否有未填项',
                showClose: true,
              });
            } else {
              this.largeFusion(options)
            }
          }
        } else if (this.stepCount === 2) {
          // 图幅改善，地图页面后，直接跳转创建完成
          this.chooseFun()
          //  问题列表
        } else if (this.stepCount === 3) {
          this.quickFix(options, 'tagAuto')
        }
      },
      // 上一步按钮方法
      lastStep(options) {
        if (this.stepCount === 2) {
          this.startRelaseParams.showIndex = 11
          this.startRelaseParams.tabIndex = 1
          this.startRelaseParams.perfectIndex = 11
          this.stepCount = this.stepCount - 1;
        } else if (this.stepCount === 3) {
          this.startRelaseParams.showIndex = 22
          this.startRelaseParams.tabIndex = 2
          this.startRelaseParams.quickIndex = 22
          this.stepCount = this.stepCount - 2;
        }
        /*if (options) {
          this.startRelaseParams = Object.assign(this.startRelaseParams, options);
        }*/
      },
      // 人工快修--按图幅快修任务接口函数
      quickFix(data, val) {
        // 按图幅快修
        if (val === 'meshInput') {
          // issue_name整理成数组格式
          let mesh_list = []
          if (data.issue_name.length > 0) {
            if (data.issue_name[data.issue_name.length - 1] === ',') {
              mesh_list = data.issue_name.length > 0 ? data.issue_name.slice(0, -1).split(',') : []
            } else {
              mesh_list = data.issue_name.length > 0 ? data.issue_name.split(',') : []
            }
          } else {
            mesh_list = []
          }
          const options = {
            mesh_list: mesh_list,
            product_type: data.product_type,
            product_name: data.product_name,
            product_version: data.product_version,
          };
          // 获取数据
          this.$axios({
            url: quickFixURL + '/nio/task/quickfix/start',
            method: 'post',
            data: options
          }).then(response => {
            if (response.data.code === 0) {
              this.taskInfo.successShow = true
              this.taskInfo.taskStr = response.data.data.join(',')
              this.stepCount = this.stepCount + 3;
            }
          })
        } else if (val === 'tagAuto') {
          if (this.startRelaseParams.selectedRowData.length !== 0) {
            const options = {
              issue_list: this.startRelaseParams.selectedRowData,
              product_type: data.product_type,
              product_name: data.product_name,
              product_version: data.product_version
            };
            this.$axios({
              url: quickFixURL + '/nio/task/quickfix/start',
              method: 'post',
              data: options
            }).then(response => {
              if (response.data.code === 0) {
                this.taskInfo.successShow = true
                this.taskInfo.taskStr = response.data.data.join(',')
                this.stepCount = this.stepCount + 1;
              }
            })
          } else {
            this.$message({
              type: 'warning',
              message: '问题列表为空，请在表格中选取数据',
              showClose: true,
            });
          }
        }
      },
      // 根据选择策略发起改善任务
      chooseFun() {
        // 按列表是json，按mesh是form-data
        this.allCompleteList = this.startRelaseParams.selectTileIds.concat(this.startRelaseParams.errorTailIds)
        if (this.allCompleteList.length !== 0) {
          let meshStr = this.allCompleteList.join(',')
          var data = new FormData();
          data.append("mesh_str", meshStr);
          // 是否启动检查
          data.append("check_choose", this.startRelaseParams.check_choose);
          // 是否占图（锁图）
          data.append("lock_choose", this.startRelaseParams.lock_choose);
          // 默认是快修
          data.append("quick_choose", 1);
          data.append("product_type", this.startRelaseParams.product_type);
          data.append("product_name", this.startRelaseParams.product_name);
          data.append("product_version", this.startRelaseParams.product_version);
          // 默认不剔除并创建任务：3
          data.append("choose", 3);
          this.$axios({
            url: quickFixURL + '/niotask/v1/commitMeshes',
            method: 'post',
            data: data
          }).then(response => {
            if (response.data.code === 0) {
              this.taskInfo.successShow = true
              this.taskInfo.taskStr = response.data.data.taskId
              this.stepCount = this.stepCount + 2;
            }
          })
        } else {
          this.$message({
            type: 'warning',
            message: '图幅列表为空，请导入或选择图幅',
            showClose: true,
          });
        }
      },
      // 大版融合
      largeFusion(data) {
        // 12:大版融合
        const task_belong = 12
        console.log(data)
        this.stepCount = this.stepCount + 3;
      },
    },
  };
</script>

<style scoped>
  #ReleaseDialog .close-btn {
    position: fixed;
    top: 4.5vh;
    right: 6.5vw;
    color: black;
    text-align: center;
    width: 20px;
    line-height: 20px;
    cursor: pointer;
    transform: scale(1.5);
    z-index: 2001;
  }

  #ReleaseDialog :deep(.v-modal) {
    opacity: 0.9;
    z-index: 1999 !important;
  }

  #ReleaseDialog :deep(.el-dialog__header)  {
    display: none;
  }

  #ReleaseDialog :deep(.el-dialog__body) {
    padding: 0;
  }

  #ReleaseDialog :deep(.el-step__title.is-process) {
    font-weight: normal;
    color: #0076FF;
  }

  #ReleaseDialog :deep(.el-step__title) {
    color: #0076FF;
    max-width: none;
    width: 100%;
    text-align: center;
  }

  #ReleaseDialog :deep(.el-step__title.is-success) {
    color: #fff;
  }

  #ReleaseDialog :deep(.el-steps--simple) {
    padding: 0;
  }

  #ReleaseDialog :deep(.el-step) {
    width: 180px;
    height: 38px;
  }

  #ReleaseDialog :deep(.el-steps) {
    width: 720px;
  }

  #ReleaseDialog :deep(.el-step__icon.is-text) {
    border-color: #c0c4cc;
  }

  #ReleaseDialog :deep(.el-step__arrow) {
    display: none;
  }

  #ReleaseDialog :deep(.el-step__head) {
    display: none;
  }

  #ReleaseDialog :deep(.v-modal) {
    opacity: 0.9;
    z-index: 1999 !important;
  }

  #ReleaseDialog .dialog-header {
    width: 100%;
    height: 90px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f0f2f5;
  }

  .dialog-wrap {
    background-color: #f0f2f5;
    position: relative;
    height: 70vh;
  }

  .dialog-footer {
    border-top: 1px solid rgb(153, 153, 153);
    height: 60px;
    position: absolute;
    width: 100%;
    bottom: 0;
    background: #fff;
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .CrateSuccess {
    background-color: #fff;
    height: 100%;
  }

  .relaseInfo {
    height: calc(100% - 81px);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .relaseInfo > div {
    margin-top: 30px;
  }

  .dialog-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 34px;
    background-color: #F3F8FF;
  }

  .dialog-title span {
    color: #0336b1;
    margin-left: 20px;
    font-size: 14px;
    font-weight: 600;
  }

  .dialog-title .tips {
    height: 26px;
    margin-right: 30px;
    display: flex;
    align-items: center;
    background: rgb(241, 226, 230);
    border-radius: 2px;
    font-size: 12px;
  }

  .dialog-title .tips span {
    font-weight: normal;
    color: #e62905;
    opacity: 1;
    margin-right: 20px;
  }

  .dialog-steps {
    display: flex;
    width: 900px;
    align-items: center;
    justify-content: center;
  }

  .step-1 {
    background: url("../../assets/step2.png") no-repeat center center;
    background-size: contain;
  }

  .step-2,
  .step-3 {
    background: url("../../assets/step6.png") no-repeat center center;
    background-size: contain;
  }

  .step-4 {
    background: url("../../assets/step1.png") no-repeat center center;
    background-size: contain;
  }

  .step-4-success {
    background: url("../../assets/step4.png") no-repeat center center;
    background-size: contain;
  }

  .step-2-success,
  .step-3-success {
    background: url("../../assets/step3.png") no-repeat center center;
    background-size: contain;
  }

  .release-fail {
    width: 150px;
    height: 150px;
    background: url("../../assets/创建失败.png") no-repeat center center;
    background-size: contain;
  }

  .release-success {
    width: 150px;
    height: 150px;
    background: url("../../assets/创建成功.png") no-repeat center center;
    background-size: contain;
  }
</style>
