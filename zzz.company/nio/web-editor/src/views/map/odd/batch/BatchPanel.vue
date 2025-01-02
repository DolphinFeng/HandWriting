<template>
  <Panel
    v-model:visible="batchPanelVisible"
    center
    :min-width="500"
    :width="560"
    :min-height="300"
    :height="300"
    :max-width="700"
    :max-height="500"
    scale-able
    :loading="loading"
    @created="created"
  >
    <template #header>
      <div style="">批次列表</div>
      <div class="batch-total">共计{{ batchData.total }}个批次</div>
      <div style="flex: 1"></div>
      <div class="batch-list-type">
        <el-select
          v-model="batchType"
          style="width: 100px"
          placeholder="选择来源"
          :teleported="false"
          :suffix-icon="CaretBottom"
          @change="batchTypeChange"
          fit-input-width
          clearable
        >
          <el-option
            v-for="item in batchTypeOptions"
            :label="item.label"
            :key="item.value"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <div ref="refreshRef" class="batch-refresh" title="刷新" @mousedown.left="refresh">
        <i class="iconfont icon-shuaxin" style="font-size: 22px"></i>
      </div>
      <div class="title-close" @click="closePanelHandler">
        <i class="iconfont icon-guanbi1"></i>
      </div>
    </template>
    <template #default>
      <el-scrollbar ref="scrollbarRef" height="100%" class="scrollbar">
        <ul
          class="batch-list"
          v-infinite-scroll="lazyLoad"
          :infinite-scroll-immediate="false"
          @click.left="handleClick($event)"
        >
          <li v-for="(item, idx) in batchData.list" :key="item.batchNum" class="batch-item">
            <div class="batch-id-box">
              <div class="batch-id" :data-idx="idx">{{ item.batchNum }}</div>
              <div class="batch-detail" :data-idx="idx">详情</div>
            </div>
            <div class="batch-content-box">
              <div class="batch-data batch-type">{{ item.DynamicInfo }}</div>
              <div class="batch-data batch-pos" :data-idx="idx" title="复制坐标">
                {{ parseGeometry(item.geometry) }}
              </div>
              <div class="batch-data batch-time">{{ item.userName }}</div>
              <div class="batch-data batch-time">{{ item.opTime }}</div>
              <div class="batch-data batch-time">{{ item.hisCount }}条lane</div>
            </div>
          </li>
        </ul>
      </el-scrollbar>
    </template>
  </Panel>
  <!-- 事件列表弹窗 -->
  <EventList :event-list-data="eventListData" @loadingPage="loadingDetail"></EventList>
</template>

<script setup>
import {reactive, ref} from 'vue';
import {useStore} from 'vuex';
import {batchPanelVisible, batchData, eventListData} from '../../../../system/odd/batch/batch.js';
import Panel from '../../../../components/panel/Panel.vue';
import axios from 'axios';
import {nioCamera, NioNotification} from '../../../../utils/utils.js';
import EventList from './EventList.vue';
import {DynamicInfo, EventType} from '../../../../system/odd/enum/EventType.js';
import {OddSource} from '../../../../system/odd/enum/OddSource.js';
import {parseWKT} from '../../../../utils/wkt/parseWKT.js';
import {copyTextToClipboard} from '../../../../utils/copy.js';
import {Observer} from '../../../../js/observer.js';
import {CaretBottom} from '@element-plus/icons-vue';
import {Cartesian3, Cartographic} from 'cesium';

