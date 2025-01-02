<template>
  <!-- <div id="bpmn-container" ref="antvContainer"> -->
  <div id="container" @wheel="mouseWheel" ref="graphContainer"></div>
  <div class="button-group">
    <div style="margin-left: 5px; margin-right: 5px">
      <el-icon @click="aim">
        <Aim />
      </el-icon>
    </div>
  </div>
  <!-- </div> -->
</template>

<script>
import { ref, onMounted } from 'vue';
import { Graph } from '@antv/x6';
import { Color, Dom } from '@antv/x6';
import { DagreLayout } from '@antv/layout';
export default {
  name: 'antvDetail',
  props: {
    hierarchyQuearyData: Object,
  },
  data() {
    return {
      antvContainer: null,
      graph: null,
      container: null,
      antvData: {...this.hierarchyQuearyData},
    };
  },

  mounted() {
    this.aim();
  },
  methods: {
    aim() {
      this.loadingBpmnModel();
    },
    loadingBpmnModel() {
      this.container = this.$refs.graphContainer
      this.graph && this.graph.dispose();

      this.graph = new Graph({
        container: this.container,
        background: {
          color: '#F2F7FA',
        },
        height: '100%',
        width: '100%',
        mousewheel: true, //滚轮缩放
        panning: true, //支持平移拖拽
      });

      let nodes = [];
      let edges = [];
      if (this.antvData) {
        this.antvData.releaseList.forEach((item) => {
          nodes.push({ id: item.releaseVersion, label: item.releaseTemplate + ':' + item.descName + '|' + item.releaseVersion});
        });
        this.antvData.releaseList.forEach((item) => {
          item.parentReleaseList.forEach((parent) => {
            if (parent.parentReleaseVersion != null) {
              edges.push({
                source: { cell: parent.parentReleaseVersion },
                target: { cell: item.releaseVersion },
                label: parent.frontEndDisplay,
              });
            }
          });
        });
      }

      nodes.map((item) => {
        Object.assign(item, {
          width: 280,
          height: 40,
        });
      });

      edges.map((item) => {
        Object.assign(item, {
          router: {},
          connector: {
            // name: 'rounded',
          },

          //定义实线样式
          attrs: {
            line: { stroke: '#0e639c' }, // line 指代的元素代表了边的主体
          },
        });
      });

      const dagreLayout = new DagreLayout({
        type: 'dagre',
        // rankdir: 'BT',
        // align: 'DL',
        // ranksep: 80, //层间距（px）。在 rankdir 为 TB 或 BT 时是竖直方向相邻层间距；在 rankdir 为 LR 或 RL 时代表水平方向相邻层间距
        // nodesep: 120, //节点间距（px）。在 rankdir 为 TB 或 BT 时是节点的水平间距；在 rankdir 为 LR 或 RL 时代表节点的竖直方向间距
        rankdir: 'TB',
        align: 'DL',
        ranksep: 20,
        nodesep: 60,
        controlPoints: true, //是否保留布局连线的控制点
      });

      const model = dagreLayout.layout({
        nodes: nodes,
        edges: edges,
      });
      this.graph.fromJSON(model);
      this.graph.centerContent();
    },
  },
};
</script>
<style scoped>
#bpmn-container {
  width: 100%;
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
</style>
