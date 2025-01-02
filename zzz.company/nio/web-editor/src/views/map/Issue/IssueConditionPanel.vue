<template>
  <transition name="el-zoom-in-top">
    <Panel
      v-model:visible="store.state.issue.is_condition_show"
      :width="340"
      :min-width="300"
      :max-width="400"
      :height="380"
      :min-height="230"
      :max-height="600"
      :top="316"
      :left="1153"
      :default-time="['00:00:00', '23:59:59']"
      scale-able
    >
      <template #header>
        <div>Issue 图层条件</div>
        <div style="flex: 1"></div>
        <div class="title-close" @click="() => setIssuePanelVisible(false)">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <el-scrollbar height="100%" @click.right.prevent="layerRightHandler($event)">
          <div @click="layerHandler">
            <p class="layer-describe">时间</p>
            <div class="layer-box">
              <el-date-picker
                type="datetimerange"
                v-model="store.state.issue.search_conditions.date_range"
                unlink-panels
                range-separator="~"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                popper-class="picker-date"
                :disabled-date="handleDisabledDate"
                @calendar-change="handleCalendarChange"
                @change="handleDateChange"
              />
            </div>
            <p class="layer-describe">issue_notify_type</p>
            <div class="layer-box">
              <div
                v-for="item in ISSUE_NOTIFY_TYPE_LIST"
                :key="item"
                class="layer-item"
                :class="{
                  'active-layer':
                    store.state.issue.search_conditions.selected_issue_props[ISSUE_CONDITION_TYPE.ISSUE_NOTIFY_TYPE]?.[
                      item
                    ],
                }"
                :data-id="item"
                :data-type="ISSUE_CONDITION_TYPE.ISSUE_NOTIFY_TYPE"
              >
                {{ item }}
              </div>
            </div>
            <p class="layer-describe">issue_status</p>
            <div class="layer-box">
              <div
                v-for="item in ISSUE_STATUS_LIST"
                :key="item"
                class="layer-item"
                :class="{
                  'active-layer':
                    store.state.issue.search_conditions.selected_issue_props[ISSUE_CONDITION_TYPE.ISSUE_STATUS]?.[item],
                }"
                :data-id="item"
                :data-type="ISSUE_CONDITION_TYPE.ISSUE_STATUS"
              >
                {{ item }}
              </div>
            </div>
            <p class="layer-describe">环境</p>
            <div class="layer-box">
              <div
                v-for="item in ISSUE_ENV_LIST"
                :key="item"
                class="layer-item"
                :class="{
                  'active-layer':
                    store.state.issue.search_conditions.selected_issue_props[ISSUE_CONDITION_TYPE.ISSUE_ENV]?.[item],
                }"
                :data-id="item"
                :data-type="ISSUE_CONDITION_TYPE.ISSUE_ENV"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </el-scrollbar>
      </template>
    </Panel>
  </transition>
</template>

<script lang="ts" setup>
import {onMounted, reactive, ref} from 'vue';
import {useStore} from 'vuex';
import Panel from '../../../components/panel/Panel.vue';

import {ISSUE_NOTIFY_TYPE_LIST, ISSUE_STATUS_LIST, ISSUE_ENV_LIST, ISSUE_CONDITION_TYPE} from './constants';
import {issueLayer} from '../../../system/issue/layer';

const store = useStore();

const first_selected_date = ref<any>(null);

function layerRightHandler(ev) {
  const id = ev.target.dataset.id;
  if (id) {
  }
}
function layerHandler(ev) {
  const id = ev.target.dataset.id;
  const type = ev.target.dataset.type;
  if (Boolean(type)) {
    store.commit('issue/setSearchConditionProps', {id, type});
  }

  issueLayer.clearIssues();
  issueLayer.mouseLoadingIssue();
}

function handleDateChange(date) {
  issueLayer.clearIssues();
  issueLayer.mouseLoadingIssue();
}

function handleCalendarChange(date) {
  if (!date) {
    first_selected_date.current = null;
  }

  if (date?.[0] && !date?.[1]) {
    first_selected_date.current = date[0];
  } else if (date?.[0] && date?.[1]) {
    first_selected_date.current = null;
  }
  return true;
}

function handleDisabledDate(time) {
  if (!first_selected_date.current) {
    return false;
  } else {
    if (Math.abs(time.getTime() - first_selected_date.current.getTime()) >= 1000 * 60 * 60 * 24 * 7) {
      return true;
    }
  }

  return false;
}

function setIssuePanelVisible(show: boolean) {
  store.commit('issue/setConditionPanelShow', {show});
}
</script>

<style scoped>
:deep(.el-checkbox) {
  color: #fff;
}
:deep(.el-checkbox__input),
:deep(.el-checkbox__label) {
  pointer-events: none;
}
.layer-tool-item {
  cursor: pointer;
  font-size: 14px;
  padding-left: 5.5%;
  padding-top: 1%;
}
.layer-tool-item i {
  pointer-events: none;
  color: rgb(197, 197, 197);
}
.layer-box {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  align-content: center;
  padding-left: 3%;
  padding-right: 3%;
}
.layer-box2 {
  display: inline-block;
  width: auto;
}
.layer-item {
  padding: 1px 11px;
  border-radius: 8px;
  margin: 10px;
  background-color: #121525;
  font-size: 12px;
  line-height: 21px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.25s ease;
}
.active-layer {
  background-color: #5486eb;
}
.layer-describe {
  padding-left: 5%;
  padding-right: 5%;
  margin-bottom: 0;
  color: rgb(197, 197, 197);
  text-align: left;
}
.layer-describe-buttons {
  float: right;
}
</style>

<style>
.el-input__wrapper,
.el-input__wrapper:hover {
  background-color: #252526 !important;
  box-shadow: 0 0 0 1px #252526 inset;
}
.picker-date,
.el-popper__arrow::before,
.el-time-panel {
  background-color: #333546 !important;
  border: 0 !important;
}
.el-date-range-picker,
.el-picker-panel__footer {
  background-color: #333546 !important;
}
.disabled .el-date-table-cell,
.disabled .cell {
  background-color: #606266 !important;
}

.is-focus {
  box-shadow: 0 0 0 1px #333546 inset !important;
}

.el-date-range-picker__time-header {
  border-bottom: none !important;
}

.el-date-range-picker__content.is-left {
  border-right: none !important;
}

.el-picker-panel__footer {
  border-top: none !important;
}

.el-picker-panel__body,
.el-date-picker__header > span,
.el-date-picker__header button,
.el-time-panel .el-time-spinner__item {
  color: #ffffff !important;
}
.picker-date tbody tr th,
.picker-date tbody tr td,
.picker-date tbody tr .cell {
  color: #ffffff !important;
}

.el-date-table td.in-range .el-date-table-cell,
.el-time-panel .el-time-spinner__item:hover {
  background-color: rgba(64, 158, 255, 0.2) !important;
}

.el-picker-panel__footer .is-text,
.el-time-panel__btn.cancel {
  color: var(--el-color-primary) !important;
}

.el-picker-panel__footer .is-text:hover,
.el-time-panel__btn.cancel {
  background: none !important;
}

.el-picker-panel__footer .is-plain,
.el-time-panel__btn.confirm {
  background: none !important;
  color: #ffffff;
}

.el-picker-panel__footer .is-plain:hover,
.el-time-panel__btn.confirm {
  color: var(--el-color-primary);
}

.el-picker-panel__icon-btn {
  color: #fff;
}
</style>