const apiDynamicURL = window.api.apiDynamicURL;
const store = useStore();
const scrollbarRef = ref(null);
const status = {
  0: '默认',
  1: '有效',
  2: '失效',
};
const batchType = ref('odd-editor');
const batchTypeOptions = [
  {label: 'ODD平台', value: 'odd-editor'},
  {label: 'NIO后台服务', value: 'odd-merge'},
];
//改变批次类型
const batchTypeChange = function () {
  created();
};
//推送状态
const releaseStatus = {
  0: '默认',
  1: '未推送',
  2: '已推送',
  3: '已推送-重复/拒绝',
};
//将坐标转为字符串进行显示
const parseGeometry = function (pos) {
  if (pos === null) {
    return 'null';
  }
  let res = [];
  for (let i = 0; i < 2; i++) {
    res[i] = parseFloat(pos[i]).toFixed(4);
  }
  return res.join(',');
};
//面板打开初始化回调
const created = function () {
  batchData.list = [];
  batchData.total = 0;
  batchData.pageNo = 1;
  scrollbarRef.value?.setScrollTop(0);
  loading.value = true;
  loadingPage().finally(() => {
    loading.value = false;
  });
};
Observer.register('batchUpdate', function () {
  created();
});
//关闭面板事件
const closePanelHandler = function () {
  batchPanelVisible.value = false;
  batchData.list = [];
  batchData.pageNo = 1;
  batchData.total = 0;
};
const refreshRef = ref(null);
const loading = ref(false);
//刷新按钮
const refresh = function () {
  rotateAnimation(true);
  scrollbarRef.value?.setScrollTop(0);
  loading.value = true;
  batchData.pageNo = 1;
  loadingPage().finally(() => {
    rotateAnimation(false);
    loading.value = false;
  });
};
//设置旋转动画状态
const rotateAnimation = function (open) {
  if (open) {
    refreshRef.value.classList.add('rotate-animation');
  } else {
    refreshRef.value.classList.remove('rotate-animation');
  }
};
//懒加载处理
const lazyLoad = function () {
  if (batchData.pageNo * batchData.pageSize < batchData.total) {
    batchData.pageNo++;
    loadingPage();
  }
};
//加载批次列表
const loadingPage = function () {
  return axios
    .post(apiDynamicURL + '/dynamic-map/operation/list-paged', {
      mapVersion: store.state.version.curVersion,
      pageNo: batchData.pageNo,
      pageSize: batchData.pageSize,
      bizDesc: batchType.value,
    })
    .then((res) => {
      if (res.data.code === 200) {
        let data = res.data.data;
        if (data.total === 0) {
          return;
        }
        //过滤数据
        data.result = data.result.map((item) => {
          item.dynamicInfo =
            item.dynamicInfo === null
              ? 'null'
              : item.dynamicInfo in DynamicInfo
              ? DynamicInfo[item.dynamicInfo]
              : '未知事件类型';
          item.geometry = item.geometry === null ? null : parseWKT.read(item.geometry);
          return item;
        });
        if (batchData.pageNo === 1) {
          batchData.list = data.result;
          batchData.total = data.total;
        } else {
          batchData.list.push(...data.result);
        }
      } else {
        throw new Error('错误：' + res.data.msg);
      }
    })
    .catch((err) => {
      NioNotification('error', '获取列表失败', err.message);
    });
};

//加载详细事件列表内容
function loadingDetail() {
  return axios
    .post(apiDynamicURL + '/dynamic-map/operation/event/list-paged', {
      batchNum: eventListData.batchNum,
      pageNo: eventListData.pageNo,
      pageSize: eventListData.pageSize,
    })
    .then((res) => {
      if (res.data.code === 200) {
        let data = res.data.data;
        eventListData.total = data.total;
        eventListData.list = data.result.map((item) => {
          return {
            eventId: item.eventId,
            type: DynamicInfo[item.dynamicInfo],
            lawSpeed: item.lawSpdlmt,
            exSpeed: item.expSpdlmt,
            provinceName: item.provinceName,
            cityName: item.cityName,
            tile: item.tile,
            batchNum: eventListData.batchNum,
            featureId: item.featureId,
            startOffset: item.startOffset,
            endOffset: item.endOffset,
            curVersion: item.mapVersion ?? 'null',
            source: OddSource[item.source],
            status: status[item.status],
            releaseStatus: releaseStatus[item.releaseStatus],
            infoValueList: item.infoValueList,
          };
        });
      } else {
        throw new Error('loadingDetail错误:' + res.data.msg);
      }
    })
    .catch((err) => {
      NioNotification('error', '获取事件列表失败', err.message);
    })
    .finally(() => {
      eventListData.loading = false;
    });
}

