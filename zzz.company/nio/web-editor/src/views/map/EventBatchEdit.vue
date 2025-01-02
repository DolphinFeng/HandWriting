<template>
  <Panel v-model:visible="editTypePanelData.visible" center title-center :width="450" :height="350">
    <template #header>
      <div class="batch-edit-title">{{ '当前选中' + editTypePanelData.count + '条' }}</div>
    </template>
    <template #default>
      <div class="quality-box">
        <!-- 事件类型 -->
        <div class="aside-form-item">
          <div class="aside-form-label">事件类型</div>
          <el-radio-group
            :disabled="
              taskData.runningTask?.mapVersion.toString() !== store.state.version.curVersion.toString() ||
              (taskData.runningTask !== null && taskData.runningTask.typeCode === 'ao_event_making')
            "
            v-model="editTypePanelData.type"
          >
            <el-radio v-for="(val, key) in EventType" size="small" :label="key">{{ val + ': ' + key }}</el-radio>
          </el-radio-group>
        </div>

        <!-- 法规限速 -->
        <div v-if="editTypePanelData.type === '法规限速'" class="aside-form-item">
          <div class="aside-form-label">法规限速</div>
          <el-input-number
            placeholder="请输入法规限速"
            :min="0"
            value-on-clear="min"
            size="small"
            :disabled="taskData.runningTask?.mapVersion.toString() !== store.state.version.curVersion.toString()"
            v-model="editTypePanelData.lawLimitSpeed"
            controls-position="right"
            class="property-item-width"
          ></el-input-number>
        </div>
        <!-- 经验限速 -->
        <div v-if="editTypePanelData.type === '经验限速'" class="aside-form-item">
          <div class="aside-form-label">经验限速</div>
          <el-input-number
            placeholder="请输入经验限速"
            :min="0"
            value-on-clear="min"
            size="small"
            :disabled="taskData.runningTask?.mapVersion.toString() !== store.state.version.curVersion.toString()"
            v-model="editTypePanelData.exLimitSpeed"
            controls-position="right"
            class="property-item-width"
          ></el-input-number>
        </div>
        <div v-if="editTypePanelData.type === 'lane_types_cs替换'" class="aside-form-item">
          <div class="aside-form-label">info_value_list</div>
          <div
            v-if="editTypePanelData.infoValueList > 20 || editTypePanelData.infoValueList < 1"
            class="aside-form-label2"
          >
            请输入1到20的值
          </div>
          <el-input-number
            placeholder="请输入"
            value-on-clear="min"
            size="small"
            :disabled="taskData.runningTask?.mapVersion.toString() !== store.state.version.curVersion.toString()"
            v-model="editTypePanelData.infoValueList"
            controls-position="right"
            class="property-item-width"
          ></el-input-number>
        </div>
        <div class="footer-btn-group">
          <button class="footer-btn confirm" title="保存事件" @click="confirmHandler">确定</button>
          <button style="margin-left: 40px" class="footer-btn cancel" title="取消" @click="cancelHandler">取消</button>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script setup>
import Panel from '../../components/panel/Panel.vue';
import {useStore} from 'vuex';
import {editTypePanelData, workEventTableRef} from '../../system/EventBatchEdit.js';
import {taskData} from '../../system/task/taskList/taskList.js';
import {opHistory} from '../../system/odd/history/history.js';
import {EventType, DynamicInfo} from '../../system/odd/enum/EventType.js';
import {modifiedWorkEvents} from '../../system/EventBatchEdit.js';
import {updateEventListPanel, status_invalid} from '../../system/odd/batch/eventList.js';
import {oddLayer} from '../../system/odd/oddLayer.js';
import {OddOpRecord} from '../../system/odd/history/OddOpRecord.js';
import {OpType} from '../../system/odd/enum/OpType.js';
import {NioMessage} from '../../utils/utils';

const store = useStore();

function cancelHandler() {
  editTypePanelData.visible = false;
}

function confirmHandler() {
  editTypePanelData.visible = false;

  //let event_ids = [];
  let changed_ids = new Set();
  let lane_odd_map = new Map();
  let selected_rows = editTypePanelData.selectedRows;

  for (let i = 0; i < selected_rows.length; i++) {
    let row = selected_rows[i];

    //只编辑有效的
    if (row.status === status_invalid) {
      NioMessage('warning', '无效的事件不会被修改');
      continue;
    }

    //只修改值不一样的
    let work_event = modifiedWorkEvents.get(row.eventId);
    if (DynamicInfo[work_event.dynamicInfo] !== editTypePanelData.type) {
      if (!lane_odd_map.has(work_event.featureId)) {
        lane_odd_map.set(work_event.featureId, new Set());
      }

      work_event.dynamicInfo = EventType[editTypePanelData.type];
      if (work_event.dynamicInfo === 2) {
        //经验限速
        work_event.expSpdlmt = editTypePanelData.exLimitSpeed;
      } else if (work_event.dynamicInfo === 3) {
        //法规限速
        work_event.lawSpdlmt = editTypePanelData.lawLimitSpeed;
      }

      changed_ids.add(work_event.eventId);
      lane_odd_map.get(work_event.featureId).add(work_event.eventId);
    }
  }

  updateEventListPanel(changed_ids);

  let lanes = [];
  let oddDataLists = [];
  for (let [key, value] of lane_odd_map) {
    let lane = oddLayer.oddLanes.get(key);

    let lane_odds = [];
    for (let item of value.values()) {
      //let oddDataList = oddLayer.removeLaneByEventId(key, item);
      for (let i = 0; i < lane.oddDataList.length; i++) {
        if (lane.oddDataList[i].eventId === item) {
          lane_odds.push(lane.oddDataList[i].copy());

          lane.oddDataList[i].type = editTypePanelData.type;
          if (editTypePanelData.type === DynamicInfo[3]) {
            lane.oddDataList[i].lawSpeed = editTypePanelData.lawLimitSpeed;
          } else if (editTypePanelData.type === DynamicInfo[2]) {
            lane.oddDataList[i].exSpeed = editTypePanelData.exLimitSpeed;
          }
        }
      }
    }

    lanes.push(lane);
    lane.setStyle('ARROW_EVENT');
    oddDataLists.push(lane_odds);
  }

  if (lanes.length != 0 && oddDataLists.length != 0) {
    opHistory.push(new OddOpRecord(OpType.MODIFY, lanes, oddDataLists));
    workEventTableRef.value.clearSelection();
  }
}
</script>

<style scoped>
.batch-edit-title {
  color: #7e8cf1;
  font-size: 15px;
}

.quality-box {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  height: 100%;
  padding: 14px 12px;
  user-select: none;
}

.save-info-box {
  margin: 25px 20px 0;
  font-size: 14px;
}
</style>
