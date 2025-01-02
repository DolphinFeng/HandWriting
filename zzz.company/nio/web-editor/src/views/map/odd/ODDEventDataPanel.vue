<template>
  <article class="event-data" @mousedown.left="copyText($event)">
    <div v-if="oddPanelData.panelOpenType === PanelOpenType.MODIFY_ONE">
      <!-- 单条编辑模式下不同odd之间切换 -->
      <div v-if="oddPanelData.curOddSize !== 0" class="aside-form-item odd-idx">
        <div class="odd-total">
          共 <span class="odd-number">{{ oddPanelData.curOddSize }}</span> 条事件
        </div>
        <div class="change-odd" @click="addOddIdx(-1)">
          <i class="iconfont icon-shangyishoushangyige"></i>
        </div>
        <div>
          <div class="progress-count">
            当前：<span class="odd-number">{{ oddPanelData.curEventIdx + 1 }}</span>
          </div>
        </div>
        <div class="change-odd" style="transform: rotateZ(180deg)" @click="addOddIdx(1)">
          <i class="iconfont icon-shangyishoushangyige"></i>
        </div>
      </div>
      <!-- 事件Id -->
      <div v-if="oddPanelData.eventId" class="aside-form-item">
        <div class="aside-form-label">事件id</div>
        <div class="text-only copy-text">{{ oddPanelData.eventId }}</div>
      </div>
    </div>
    <!-- 事件类型 -->
    <div class="aside-form-item">
      <div style="margin-bottom: 15px">
        <el-radio-group v-model="oddPanelData.adFunctionType" @change="changeAdFuncType">
          <el-radio v-for="item in AdFunctionTypeLabel" :label="item.value">{{ item.label }}</el-radio>
        </el-radio-group>
      </div>
      <div class="aside-form-label">事件类型</div>
      <div v-if="oddPanelData.adFunctionType == 1">
        <!-- ao_speedlimit_making只可修改source是1的数据 -->
        <el-radio-group
          :disabled="
            taskData.runningTask?.mapVersion.toString() !== store.state.version.curVersion.toString() ||
            taskData.runningTask.workKey === WorkKeys.step_user_check ||
            (taskData.runningTask !== null && taskData.runningTask.typeCode === 'ao_event_making') ||
            (taskData.runningTask !== null &&
              taskData.runningTask.typeCode === 'ao_speed_limit_making' &&
              oddPanelData.source !== 1)
          "
          v-model="oddPanelData.type"
          @change="changeType"
        >
          <el-radio v-for="(val, key) in EventTypeNop" size="small" :label="key">{{ val + ': ' + key }}</el-radio>
        </el-radio-group>
      </div>
      <div v-else-if="oddPanelData.adFunctionType == 2">
        <!-- ao_speedlimit_making只可修改source是1的数据 -->
        <el-radio-group
          :disabled="
            taskData.runningTask?.mapVersion.toString() !== store.state.version.curVersion.toString() ||
            taskData.runningTask.workKey === WorkKeys.step_user_check ||
            (taskData.runningTask !== null && taskData.runningTask.typeCode === 'ao_event_making') ||
            (taskData.runningTask !== null &&
              taskData.runningTask.typeCode === 'ao_speed_limit_making' &&
              oddPanelData.source !== 1)
          "
          v-model="oddPanelData.type"
          @change="changeType"
        >
          <el-radio v-for="(val, key) in EventTypeNad" size="small" :label="key">{{ val + ': ' + key }}</el-radio>
        </el-radio-group>
      </div>
    </div>
    <!-- 法规限速 -->
    <div v-if="oddPanelData.type === '法规限速'" class="aside-form-item">
      <div class="aside-form-label">法规限速</div>
      <el-input-number
        placeholder="请输入法规限速"
        :min="0"
        value-on-clear="min"
        size="small"
        :disabled="taskData.runningTask?.mapVersion.toString() !== store.state.version.curVersion.toString()"
        v-model="oddPanelData.lawLimitSpeed"
        controls-position="right"
        class="property-item-width"
        @change="changeLaw"
      ></el-input-number>
    </div>
    <!-- 经验限速 -->
    <div v-if="oddPanelData.type === '经验限速'" class="aside-form-item">
      <div class="aside-form-label">经验限速</div>
      <el-input-number
        placeholder="请输入经验限速"
        :min="0"
        value-on-clear="min"
        size="small"
        :disabled="taskData.runningTask?.mapVersion.toString() !== store.state.version.curVersion.toString()"
        v-model="oddPanelData.exLimitSpeed"
        controls-position="right"
        class="property-item-width"
        @change="changeEx"
      ></el-input-number>
    </div>
    <div v-if="oddPanelData.type === 'lane_types_cs替换'" class="aside-form-item">
      <div class="aside-form-label">info_value_list</div>
      <div v-if="oddPanelData.infoValueList > 20 || oddPanelData.infoValueList < 1" class="aside-form-label2">
        请输入1到20的值
      </div>
      <el-input-number
        placeholder="请输入"
        value-on-clear="min"
        size="small"
        :disabled="taskData.runningTask?.mapVersion.toString() !== store.state.version.curVersion.toString()"
        v-model="oddPanelData.infoValueList"
        controls-position="right"
        class="property-item-width"
        @change="changeInfoValueList"
      ></el-input-number>
    </div>
    <!-- 编辑或创建单条ODD时显示 -->
    <div v-if="[PanelOpenType.MODIFY_ONE].includes(oddPanelData.panelOpenType)">
      <!-- 要素ID -->
      <div class="aside-form-item">
        <div class="aside-form-label">要素id</div>
        <div class="text-only">{{ oddPanelData.featureId }}</div>
      </div>
      <!-- 起始位置 -->
      <div class="aside-form-item">
        <div class="aside-form-label">起始位置</div>
        <input readonly v-model="oddPanelData.stPos" class="property-input" type="text" placeholder="请设置起始位置" />
      </div>
      <!-- 结束位置 -->
      <div class="aside-form-item">
        <div class="aside-form-label">结束位置</div>
        <input readonly v-model="oddPanelData.edPos" class="property-input" type="text" placeholder="请设置结束位置" />
      </div>
      <!-- 来源 -->
      <div class="aside-form-item">
        <div class="aside-form-label">来源</div>
        <div class="text-only">{{ OddSource[oddPanelData.source] }}</div>
      </div>
      <!-- siteMapId -->
      <div v-if="oddPanelData.siteMapId !== null && oddPanelData.siteMapId !== undefined" class="aside-form-item">
        <div class="aside-form-label">site id</div>
        <div class="text-only">{{ oddPanelData.siteMapId }}</div>
      </div>
      <!-- memo -->
      <div v-if="oddPanelData.memo !== null && oddPanelData.memo !== undefined" class="aside-form-item">
        <div class="aside-form-label">备注</div>
        <div class="text-only">{{ oddPanelData.memo }}</div>
      </div>
    </div>
    <!-- flex空白填充 -->
    <div style="flex: 1"></div>
    <!-- 多选统计信息 -->
    <footer
      v-if="[PanelOpenType.CREATE_MULTI, PanelOpenType.MODIFY_MULTI].includes(oddPanelData.panelOpenType)"
      class="event-footer"
    >
      <div class="event-footer-data">
        <div class="event-footer-txt">本次共计选中：</div>
        <!-- 创建多条 -->
        <div v-if="oddPanelData.panelOpenType === PanelOpenType.CREATE_MULTI">
          <!-- lane组 -->
          <div v-if="oddPanelData.selectType === oddDatalayerName.Lane" class="event-footer-txt">
            <span class="event-number">{{ oddPanelData.laneGroups }}</span
            >条{{ oddPanelData.selectType }}组
          </div>
          <!-- lane数量 -->
          <div class="event-footer-txt">
            <span class="event-number">{{ oddPanelData.lanes }}</span
            >条{{ oddPanelData.selectType }}
          </div>
          <div class="event-footer-txt">点击确定后，会批量转为{{ oddPanelData.lanes }}条事件数据</div>
        </div>
        <!-- 修改多条 -->
        <div v-else-if="oddPanelData.panelOpenType === PanelOpenType.MODIFY_MULTI">
          <div class="event-footer-txt">
            <span class="event-number">{{ oddPanelData.lanes }}</span
            >条事件数据（面板显示第一条事件对应属性）
          </div>
          <div class="event-footer-txt">点击确定后，将批量修改{{ oddPanelData.lanes }}条事件数据</div>
        </div>
      </div>
      <div class="footer-btn-group">
        <button class="footer-btn cancel" title="取消" @click="cancelHandler">取消</button>
        <button class="footer-btn confirm" title="保存事件" @click="confirmHandler">确定</button>
      </div>
    </footer>
  </article>
