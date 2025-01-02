<template>
  <Panel
      center
      :top="100"
      scale-able
      :width="initialWidth" :max-width="1850" :min-width="400"
      :header-style="{boxShadow: 'none', backgroundColor: '#333745'}"
      :height="initialHeight" :min-height="300"
      v-model:visible="qualityTagListVisible"
      @changeSize="changeSize"

  >
    <template #header>
      <div class="batch-title">质检标列表</div>
      <div style="flex: 1"></div>
      <div class="batch-panel-close" @click="closeQualityTagListPane">
        <i class="iconfont icon-guanbi1"></i>
      </div>
    </template>
    <template #default>
      <div class="batch-body-box">
        <div style="height: 1px;background-color: #849fb9;margin: 0 4px;"></div>
        <div class="batch-body-table" ref="tableBody">
          <el-scrollbar v-if="taskData.runningTask !== null && taskData.runningTask.qualityValidTagList !== null && taskData.runningTask.qualityValidTagList.length > 0">
            <ul>
              <li v-for="(item, idx) in taskData.runningTask.qualityValidTagList" class="task-item">
                <div class="task-item-info">
                  <div class="task-item-title">
                    <div class="title-txt" @click="locateTag($event)" :data-idx="idx">{{ item.id === null ? 0 : item.id }}</div>
                  </div>
                  <div class="space"></div>
                  <div>
                    <button v-if="taskData.runningTask.workKey === WorkKeys.step_user_check" class="task-item-btn gray-btn" :data-idx="idx" @click="deleteTag($event)">删除</button>
                  </div>
                </div>
                <div class="task-content-box">
                  <div class="task-content-des-main">
                    <div class="task-data">{{ tagTypeMap[item.type] }}</div>
                    <div class="task-data-border task-data">{{ item.desc === null || item.desc === '' ? '...' : item.desc }}</div>
                    <div class="task-data-border task-data">{{ tagResultMap[item.result] }}</div>
                  </div>
                </div>
              </li>
            </ul>
          </el-scrollbar>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script setup>
import Panel from "../../../components/panel/Panel.vue";
import {ref} from "vue";
import {debounce} from "../../../utils/compute.js";
import {taskData, WorkKeys, checkTaskVersionMatch} from "../../../system/task/taskList/taskList.js"
import {setQualityTagListVisible, qualityTagListVisible} from "../../../system/task/quality/tag/QualityTags.js"
import {tagTypeMap, tagResultMap, deleteQualityTagHandler} from "../../../system/task/quality/quality.js";
import {nioCamera, NioMessage} from "../../../utils/utils.js";
import {Cartesian3, Cartographic} from "cesium";


const tableBody = ref(null);

const initialWidth = parseInt(localStorage.getItem('qulityTagPanelWidth') ?? 1000);
const initialHeight = parseInt(localStorage.getItem('qulityTagPanelHeight') ?? 400);

function deleteTag(ev){
  const idx = ev.target.dataset.idx;
  let current_tag = taskData.runningTask.qualityValidTagList[idx];

  if (!checkTaskVersionMatch()) {
    NioMessage('warning', '当前选择的版本与任务版本不符，请切换后重试');
  } else {
    deleteQualityTagHandler(current_tag);
  }
}

function locateTag(ev){
  const idx = ev.target.dataset.idx;
  const pos = taskData.runningTask.qualityValidTagList[idx].position;

  const target_pos = Cartographic.fromCartesian(pos);
  target_pos.height += 100;

  const new_pos = Cartesian3.fromRadians(target_pos.longitude, target_pos.latitude, target_pos.height);

  nioCamera.locatePosition({
    position: new_pos,
    duration: 2,
    animate: true,
    before() {
    },
    completed() {
    }
  });
}

function closeQualityTagListPane() {
  setQualityTagListVisible(false);
}

const setInitialWidth = debounce(function (width, height) {
  localStorage.setItem('qulityTagPanelWidth', width);
  localStorage.setItem('qulityTagPanelHeight', height);
},500);

function changeSize(width, height) {
  setInitialWidth(width, height);
}

</script>
<style>

</style>
<style scoped>
:deep(.title-txt) {
  color: rgb(247, 164, 21);
}

.batch-title {
  font-size: 14px;
}
.batch-panel-close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #959696;
  border-radius: 50%;
  color: #959696;
  margin-right: 10px;
}
.batch-body-box {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  padding: 0 6px;
}
.batch-body-table {
  flex: 1;
  overflow: hidden;
}
.task-item {
  margin: 10px 8px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #565861;
  overflow: hidden;
}
.task-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}
.task-item-info {
  display: flex;
  align-items: flex-start;
}
.task-item-title {
  display: flex;
  align-items: center;
}
.task-content-box {
  font-size: 13px;
  color: #b7b8ba;
}
.task-content-des-main {
  display: flex;
}
.task-data {
  margin: 3px 3px 3px 0;
  box-sizing: content-box;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #CFD3DC;
}
.task-data-border {
  border-left: 1px solid #b7b8ba;
  padding-left: 3px;
}
.task-item-btn {
  padding: 3px 8px;
  border: none;
  margin-left: 6px;
  border-radius: 2px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  text-align: center;
}
.gray-btn {
  background-color: #6d6c6c;
}
.gray-btn:hover {
  background-color: #919191;
}
.gray-btn:active {
  background-color: #505050;
}

</style>