//点击事件代理
const handleClick = function (ev) {
  let target = ev.target;
  if (target) {
    if (target.classList.contains('batch-detail')) {
      //打开事件详情面板
      Object.assign(eventListData, {
        batchNum: batchData.list[target.dataset.idx].batchNum,
        pageNo: 1,
        pageSize: 20,
        total: 0,
        list: [],
        show: true,
        loading: true,
      });
      loadingDetail();
    } else if (target.classList.contains('batch-pos')) {
      let geometry = batchData.list[target.dataset.idx].geometry;
      geometry && copyTextToClipboard(geometry.slice(0, 2).join(','), '已复制坐标到粘贴板');
    } else if (target.classList.contains('batch-id')) {
      let geometry = batchData.list[target.dataset.idx].geometry;
      if (geometry instanceof Array && geometry.length > 0) {
        nioCamera.locatePosition({
          position: Cartesian3.fromDegrees(parseFloat(geometry[0]), parseFloat(geometry[1]), 500),
          animate: true,
        });
      }
    }
  }
};
</script>

<style scoped>
@keyframes rotate {
  0% {
    transform: rotateZ(0);
  }
  100% {
    transform: rotateZ(1turn);
  }
}
:deep(.el-input__wrapper) {
  --el-input-height: 30px;
  background-color: #2b2d30;
  box-shadow: none;
  padding: 1px 3px 1px 8px;
}
:deep(.el-select:hover:not(.el-select--disabled) .el-input__wrapper) {
  box-shadow: none;
}
:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: none !important;
}
:deep(.el-select__popper.el-popper, .el-popper.is-light) {
  background-color: #2b2d30;
  border: 1px solid #6c7179;
}
:deep(.el-select-dropdown__item.hover, .el-select-dropdown__item:hover) {
  background-color: #1e2021;
}
:deep(.el-popper.is-light .el-popper__arrow::before) {
  border: 1px solid #6c7179;
  background: #2b2d30;
}
:deep(.el-select-dropdown__item) {
  color: #a6a6a6;
  font-size: 13px;
  padding: 0 15px 0 10px;
}
:deep(.el-input__inner) {
  color: #919498 !important;
  font-size: 13px;
}
:deep(.el-input__suffix-inner > :first-child) {
  margin-left: 2px;
}
.rotate-animation {
  animation: rotate 0.4s linear infinite;
}
.scrollbar {
  padding: 0 10px;
  overflow: hidden !important;
}
.batch-total {
  margin-left: 10px;
  font-size: 12px;
  color: #b7b7b8;
}
.batch-list-type {
  margin-right: 18px;
}
.batch-refresh {
  color: #537bf5;
  margin-right: 10px;
}
.title-close {
  margin-left: 0;
  cursor: pointer;
  font-size: 14px;
}
.batch-body-wrapper {
  height: 260px;
  padding: 0 14px;
}
.batch-list {
  display: flex;
  flex-flow: column nowrap;
}
.batch-item {
  padding: 9px 0;
  border-bottom: 1px dashed #565861;
}
.batch-item:last-child {
  border-bottom: none;
}
.batch-id-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.batch-id {
  font-size: 14px;
  color: white;
  cursor: pointer;
}
.batch-id:hover {
  color: #3559d6;
}
.batch-detail {
  color: #3559d6;
  cursor: pointer;
}
.batch-content-box {
  display: flex;
  align-items: center;
  align-content: center;
  margin-top: 4px;
  font-size: 13px;
}
.batch-type,
.batch-time {
  color: #b7b8ba;
}
.batch-pos {
  color: #3559d6;
  cursor: pointer;
}
.batch-data {
  box-sizing: content-box;
  padding: 0 6px;
  margin: 3px 0;
  line-height: 1;
  white-space: nowrap;
}
.batch-data:nth-of-type(n + 2) {
  border-left: 1px solid #b7b8ba;
  height: 100%;
}
</style>