</template>

<script setup>
import {
  isPaneModeEqual,
  oddPanelData,
  PanelOpenType,
  setPanelMode,
  canEdit,
} from '../../../system/odd/eventPanel/oddPanelData.js';
import {oddLayer} from '../../../system/odd/oddLayer.js';
import {useStore} from 'vuex';
import {hoverOddLayer, oddDatalayerName} from '../../../system/odd/hoverOddLayer.js';
import {EventTypeNop, EventTypeNad} from '../../../system/odd/enum/EventType.js';
import {AdFunctionTypeLabel} from '../../../system/odd/enum/AdFunctionType.js';
import {OddSource} from '../../../system/odd/enum/OddSource.js';
import {copyTextToClipboard} from '../../../utils/copy.js';
import {opHistory} from '../../../system/odd/history/history.js';
import {OpType} from '../../../system/odd/enum/OpType.js';
import {OddOpRecord} from '../../../system/odd/history/OddOpRecord.js';
import {NioMessage} from '../../../utils/utils.js';
import TaskStage from '../../../system/task/taskList/enum/TaskStage.js';
import {taskData, WorkKeys} from '../../../system/task/taskList/taskList.js';
import {resetTrajForm} from '../../../system/odd/trajectory/trajectory.js';

const store = useStore();

//单条事件修改模式时的关闭
function closePanel() {
  setPanelMode(PanelOpenType.CLOSE);
}

