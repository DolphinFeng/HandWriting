<template>
  <div>
    <div id="ProcDefTool">
      <el-form inline :data="procDefForm" ref="form">
        <el-form-item label="流程实例ID：">
          <el-select v-model="procDefForm.procDefId" style="width: 600px" @change="changeProcDefId">
            <el-option
              v-for="item in procDefIdList"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="process-preview">
      <div @wheel="mouseWheel" id="container"></div>
      <div class="button-group">
        <div style="margin-left: 5px;margin-right: 5px;cursor: pointer">
          <el-icon @click="aim"><Aim /></el-icon>
        </div>
<!--        <div style="margin-left: 5px;margin-right: 5px">-->
<!--          <el-icon @click="zoomIn"><ZoomIn /></el-icon>-->
<!--        </div>-->
<!--        <div style="margin-left: 5px;margin-right: 5px">-->
<!--          <el-icon @click="zoomOut"><ZoomOut /></el-icon>-->
<!--        </div>-->
        <div style="margin-left: 5px;margin-right: 5px">
          <el-link :underline="false" :href="href" style="font-size: xx-large;transform: translateY(-8px)">
            <el-icon><Download /></el-icon>
          </el-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import BpmnViewer from "bpmn-js/lib/Viewer";
import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";
import zoomScroll from "../js/zoom_scroll.js";
import {Aim, ZoomIn, ZoomOut, Download} from '@element-plus/icons-vue';
import axios from "axios";
import {ElMessage} from "element-plus";

const nioTaskURL = window.api.nioTaskURL;

export default {
  name: "ProcessPreview",
  // 接收父组件传来的参数
  props: {
    procDefKey: String,
    procDefId: String,
    procDefForm: Object,
  },
  data() {
    return {
      containerEl: null,
      bpmnViewer: null,
      href: "",
      procDefIdList: []
    };
  },
  setup() {
    return {
      Aim, ZoomIn, ZoomOut, Download,
    }
  },
  methods: {
    mouseWheel(ev) {
      ev.deltaY > 0 ? this.zoomOut(ev.offsetX, ev.offsetY) : this.zoomIn(ev.offsetX, ev.offsetY);
    },
    aim() {
      this.bpmnViewer.get("canvas").zoom("fit-viewport");
    },
    zoomIn(x = 100, y = 200) {
      this.bpmnViewer.get("zoomScroll").zoom(1, {
        x: x,
        y: y,
      });
    },
    zoomOut(x = 100, y = 200) {
      this.bpmnViewer.get("zoomScroll").zoom(-1, {
        x: x,
        y: y,
      });
    },
    changeProcDefId() {
      this.href =
        nioTaskURL + "/process/download/" + this.procDefForm.procDefId;
      this.loadData()
    },
    loadData() {
      this.containerEl = document.getElementById("container");
      // 避免缓存，每次清一下
      this.bpmnViewer && this.bpmnViewer.destroy();
      this.bpmnViewer = new BpmnViewer({
        container: this.containerEl,
        height: "100%",
        width: "100%",
        additionalModules: [zoomScroll, MoveCanvasModule],
      });
      axios({
        url: nioTaskURL + "/process/model",
        params: {
          procDefKey: this.procDefKey,
          procDefId: this.procDefForm.procDefId
        },
        method: "get",
      }).then((response) => {
        if (response.data.code === 200) {
          const bpmnXML = response.data.data.bpmnXML;
          const viewer = this.bpmnViewer;
          this.bpmnViewer.importXML(bpmnXML, (err) => {
            if (err) {
              console.error(err);
            } else {
              // 只实现预览，核心代码以下两句足够
              const canvas = viewer.get("canvas");
              canvas.zoom("fit-viewport");
            }
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '获取流程定义文件失败',
          showClose: true,
        });
      });
    },
    loadProcDefId(procDefKey) {
      axios({
        url: nioTaskURL + "/process/proc-def-id/list/" + procDefKey,
        method: "get",
      }).then((response) => {
        if (response.data.code === 200) {
          this.procDefIdList = response.data.data
        }
      }).catch(() => {
        ElMessage.error({
          message: '获取流程定义列表失败',
          showClose: true,
        });
      });
    },
  },
  mounted() {
    this.href =
      nioTaskURL + "/process/download/" + this.procDefForm.procDefId;
    this.loadProcDefId(this.procDefKey);
    this.loadData();
  },
};
</script>
<style scoped>
#ProcDefTool {
  padding: 5px 20px 0 20px;
  text-align: left;
  color: black;
  font-size: 15px;
}

.process-preview {
  width: calc(100% - 30px);
  height: 500px;
  background: #fff;
  border-radius: 0px;
  border: 1px solid #ebeef5;
  margin: 12px 12px 12px 12px;
  position: relative;
}

#container {
  height: 100%;
  width: 100%;
}

.button-group {
  width: 93px;
  height: 40px;
  left: calc(50% - 93px);
  bottom: 0px;
  position: absolute;
  font-size: 38px;
  color: #303132;
  background-color: #f6f6f6;
  border-left: 1px solid #ebeef5;
  border-top: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
  display: flex;
}

.el-form-item {
  margin-bottom: 0px;
}
</style>
