<template>
  <div id="PublishDetail">
    <el-tabs v-model="activeName" type="border-card" @tab-click="tabClick" class="detail-panel">
      <!-- 详情表单 -->
      
        <el-tab-pane label="版本详情" name="first" class="detail-tab">
          <el-scrollbar>
            <el-row :gutter="10">
              <el-col :span="10">
                <div style="font-size: 25px; margin: 20px; display: inline-block;">基本信息</div>
                <div style="display: inline-block">产线流程版本：{{ this.currentVersion }}<el-tag v-if="notLatestVersion" type="danger" style="margin: 10px;">当前不是最新版本</el-tag></div>

                <el-form label-width="auto" :data="projectData">
                  <el-form-item label="版本编号：">
                    <el-input disabled v-model="projectData.releaseVersion"></el-input>
                  </el-form-item>
                  <el-form-item label="版本名称：">
                    <el-input disabled v-model="projectData.descName"></el-input>
                  </el-form-item>
                  <!-- <el-form-item label="版本类型：">
                    <el-input disabled ></el-input>
                  </el-form-item> -->
                  <el-form-item label="众包产品库：">
                    <el-input disabled v-model="projectData.productIdentity"></el-input>
                  </el-form-item>
                  <!-- <el-form-item label="众包分支：">
                    <el-input disabled v-model="projectData.branch"></el-input>
                  </el-form-item>
                  <el-form-item label="初始化中是否执行大版融合：">
                    <el-input disabled v-model="projectData.isBaseLine"></el-input>
                  </el-form-item>
                  <el-form-item label="大版融合输入参数：">
                    <el-input autosize type="textarea" disabled v-model="projectData.baseLineInput"></el-input>
                  </el-form-item> -->

                  <el-form-item label="跳过环节：">
                    <el-input disabled v-model="projectData.skipStages"></el-input>
                  </el-form-item>

                  <!-- <el-form-item label="腾讯原始数据存储目录：">
                    <el-input disabled></el-input>
                  </el-form-item> -->
                </el-form>
              </el-col>
              <el-col :span="1"><el-divider direction="vertical" style="height:100%"/></el-col>
              <!-- double-check -->
              <el-col :span="12">
                <el-button type="primary" :loading="loading" @click="reloadData" style="margin-bottom: 10px;">刷新</el-button>
                <div style="font-size: 25px; margin: 20px; display: inline-block;" v-loading="loading">参数维护</div>
                <el-table id="p_column" :data="tableParamMain" border>
                  <el-table-column align="center" prop="paramName" label="参数名称" min-width="50">
                    <template v-slot="scope">
                      {{ scope.row.paramName.split(':')[0] }}
                    </template>
                  </el-table-column>
                  <el-table-column align="center" prop="impactStage" label="影响阶段" min-width="50"></el-table-column>
                  <el-table-column align="center" prop="currentValue" label="当前取值" min-width="50"></el-table-column>
                  <el-table-column align="center" prop="paramStatus" label="参数填写状态" min-width="50"></el-table-column>
                  <el-table-column align="center" prop="reviewValue" label="审核中的取值" min-width="50"></el-table-column>
                  <el-table-column align="center" label="操作" min-width="50">
                    <template #default="scope">
                      <el-button link type="primary" size="small" @click="handleChange(scope.row)" :disabled="scope.row.paramStatus === '修改审核中'">修改</el-button>
                    </template> 
                  </el-table-column>

                </el-table>
                <div style="margin: 50px 0;"></div>
                <div style="font-size: 25px; margin: 20px; display: inline-block;">参数修改履历</div>
                <el-table id="p_column" :data="tableChangeDetail" border v-loading="loading">
                  <el-table-column align="center" prop="modifyParamName" label="修改参数名称" min-width="50"></el-table-column>
                  <el-table-column align="center" prop="modifyCurrentValue" label="修改当前取值" min-width="50"></el-table-column>
                  <el-table-column align="center" prop="modifyAfterValue" label="修改后取值" min-width="50"></el-table-column>
                  <el-table-column align="center" prop="changeState" label="审核状态" min-width="50"></el-table-column>
                  <el-table-column align="center" prop="modifyReviewTime" label="修改审核时间" min-width="50"></el-table-column>
                  <el-table-column align="center" prop="modifier" label="修改人" min-width="50"></el-table-column>
                  <el-table-column align="center" prop="reviewer" label="审核人" min-width="50"></el-table-column>
                </el-table>
              </el-col>
            </el-row>
          </el-scrollbar>
        </el-tab-pane>

      <!-- 版本关系 -->
      <el-tab-pane label="版本关系" name="second" class="detail-tab" lazy>
          <antvDetail :hierarchyQuearyData='hierarchyQuearyData'></antvDetail>
      </el-tab-pane>

      <!-- 项目历史 -->
      <el-tab-pane label="项目历史" name="third" class="detail-tab" lazy>
        <projectHistory :row="rowDetail"></projectHistory>
      </el-tab-pane>

      <!-- 版本数据 -->
      <el-tab-pane label="版本数据" name="fourth" class="detail-tab" lazy>
        <el-row :gutter="10">
          <el-col :span="13">
              <div style="font-size: 25px;margin: 20px; display: inline-block">版本数据</div>
              
              <el-table :data="versionTableData" border style="width: 100%; height: 600px" scrollbar-always-on="true">
                <el-table-column fixed prop="stageName" label="阶段"  width="180"/>
                <el-table-column label="输出" width="280">
                  <template #default="scope">
                    <div v-html="scope.row.output"></div>
                  </template>
                </el-table-column>
                <el-table-column label="任务id" prop="taskId" width="150">
                  <template #default="scope">
                    <div v-html="scope.row.taskId"></div>
                  </template>
                </el-table-column>
                <el-table-column label="备注" prop="taskId">
                  <template #default="scope">
                    <div v-html="scope.row.remark"></div>
                  </template>
                </el-table-column>
              </el-table>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <!-- 修改弹窗 -->
    <!-- double-check弹窗 -->
    <el-dialog v-model="outerDialogVisible" title="请确认">
      <div class="dialog-text">
        <p style="padding-bottom: 10px">该参数影响的阶段：</p>
        <div v-for="(status, index) in stageStatus" :key="index">
          <p v-if="status.running"><span class="status-name">{{ status.name }}</span> 目前处于 “进行中” 的状态；</p>
          <p v-if="status.finished"><span class="status-name">{{ status.name }}</span> 目前处于 “已结束” 的状态。</p>
        </div>
        <p style="padding-top: 10px; font-weight: bold">是否仍要修改?</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="outerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="showInnerDialog">确认</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 修改弹窗 -->
    <el-dialog v-model="dialogVisible" title="修改参数" :before-close="handleInnerDialogClose">
      <el-form label-position="right">
        <el-form-item label="原取值：">
          {{ selectedRow.currentValue }}
        </el-form-item>
        <el-form-item label="修改后取值：" prop="productIdentity">
          <el-input v-model="newValue"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer" style="display: flex; justify-content: flex-end;">
        <el-button @click="handleInnerDialogClose" center>取消</el-button>
        <el-button type="primary" @click="saveChange">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { reactive, ref, watch, nextTick, onMounted } from 'vue';
