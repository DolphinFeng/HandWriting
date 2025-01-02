<template>
  <div id="ProjectPageDetail">
    <el-tabs v-model="activeName" type="border-card" @tab-click="tabClick" class="detail-panel">
      <!-- 版本关系 -->
      <el-tab-pane label="项目历史" name="second" class="detail-tab">
<!--        <div style="height: 100%">-->
          <el-row :gutter="10">
            <el-col :span="12" style="height: 650px">
              <div class="second-order">
                <el-button :icon="Refresh" @click="refresh" style="margin: 0 5px">刷新</el-button>
                <div id="container" :style="{ width: '100%', height: '100%', backgroundColor: 'lightblue' }" @mousedown="startResize"></div>
              </div>
            </el-col>
            <el-col :span="12"  style="height: 650px">
              <div class="second-task">
                <div class="second-task-button">
                  <div style="margin-right: 60px">
                    <div>阶段开始时间：{{ this.stageStartTime }}</div>
                    <div>阶段结束时间：{{ this.stageEndTime }}</div>
                  </div>
                  <el-button type="primary" @click="reworkdDialog">重启该阶段</el-button>
                  <el-button type="success" @click="endStage">结束该阶段</el-button>
                </div>
                <div style="clear: both"></div>

                <div class="Tablecontainer" v-loading="detailLoading" element-loading-text="拼命加载中..."
                  :element-loading-spinner="svg" element-loading-svg-view-box="-10, -10, 50, 50">
                  <el-table id="p_column" :data="detailTableData" border style="max-height:550px">
                    <el-table-column align="center" type="selection" width="55" fixed="left"></el-table-column>
                    <el-table-column fixed align="center" prop="projectId" label="项目编号" key="projectId" :sortable="false"
                      min-width="80"></el-table-column>
                    <el-table-column fixed align="center" prop="taskId" label="任务号" key="taskId" :sortable="false"
                      min-width="80"></el-table-column>
                    <el-table-column fixed align="center" prop="status" label="状态" key="status" :sortable="false"
                      min-width="80"></el-table-column>
                    <el-table-column fixed align="center" prop="originPlatform" label="来源平台" key="originPlatform"
                      :sortable="false" min-width="80"></el-table-column>
                    <el-table-column align="center" prop="stageCode" label="当前阶段" key="stageCode"
                      min-width="120"></el-table-column>
                    <el-table-column align="center" prop="startTime" label="开始时间" key="startTime" sortable="custom"
                      min-width="180"></el-table-column>
                    <el-table-column align="center" prop="endTime" label="结束时间" key="endTime" sortable="custom"
                      min-width="180"></el-table-column>
                    <el-table-column fixed="right" label="任务操作" min-width="120">
                      <template #default="scope">
                        <el-button type="primary" link size="small"
                          @click="linkRoute(scope.row.taskId, scope.row.projectId)">
                          <span class="handle-detail">详情</span>
                        </el-button>
                        <el-button type="primary" link size="small" @click="handleJson(scope.row.outputMap)">
                          <span class="handle-detail">结果</span>
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
                <JsonView title="结果" v-model:visible="resultVisible" :data="jsonResult"> </JsonView>

                <el-dialog v-model="reworkDialogVisible" title="重启阶段" width="20%">
                  <span>确定重启{{ this.manualCode.name }}阶段吗</span>

                  <template #footer>
                    <span class="dialog-footer">
                      <el-button @click="reworkDialogVisible = false">取消</el-button>
                      <el-button type="primary" @click="reworkStage"> 确定 </el-button>
                    </span>
                  </template>
                </el-dialog>

                <el-dialog v-model="dialogVisible" title="结束阶段" width="30%">
                  <span>结束{{ this.manualCode.name }}阶段</span>
                  <el-form label-width="150px" style="max-width: 460px" v-model="dialogFrom" :rules="rules"
                    ref="ruleFormRef">
                    <el-form-item label="任务号" prop="taskId" v-if="taskIdVisible">
                      <el-input v-model="dialogFrom.taskId" placeholder="请输入以英文字符分隔的任务号" />
                    </el-form-item>
                    <el-form-item :label="item.text" v-for="item in dialogFrom.output" prop="output">
                      <el-input v-model="item.content" />
                    </el-form-item>
                    <el-form-item label="备注" prop="remark">
                      <el-input v-model="dialogFrom.remark" />
                    </el-form-item>
                  </el-form>

                  <template #footer>
                    <span class="dialog-footer">
                      <el-button @click="dialogVisible = false">取消</el-button>
                      <el-button type="primary" @click="repeatEndStage"> 确定 </el-button>
                    </span>
                  </template>
                </el-dialog>
              </div>
            </el-col>
        </el-row>
      </el-tab-pane>
      <!-- <el-tab-pane label="项目耗时复盘" name="third" class="detail-tab"> 
            <div>
              <el-table :data="tableData" border >
                <el-table-column prop="" label="执行顺序"  />
                <el-table-column prop="" label="阶段序号" />
                <el-table-column prop="" label="执行阶段" />
                <el-table-column prop="" label="是否为阶段级返工"  />
                <el-table-column prop="" label="耗时（小时）" />
                <el-table-column prop="" label="耗时（天）"  />
                <el-table-column prop="" label="开始时间" width="180"/>
                <el-table-column prop="" label="结束时间" width="180"/>
              </el-table>
              </div>
        </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
