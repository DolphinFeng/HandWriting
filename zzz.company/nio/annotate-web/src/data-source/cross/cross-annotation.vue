<template>
  <transition name="el-zoom-in-top">
    <Panel
      center
      v-model:visible="annotationPanelData.visible"
      :width="450"
      :max-width="800"
      :height="270"
      :max-height="600"
      scale-able
    >
      <template #header>
        <div>标注</div>
        <div style="flex: 1"></div>
        <div class="title-close" @click="closePanel">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <article class="event-data">
          <!-- 事件类型 -->
          <div>
            <div style="margin-bottom: 15px">
              <el-radio-group
                v-model="annotationPanelData.labelType"
                :disabled="!tasks.currentTask || tasks.currentTask.taskStep == 'step_tag_adjusting'"
                @change="changeLabel"
              >
                <el-radio v-for="item in annotationTypeLabel" :label="item.value" class="radio-tag">{{
                  item.label
                }}</el-radio>
              </el-radio-group>
            </div>
            <div style="background: #000000; border-radius: 5px">
              <div v-if="annotationPanelData.labelType == 1">
                <el-radio-group
                  v-model="annotationPanelData.labelValue"
                  @change="changeLabel"
                  :disabled="!tasks.currentTask || tasks.currentTask.taskStep == 'step_tag_adjusting'"
                >
                  <el-radio v-for="(val, key) in validLabel" size="small" :label="val" class="radio-tag">{{
                    val + ': ' + key
                  }}</el-radio>
                </el-radio-group>
              </div>
              <div v-else-if="annotationPanelData.labelType == 2">
                <el-radio-group
                  v-model="annotationPanelData.labelValue"
                  @change="changeLabel"
                  :disabled="!tasks.currentTask || tasks.currentTask.taskStep == 'step_tag_adjusting'"
                >
                  <el-radio v-for="(val, key) in repairLabel" size="small" :label="val" class="radio-tag">
                    {{ val + ': ' + key }}
                  </el-radio>
                </el-radio-group>
              </div>
              <div v-else-if="annotationPanelData.labelType == 3">
                <el-radio-group
                  v-model="annotationPanelData.labelValue"
                  :disabled="!tasks.currentTask || tasks.currentTask.taskStep == 'step_tag_adjusting'"
                  @change="changeLabel"
                >
                  <el-radio v-for="(val, key) in invalidLabel" size="small" :label="val" class="radio-tag">{{
                    val + ': ' + key
                  }}</el-radio>
                </el-radio-group>
              </div>
            </div>
          </div>
          <!-- flex空白填充 -->
          <div style="flex: 1"></div>
          <!-- 多选统计信息 -->
        </article>
      </template>
    </Panel>
  </transition>
</template>

<script setup>
import {
  annotationPanelData,
  annotationTypeLabel,
  validLabel,
  repairLabel,
  invalidLabel,
  closeAnnotationPanel,
  saveCrossAnnotationData,
} from './cross-annotation-panel.ts';
import {tasks} from '../../system/task-list.ts';

//单条事件修改模式时的关闭
function closePanel() {
  closeAnnotationPanel();
}

function changeLabel() {
  saveCrossAnnotationData();
}
</script>

<style scoped>
.event-data {
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  padding: 8px 10px 14px;
}
.radio-tag {
  margin-left: 20px;
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 15px;
  user-select: none;
  color: #fff;
}
</style>