import { Graph } from '@antv/x6';
import { Color, Dom } from '@antv/x6';
import { DagreLayout } from '@antv/layout';
// import dagre from 'dagre'
import axios from 'axios';
import antvDetail from './antvDetail.vue';
import ProjectHistory from './ProjectHistory.vue'
import { mapGetters } from 'vuex'; 

const nioProjectService = window.api.nioProjectService;
const nioReleaseURL = window.api.nioReleaseURL;

if (nioProjectService === null || nioProjectService === undefined) {
  console.log('获取nioProjectService失败' + nioProjectService);
}
if (nioReleaseURL === null || nioReleaseURL === undefined) {
  console.log('获取nioReleaseURL失败' + nioReleaseURL);
}
export default {
  name: 'PublishDetail',
  components: {
    antvDetail,
    ProjectHistory
  },
  props: {
    // hierarchyData: Object,
    rowDetail: Object,
  },
  data() {
    console.log('this.rowDetail:', this.rowDetail);
    return {
      versionTableData: [],
      hierarchyQuearyData: { },
      projectData: {},
      graph: null,
      container: null,
      notLatestVersion: false,
      currentVersion: '',
      tableParamMain: [],
      tableChangeDetail: [],
      dialogVisible: false,
      newValue: '',
      selectedRow: {},
      outerDialogVisible: false,
      stageStatus: [],
      loading: false,
      rowDetail: null,
    };
  },
  setup() {
    const activeName = ref('first');
    const graphContainer = ref(null);
    const size = ref(10);

    return {
      activeName,
      graphContainer,
      size
    };
  },

  methods: {
    showInnerDialog() {
      this.outerDialogVisible = false;
      this.dialogVisible = true;
    },

    saveChange () {
      this.loading = true; // 开始加载
      const payload = {
        releaseVersion: this.projectData.releaseVersion,
        updateList: [
          {
            name: this.selectedRow.paramName.split(':')[1], 
            oldValue: this.selectedRow.currentValue,
            newValue: this.newValue
          }
        ],
        operator: localStorage.getItem('realName')
      };
      axios({
        url: nioReleaseURL + '/release-version/update-variable',
        method: 'post',
        data: payload,
      })
        .then((response) => {
          if (response.data.code === 200) {
            this.dialogVisible = false;
            ElMessage.success('保存成功');
            this.versionDetail();
            this.changeDetail();
          } else {
            ElMessage.error(response.data.msg);
          }
          // location.reload();
        })
        .catch((error) => {
          ElMessage.error('保存失败');
        })
        .finally(() => {
          this.loading = false; // 结束加载
        });
    },

    openDetail() {
      axios({
        url: nioReleaseURL + '/inheritance-release/hierarchy-query',
        method: 'post',
        data: {
          baseLine: this.rowDetail.baseLineVersion,
        },
      })
        .then((response) => {
          if (response.data.code === 200) {
            this.hierarchyQuearyData = response.data.data;
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: false,
              grouping: true,
            });
          }
        })
        .catch(() => {
          ElMessage.error({
            message: '没有获取到数据',
            showClose: false,
            grouping: true,
          });
        });
    },

    // tab点击函数
    tabClick(tab, event) {
      // if (tab.paneName === 'first') {
      //   this.versionDetail();
      // } else if (tab.paneName === 'second') {
        // console.log(this.graphContainer)
        // if (this.graphContainer) {
        // this.aim();
        // }
        // setTimeout(() => {
        //   this.aim();
        // }, 0);
      // }
    },
    asdf(row){
      console.log(row)
    },
    handleChange(row) {
      // this.dialogVisible = true;
      // this.outerDialogVisible = true;
      this.selectedRow = { ...row }
      this.newValue = '';
      this.fetchStageStatus();
    },    
    handleInnerDialogClose() {
      this.dialogVisible = false;
      this.outerDialogVisible = false;
    },
    getParamStatus (available) {
      switch (available) {
        case 0:
          return '修改审核中';
        case 1:
          return '当前取值有效';
        case -1:
          return '未填写';
        default:
          return '未知状态';
      }
    },
    versionDetail() {
      console.log(this.rowDetail);
      axios({
        url: nioReleaseURL + '/release-version/params?releaseVersion=' + this.rowDetail.releaseVersion,
        method: 'get',
      })
        .then((response) => {
          if (response.data.code === 200) {
            this.projectData = response.data.data.params;
            // 新增参数维护数据
            if (response?.data?.data?.variables) {
              this.tableParamMain = response.data.data.variables.map(variable => ({
                paramName: variable.text + ':' + variable.name,
                impactStage: variable.remark,
                currentValue: variable.value,
                paramStatus: this.getParamStatus(variable.available),
                reviewValue: variable.pendingValue
              }));
            }

            for (let key in this.projectData ) {
              if (typeof this.projectData[key] !== 'string') {
                this.projectData [key] = String(this.projectData[key]);
              }
            }
            this.projectData['releaseVersion'] = this.rowDetail.releaseVersion;
            this.projectData['baseLineInput'] =
              this.projectData.versionMergeBaseProductName +
              ',' +
              this.projectData.versionMergeBaseTag +
              ',' +
              this.projectData.versionMergeTargetTag;
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: false,
              grouping: true,
            });
          }
        })
        .catch((err) => {
          console.log(err);
          ElMessage.error({
            message: '没有获取到数据',
            showClose: false,
            grouping: true,
          });
        })
        .finally(() => {
          this.loading = false; // 结束加载
        });
    },

    reloadData() {
      this.loading = true;
      Promise.all([this.versionDetail(), this.changeDetail()])
        .finally(() => {
          this.loading = false;
        });
    },

    changeDetail() {
      axios({
        url: nioReleaseURL + '/release-version/variable/request?releaseVersion=' + this.rowDetail.releaseVersion,
        method: 'get',
      })
        .then((response) => {
          if (response?.data?.code === 200) {
            this.tableChangeDetail = response.data.data.map(item => ({
              modifyParamName: item.text,
              modifyCurrentValue: item.oldValue,
              modifyAfterValue: item.newValue,
              changeState: item.status,
              modifyReviewTime: item.createTime,
              modifier: item.operator,
              reviewer: item.reviewer
            }));
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: false,
              grouping: true,
            });
          }
        })
        .catch((err) => {
          console.log(err);
          ElMessage.error({
            message: '没有获取到数据',
            showClose: false,
            grouping: true,
          });
        });
    },
    stageOuput() {
      axios({
        url: nioProjectService + '/project/detail?projectId=' + this.rowDetail.projectId,
        method: 'get',
      })
        .then((response) => {
          if (response.data.code === 200) {
            console.log('123',response.data.data.allStageOutput);
            let allStageOutput = response.data.data.allStageOutput;
            let data = allStageOutput.map((item) => {
              return {
                taskId: item.taskId,
                stageName: item.stageName,
                output: item.output
                  .map((output) => {
                    return `${output.text}:${output.value}`;
                  })
                  .join('<br>'),
                remark: item.remark
              };
            });
            this.versionTableData = data;

            this.currentVersion = response.data.data.lineMeta.version
            let lineCode = response.data.data.productLine
            axios({
              url: nioProjectService + '/config/product/meta/version?lineCode=' + lineCode + '&latest=true',
              method: 'get'
            })
            .then((res) => {
              console.log('?????/', res)
              if (res.status === 200) {
                let latestVersion = res.data[0].version
                if(this.currentVersion !== latestVersion) {
                  this.notLatestVersion = true
                } else {
                  this.notLatestVersion = false
                }
              } else {
                ElMessage.error({
                  message: res.statusText,
                  showClose: false,
                  grouping: true,
                });
              }
            })
            .catch(() => {
              ElMessage.error({
                message: '没有获取到最新版本',
                showClose: false,
                grouping: true,
              });
            });


          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: false,
              grouping: true,
            });
          }
        })
        .catch(() => {
          ElMessage.error({
            message: '没有获取到数据',
            showClose: false,
            grouping: true,
          });
        });
    },
    fetchStageStatus() {
      const dynamicInput = this.selectedRow.paramName.split(':')[1];
      axios({
        url: `${nioProjectService}/project/stage/status/query-by-dynamic-input`,
        method: 'get',
        params: {
          projectId: this.rowDetail.projectId,
          dynamicInput: dynamicInput
        }
      })
        .then((response) => {
          try {
            if (response.data.code === 200) {
              const stageData = response.data.data[dynamicInput];
              if (stageData && stageData.length > 0) {
                this.stageStatus = stageData.map(stageInfo => ({
                  running: stageInfo.running,
                  finished: stageInfo.finished,
                  name: stageInfo.name
                }));
                const allFalse = this.stageStatus.every(status => !status.running && !status.finished);
                if (allFalse) {
                  this.dialogVisible = true;
                } else {
                  this.outerDialogVisible = true;
                }
              } else {
                this.dialogVisible = true;
              }
            } else {
              ElMessage.error({
                message: response.data.msg,
                showClose: false,
                grouping: true,
              });
            }
          } catch (error) {
            console.error('Error processing response:', error);
            ElMessage.error({
              message: '处理响应数据时发生错误',
              showClose: false,
              grouping: true,
            });
          }
        })
        .catch((error) => {
          console.error('API call failed:', error);
          ElMessage.error({
            message: '获取阶段状态失败',
            showClose: false,
            grouping: true,
          });
        });
    },
    
    // loadingBpmnModel() {
    //   this.container = document.getElementById('container');
    //   this.graph && this.graph.dispose();

    //   // console.log("width: ", this.container);

    //   this.graph = new Graph({
    //     container: this.container,
    //     background: {
    //       color: '#F2F7FA',
    //     },
    //     height: '100%',
    //     width: '100%',
    //   });

    //   // console.log(this.graph);
    //   let nodes = [];
    //   let edges = [];
    //   if (this.hierarchyQuearyData) {
    //     this.hierarchyQuearyData.releaseList.forEach((item) => {
    //       nodes.push({ id: item.releaseVersion, label: item.releaseTemplate + ':' + item.releaseVersion });
    //     });
    //     this.hierarchyQuearyData.releaseList.forEach((item) => {
    //       item.parentReleaseList.forEach((parent) => {
    //         if (parent.parentReleaseVersion != null) {
    //           edges.push({
    //             source: { cell: parent.parentReleaseVersion },
    //             target: { cell: item.releaseVersion },
    //             label: parent.frontEndDisplay,
    //           });
    //         }
    //       });
    //     });
    //   }

    //   nodes.map((item) => {
    //     Object.assign(item, {
    //       width: 280,
    //       height: 40,
    //     });
    //   });

    //   edges.map((item) => {
    //     Object.assign(item, {
    //       router: {},
    //       connector: {
    //         // name: 'rounded',
    //       },

    //       //定义实线样式
    //       attrs: {
    //         line: { stroke: '#0e639c' }, // line 指代的元素代表了边的主体
    //       },
    //     });
    //   });

    //   const dagreLayout = new DagreLayout({
    //     type: 'dagre',
    //     rankdir: 'LR',
    //     align: 'UL',
    //     ranksep: 180, //层间距（px）。在 rankdir 为 TB 或 BT 时是竖直方向相邻层间距；在 rankdir 为 LR 或 RL 时代表水平方向相邻层间距
    //     nodesep: 50, //节点间距（px）。在 rankdir 为 TB 或 BT 时是节点的水平间距；在 rankdir 为 LR 或 RL 时代表节点的竖直方向间距
    //     controlPoints: true, //是否保留布局连线的控制点
    //   });

    //   const model = dagreLayout.layout({
    //     nodes: nodes,
    //     edges: edges,
    //   });
    //   this.graph.fromJSON(model);
    //   this.graph.centerContent();
    // },

    // aim() {
    //   this.loadingBpmnModel();
    // },
  },
  // watch: {
    // hierarchyData(newData, prevData) {
    //   this.hierarchyQuearyData = newData;
    //   this.loadingBpmnModel();
    // },
  // },
  computed: {
    ...mapGetters(['getRowDetailByVersion']),
  },
  watch: {
    activeName(newTab) {
      this.$router.push({ query: { ...this.$route.query, tab: newTab } });
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (to.query.tab) {
        vm.activeName = to.query.tab;
      }
      if (to.query.baseLineVersion) {
        const version = to.query.baseLineVersion;
        vm.rowDetail = vm.$store.getters.getRowDetailByVersion(version);
      }
    });
  },
  beforeRouteUpdate(to, from, next) {
    if (to.query.tab) {
      this.activeName = to.query.tab;
    }
    next();
  },
  mounted() {
    setTimeout(() => {
      const version = this.$route.query.baseLineVersion;
      if (version) {
        this.rowDetail = this.$store.getters.getRowDetailByVersion(version);
      }
      if (this.rowDetail) { // 防止当前页面直接刷新报错
        console.log('Row detail exists');
        console.log('this.$route.query.tab:', this.$route.query.tab);
        if (this.$route.query.tab) {
          console.log('Setting activeName from query:', this.$route.query.tab);
          this.activeName = this.$route.query.tab;
        }
        this.versionDetail();
        this.changeDetail()
        this.stageOuput();
        this.openDetail();
      } else {
        console.log('Row detail does not exist');
      }
    }, 0)
  },
};
</script>