import { reactive, ref, watch, toRefs, defineProps } from 'vue';
import { Graph } from '@antv/x6';
import JsonView from '@/jsonView/JsonView.vue';
import { DagreLayout } from '@antv/layout';
import axios from 'axios';
import { Refresh } from '@element-plus/icons-vue';

import { useRouter } from 'vue-router';
import store from '../../store/index.js';
import { svg } from '@/js/loading_data.js';
import '@/assets/me.png';
import { ElMessage } from 'element-plus';
const nioProjectService = window.api.nioProjectService;
export default {
  name: 'ProjectPageDetail',
  components: {
    JsonView,
  },
  props: {
    vertexesData: Object,
    drafterId: Number,
    detailLoading: Boolean,
    detailTableData: Array,
    rowDetail: Object,
    projectId: String,
    stageEndTime: String,
    stageStartTime: String,
  },
  data() {
    return {
      svg: svg,
      tableData: [],
      taskTableData: [],
      vertexesQueryData: {},
      graph: null,
      vertexes: [
        {
          id: '171',
          dependences: [],
        },
      ],
      stageCode: '',
      reworkDialogVisible: false,
      dialogVisible: false,
      jsonResult: null,
      resultVisible: false,
      dialogFrom: {
        remark: '',
        taskId: '',
        output: {},
      },

      manualCode: {},

      rules: {
        taskId: [{ required: true, message: '不能为空', trigger: 'blur' }],
        output: [{ required: true, message: '不能为空', trigger: 'blur' }],
      },

      taskIdVisible: true,

      boxHeight: 430,
      isResizing: false,
      startX: 0,
      startY: 0,
      borderThickness: 5
    };
  },
  setup() {
    const activeName = ref('second');

    const router = useRouter();
    const linkRoute = function (taskId, projectId) {
      router.push({ path: '/TaskPage', query: { taskId, projectId } });
    };
    const ruleFormRef = ref();

    return {
      activeName,
      linkRoute,
      ruleFormRef,
      Refresh,
    };
  },

  methods: {
    refresh() {
      this.$emit('refresh');
    },

    // tab点击函数
    tabClick(tab, event) { },
    getAssetsFile(url) {
      return new URL(`/src/assets/${url}`, import.meta.url).href;
    },

    loadingModel() {
      // const male = 'src/assets/me.png';
      const male = this.getAssetsFile('me.png')
      Graph.registerNode(
        'custom-node',
        {
          inherit: 'rect', // 继承于 rect 节点
          width: 200,
          height: 40,
          markup: [
            {
              tagName: 'rect', // 标签名称
              selector: 'body', // 选择器
            },
            {
              tagName: 'image',
              selector: 'img',
            },
            {
              tagName: 'text',
              selector: 'label',
            },
          ],
          attrs: {
            img: {
              width: 16,
              height: 16,
              x: 12,
              y: 12,
            },
          },
        },
        true
      );
      this.graph && this.graph.dispose();
      this.graph = new Graph({
        container: document.getElementById('container'),
        background: {
          color: '#F2F7FA',
        },
        mousewheel: true, //滚轮缩放
        panning: true, //支持平移拖拽
      });

      const data = {
        nodes: [],
        edges: [],
      };

      const newEdges = [];

      this.vertexesQueryData.vertexes.forEach((item) => {
        if (item.dependences.length > 0) {
          item.dependences.forEach((parent) => {
            newEdges.push([parent.dependenceVertexId.toString(), item.id.toString()]);
          });
        }
      });

      this.vertexesQueryData.vertexes.forEach((item) => {
        if (this.vertexesQueryData.vertexes.length > 0) {
          let obj = {
            shape: 'custom-node',
            id: `${item.id.toString()}`,
            label: item.name,
            attrs: {},
          };
          // //运行中阶段
          if (item.finished === false && item.running === true) {
            obj.attrs['body'] = {
              stroke: '#5d9d52',
            };
            obj.attrs['label'] = {
              fill: '#5d9d52',
            };
          }

          // //结束阶段
          if (item.finished === true) {
            obj.attrs['body'] = {
              stroke: '#ec9135',
            };
            obj.attrs['label'] = {
              fill: '#ec9135',
            };
          }

          if (item.manual === true) {
            obj.attrs['img'] = {
              xlinkHref: male,
            };
          }

          data.nodes.push(obj);
        }
      });

      newEdges.forEach((edge) => {
        data.edges.push({
          source: edge[0],
          target: edge[1],
          attrs: {
            line: {
              stroke: '#A2B1C3',
              strokeWidth: 2,
            },
          },
        });
      });

      const dagreLayout = new DagreLayout({
        type: 'dagre',
        rankdir: 'BT',
        align: 'DL',
        ranksep: 20,
        nodesep: 60,
      });

      const model = dagreLayout.layout(data);
      this.graph.fromJSON(model);
      this.graph.centerContent();
      this.graph.zoomToFit();
      this.graph.on('node:click', ({ node }) => {
        if (node.label != undefined) {
          this.reset();
          let name = node.label;
          //根据name找到点击节点所有信息
          this.manualCode = this.vertexesQueryData.vertexes.find((ele) => {
            if (ele.name === name) {
              return ele;
            }
          });

          this.stageCode = this.manualCode.code;

          node.attr('body/fill', '#B0E0E6');
          this.clickStage(this.stageCode);
        } else {
          ElMessage.error({
            message: '无法获取阶段名称',
            showClose: true,
          });
        }
      });
    },

    reset() {
      const nodes = this.graph.getNodes();
      nodes.forEach((node) => {
        node.attr('body/fill', 'white');
      });
    },

    clickStage(stageCode) {
      this.$emit('clickStage', stageCode);
    },

    reworkdDialog() {
      if (this.stageCode == '') {
        ElMessage.error({
          message: '请点击阶段',
          showClose: true,
        });
        return;
      }
      if (this.manualCode.finished === false && this.manualCode.running === false) {
        ElMessage.error({
          message: '该阶段尚未开始，不能重启',
          showClose: true,
        });
        return;
      }
      this.reworkDialogVisible = true;
    },

    reworkStage() {
      this.$emit('reworkStage');
      this.reworkDialogVisible = false;
    },

    endStage() {
      if (this.stageCode == '') {
        ElMessage.error({
          message: '请点击阶段',
          showClose: true,
        });
        return;
      }
      if (this.manualCode.finished === true) {
        ElMessage.error({
          message: '该阶段已结束',
          showClose: true,
        });
        return;
      }

      if (this.manualCode.finished === false && this.manualCode.running === false) {
        ElMessage.error({
          message: '该阶段尚未开始',
          showClose: true,
        });
        return;
      }

      if (this.manualCode.manual === false) {
        this.taskIdVisible = false;
      }

      if (this.manualCode.manual === true) {
        this.taskIdVisible = true;
      }

      this.dialogVisible = true;
      axios({
        url: nioProjectService + '/config/stage/query',
        method: 'post',
        data: {
          projectId: this.projectId,
          stageCode: this.stageCode, //阶段编码
          manual: this.manualCode.manual, //是否人工阶段
        },
      })
        .then((response) => {
          if (response.data.code === 200) {
            this.dialogFrom.output = response.data.data[0].stageConfig.output;
            if (this.dialogFrom.output.length > 0) {
              this.dialogFrom.output['content'] = '';
            }
          }
        })
        .catch((err) => {
          console.log(err);
          ElMessage.error({
            message: err,
            showClose: true,
          });
        });
    },

    repeatEndStage() {
      let data = {};
      let output = {};
      if (this.dialogFrom.output.length > 0) {
        this.dialogFrom.output.forEach((item, index) => {
          if (item.content == undefined || item.content == '') {
            ElMessage.error({
              message: '请填写表单',
              showClose: true,
            });
            return;
          }
          output[item.name] = item.content;
        });
      }

      let task = this.dialogFrom.taskId.split(',');

      data = {
        output,
        projectId: this.projectId,
        stageCode: this.stageCode,
        remark: this.dialogFrom.remark,
      };

      if (this.taskIdVisible === true) {
        if (task[0] == '' && task.length == 1) {
          ElMessage.error({
            message: '请填写表单',
            showClose: true,
          });
        } else {
          data['taskIds'] = task;
        }
      } else if (task[0] == '' && task.length == 1 && this.taskIdVisible === false) {
        data['taskIds'] = [];
      }

      axios({
        url: nioProjectService + '/project/stage/signal',
        method: 'post',
        data: data,
      })
        .then((response) => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: '结束阶段成功',
              showClose: true,
            });
            // this.loadingModel();
            this.$emit('repeatEndStage');
          }
        })
        .catch((err) => {
          console.log(err);
          ElMessage.error({
            message: '结束阶段失败',
            showClose: true,
          });
        })
        .finally(() => {
          this.dialogFrom = {
            taskId: '',
            output: {},
          };
          this.dialogVisible = false;
        });
    },

    handleJson(outputMap) {
      this.jsonResult = outputMap;
      this.resultVisible = true;
    },

    // startResize(event) {
    //   this.isResizing = true;
    //   //this.startX = event.clientX;
    //   this.startY = event.clientY;
 
    //   document.addEventListener('mousemove', this.doResize);
    //   document.addEventListener('mouseup', this.stopResize);
    // },
    // doResize(event) {
    //   if (this.isResizing) {
    //     //this.boxWidth += event.clientX - this.startX;
    //     this.boxHeight += event.clientY - this.startY;
    //     //this.startX = event.clientX;
    //     this.startY = event.clientY;
    //   }
    // },
    // stopResize() {
    //   this.isResizing = false;
    //   document.removeEventListener('mousemove', this.doResize);
    //   document.removeEventListener('mouseup', this.stopResize);
    // }

    startResize(event) {  
      const rect = this.$el.getBoundingClientRect();  
      const mouseY = event.clientY - rect.top;  
  
      // 检查鼠标是否在“边框”上  
      if (mouseY > rect.height - this.borderThickness) {  
        this.isResizing = true;  
        this.startY = event.clientY;  
  
        document.addEventListener('mousemove', this.doResize);  
        document.addEventListener('mouseup', this.stopResize);  
  
        // 阻止默认事件和冒泡  
        event.preventDefault();  
      }  
    },  
    doResize(event) {  
      if (this.isResizing) {  
        this.boxHeight = Math.max(20, this.startY - event.clientY + this.boxHeight); // 最小高度限制  
      }  
    },  
    stopResize() {  
      this.isResizing = false;  
      document.removeEventListener('mousemove', this.doResize);  
      document.removeEventListener('mouseup', this.stopResize);  
    }




  },
  watch: {
    vertexesData(newData, prevData) {
      try {
        this.vertexesQueryData = newData;
        if (this.vertexesQueryData) {
          this.loadingModel();
        }
      } catch (error) {
        console.error('Watch error:', error);
      }
    },
  },

  mounted() { },
};
</script>

<style scoped>
:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
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

.second-order {
  border: 1px solid #ccc;
  width: 100%;
  height: 100%;
}

#container {
  z-index: 1000;
  height: 90%;
  width: 100%;
  border: 1px solid #000;
  resize: vertical;
  overflow: auto;
}

.second-task {
  border: 1px solid #ccc;
  /*margin-top: 10px;*/
  width: 100%;
  height: 100%;
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
</style>