//切换odd
function addOddIdx(num) {
  let total = oddPanelData.curOddSize;
  let newIdx = oddPanelData.curEventIdx + num;
  if (newIdx >= total) {
    oddPanelData.curEventIdx = 0;
  } else if (newIdx < 0) {
    oddPanelData.curEventIdx = total - 1;
  } else {
    oddPanelData.curEventIdx = newIdx;
  }
  [...oddLayer.hoverEvent.values()][0].activeOddIdx = oddPanelData.curEventIdx;
}

//复制文字事件代理
function copyText(ev) {
  let target = ev.target;
  if (target && target.classList.contains('copy-text')) {
    copyTextToClipboard(target.innerText);
  }
}

//取消事件
function cancelHandler() {
  if ([PanelOpenType.MODIFY_ONE, PanelOpenType.MODIFY_MULTI].includes(oddPanelData.panelOpenType)) {
    //编辑模式下取消
    oddLayer.clearHoverEvent();
  } else {
    //创建模式下取消
    hoverOddLayer.clearHoverLanes();
  }
  setPanelMode(PanelOpenType.CLOSE);
}

//确定保存事件
function confirmHandler() {
  if (taskData.taskStage === TaskStage.WORKING) {
    if (isPaneModeEqual(PanelOpenType.MODIFY_MULTI)) {
      //批量编辑模式下确认
      oddLayer.modifyEventLanes(
        oddPanelData.type,
        oddPanelData.lawLimitSpeed,
        oddPanelData.exLimitSpeed,
        oddPanelData.infoValueList,
      );
    } else {
      //创建模式下确认，创建若干条Odd
      oddLayer.show = true;
      oddLayer.createEventLanes(
        oddPanelData.type,
        oddPanelData.lawLimitSpeed,
        oddPanelData.exLimitSpeed,
        oddPanelData.infoValueList,
      );
    }
    setPanelMode(PanelOpenType.CLOSE);
    resetTrajForm();
  } else if (taskData.taskStage === TaskStage.QUALITY_CHECK) {
    NioMessage('warning', '质检任务不可编辑事件数据');
  } else {
    NioMessage('warning', '当前没有进行中的任务');
  }
}

//事件类型改变
function changeType(type) {
  changeOddData(type);
}

function changeAdFuncType(type) {}

//经验限速改变
function changeEx(ex) {
  if (!canEdit()) {
    return;
  }

  if (oddPanelData.type === '经验限速') {
    changeOddData(ex);
  }
}

//经验限速改变
function changeInfoValueList(ex) {
  if (!canEdit()) {
    return;
  }

  if (oddPanelData.type === 'lane_types_cs替换') {
    changeOddData(ex);
  }
}

//法规限速改变
function changeLaw(law) {
  if (!canEdit()) {
    return;
  }

  if (oddPanelData.type === '法规限速') {
    changeOddData(law);
  }
}

//表单blur改变事件
function changeOddData(val) {
  if (taskData.taskStage !== TaskStage.FREE && isPaneModeEqual(PanelOpenType.MODIFY_ONE)) {
    let oddLane = oddLayer.oddLanes.get(oddPanelData.featureId);
    let oddData = oddLane.oddDataList[oddPanelData.curEventIdx];
    saveOneOddData(oddLane, oddData);
  }
}

//修改单条odd操作入栈
function saveOneOddData(oddLane, oddData) {
  //记录一份旧的oddData数据
  let oldOddData = oddData.copy();
  oddData.type = oddPanelData.type;
  oddData.lawSpeed = oddPanelData.lawLimitSpeed;
  oddData.exSpeed = oddPanelData.exLimitSpeed;
  oddData.infoValueList = oddPanelData.infoValueList;
  //单条修改操作入栈
  opHistory.push(new OddOpRecord(OpType.MODIFY, [oddLane], [[oldOddData]]));
}
</script>

<style scoped>
.change-odd {
  cursor: pointer;
}

.odd-idx {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 8px;
  border-bottom: 1px dashed #565861;
  color: #9b9c9e;
  font-size: 13px;
}

.odd-total {
  margin-right: 12px;
}

.odd-number {
  color: #3559d6;
}

.event-data {
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  padding: 8px 10px 14px;
}

.property-input {
  width: 100%;
  padding: 8px 6px;
  border: 0;
  background-color: #292a2e;
  color: white;
  font-size: 12px;
}

.property-input:focus {
  outline: none;
}

.property-item-width {
  width: 100%;
}

.event-footer-data {
  margin-left: 6px;
  margin-bottom: 18px;
  font-size: 13px;
}

.event-footer-txt {
  line-height: 18px;
  color: #b2b5bb;
}

.text-only {
  margin-top: 12px;
  color: #66686b;
  font-size: 13px;
  text-indent: 1em;
}

.copy-text {
  cursor: pointer;
}
.aside-form-label2 {
  margin-bottom: 6px;
  color: #ee0f0b;
  font-size: 14px;
  user-select: none;
}
</style>