<style scoped>
:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

#PublishDetail {
  margin: 5px 20px 5px 20px;
  height: calc(100% - 40px);
}

.publishInfo {
  border: 1px solid #ccc;
  width: 30%;
  height: 100%;
  margin-left: 10px;
}
.el-form {
  margin: 20px;
}

.publishData {
  margin-left: 20px;
  width: 69%;
  border: 1px solid #ccc;
}

#bpmn-container {
  position: relative;
  height: 100%;
  border: 1px solid #ebeef5;
  margin-bottom: 10px;
  overflow: hidden;
}

#container {
  height: 100%;
  width: 100%;
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

#ProjectPageDetail {
  margin: 5px 20px 5px 20px;
  height: calc(100% - 40px);
}

.publishInfo {
  border: 1px solid #ccc;

  height: 100%;
  margin: 5px 20px 5px 20px;
}

.el-form {
  margin: 40px;
  margin-left: 60px;
}

#container {
  height: 90%;
}

.second-task {
  border: 1px solid #ccc;
  margin-top: 10px;
  width: 100%;
  height: 90%;
}

.second-task-button {
  margin: 10px;
  float: right;
  height: 40px;
  clear: both;
  display: flex;
}

.Tablecontainer {
  margin: 10px;
}

.dialog-text {
  font-size: 18px;
  .status-name {
    /* font-weight: bold; */
  }
}
</style>
