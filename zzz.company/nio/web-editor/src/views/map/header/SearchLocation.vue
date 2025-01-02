<template>
  <div class="search-box">
    <input
      id="search-input"
      v-model="searchVal"
      :class="{'apply-shake': searchShake, 'search-input-radius': searchPanel}"
      type="text"
      autocomplete="off"
      placeholder="请输入tile号或坐标进行定位"
      @mousedown="focus(true)"
      @keydown.enter="searchHandler"
    />
    <div class="search-icon" @click.prevent="searchHandler">
      <i class="iconfont icon-sousuotianchong"></i>
    </div>
    <div class="search-senior" @click.prevent="seniorSearchHandler">
      <span>高级</span>
    </div>
    <transition name="el-zoom-in-top">
      <div @mousedown="recordHandler($event)" v-show="searchPanel" class="input-select-wrapper">
        <ul>
          <li v-for="(item, index) in searchRecords.list" :data-index="index">
            <span class="search-item-txt">{{ transformRecord(item) }}</span>
            <span style="flex: 1"></span>
            <span class="search-item-delete" @click.stop="deleteRecord(index)">删除</span>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup>
import {Cartesian3} from 'cesium';
import axios from 'axios';
import {parseWKT} from '../../../utils/wkt/parseWKT.js';
import {nioCamera, NioNotification, NioMessage} from '../../../utils/utils.js';
import {onDeactivated, onMounted, reactive, ref} from 'vue';
import {throttle} from '../../../utils/compute.js';
import {Observer} from '../../../js/observer.js';
import {createViewer} from '../../../cesium/initMap.js';
import {loadingSourceOddHandler} from '../../../system/odd/loading/loadingOddData.js';
import {setSearchSeniorPanelVisible} from '../../../system/searchSenior';

const viewer = createViewer();
const focus = function (focus) {
  searchPanel.value = !!focus;
};
//点击历史记录事件
function recordHandler(ev) {
  let target = ev.target.className === 'search-item-txt' ? ev.target.parentElement : ev.target;
  let index = target.dataset.index;
  if (typeof index === 'string') {
    searchVal.value = searchRecords.list[parseInt(index)].toString();
    searchHandler();
  }
}

//将坐标转为字符串
function transformRecord(pos) {
  pos = pos.split(',').map((item) => parseFloat(item));
  if (pos.length === 1) {
    return pos[0];
  } else {
    return `${pos[0].toFixed(2)}, ${pos[1].toFixed(2)}`;
  }
}

//删除历史记录事件
function deleteRecord(idx) {
  searchRecords.list.splice(idx, 1);
  localStorage.setItem('searchList', JSON.stringify(searchRecords.list));
}

const searchShake = ref(false);
const searchPanel = ref(false);
const searchVal = ref('');
const loading = ref(false);
const searchRecords = reactive({
  list: [],
});

//清空搜索内容
function clearSearch() {
  searchVal.value = '';
}

//保存搜搜记录
const saveSearchHistory = (function () {
  function findEqualHistory(record) {
    for (let i = 0; i < searchRecords.list.length; i++) {
      if (searchRecords.list[i] === record) {
        return i;
      }
    }
    return -1;
  }

  return (record) => {
    const list = searchRecords.list;
    let oldRecordIdx = findEqualHistory(record);
    if (oldRecordIdx !== -1) {
      list.splice(oldRecordIdx, 1);
    }
    list.unshift(record);
    while (list.length > 10) {
      list.pop();
    }
    localStorage.setItem('searchList', JSON.stringify(list));
  };
})();

const matchReg = [/^\s*(\d+)\s*$/, /\s*(\d+\.?\d*)[\s,，:：]+(\d+\.?\d*)\s*/];
//搜索事件
const searchHandler = throttle(async () => {
  if (loading.value === true) {
    return;
  }
  loading.value = true;
  //输入了tile
  let isTile = matchReg[0].test(searchVal.value),
    coordinates = matchReg[1].exec(searchVal.value);
  if (isTile) {
    await positionHandler.tile(parseInt(searchVal.value));
  } else if (coordinates) {
    await positionHandler.coordinates(parseFloat(coordinates[1]), parseFloat(coordinates[2]));
  } else {
    //tile和坐标都不是
    searchShake.value = true;
    setTimeout(() => {
      searchShake.value = false;
    }, 820);
    loading.value = false;
  }
}, 100);

const seniorSearchHandler = throttle(async () => {
  setSearchSeniorPanelVisible(true);
}, 100);

//定位函数
function locationHandler(pos) {
  //图标定位
  nioCamera.locatePosition({
    position: pos,
    duration: 2,
    animate: true,
    before() {
      searchPanel.value = false;
    },
    completed() {
      loading.value = false;
      loadingSourceOddHandler(true);
    },
  });
}

//输入类型处理策略
const positionHandler = {
  tile: function (tile) {
    return axios
      .post('http://nmap-mesh-manager.tencent-dev.nioint.com/mesh/query', {
        coordinationSystem: 'MARS',
        meshList: [tile],
      })
      .then((res) => {
        if (res.data.code === 200 && res.data.data[tile] !== null) {
          let data = res.data.data;
          let coordinates = parseWKT.read(data[tile])[0];
          const cPos = coordinates.reduce(
            (prev, item) => {
              prev[0] += parseFloat(item[0]);
              prev[1] += parseFloat(item[1]);
              return prev;
            },
            [0, 0],
          );
          cPos[0] /= coordinates.length;
          cPos[1] /= coordinates.length;
          saveSearchHistory(tile.toString());
          locationHandler(Cartesian3.fromDegrees(cPos[0], cPos[1], 500));
        } else {
          throw new Error(`图幅号${tile}不存在`);
        }
      })
      .catch((err) => {
        NioNotification('warning', '图幅号查询失败', err.message, 3000);
        loading.value = false;
      });
  },
  coordinates: async function (longitude, latitude) {
    saveSearchHistory(`${longitude},${latitude}`);
    locationHandler(Cartesian3.fromDegrees(longitude, latitude, 500));
  },
};
Observer.register('click', function (option) {
  if (option.default) {
    option.ev.target.id !== 'search-input' && (searchPanel.value = false);
  }
});
onMounted(() => {
  searchRecords.list = JSON.parse(localStorage.getItem('searchList') ?? '[]');
});
onDeactivated(() => {
  clearSearch();
});
</script>

<style scoped>
ul {
  margin: 0;
}
.search-box {
  display: flex;
  align-items: center;
  position: relative;
  width: 320px;
  --input-height: 28px;
  height: var(--input-height);
}

#search-input {
  width: 100%;
  height: 100%;
  padding: 0 24px 0 10px;
  border: none;
  border-radius: 4px;
  background-color: #101223;
  font-size: 11px;
  color: white;
  transition: width 0.5s ease;
}

.search-input-radius {
  border-radius: 4px 4px 0 0 !important;
}

.input-select-wrapper li {
  display: flex;
  align-items: center;
  position: relative;
  height: 30px;
  padding: 0 10px;
  cursor: pointer;
  color: #fff;
}

.search-item-delete {
  display: none;
  font-size: 12px;
  margin-right: 6px;
}

.input-select-wrapper li:hover .search-item-txt {
  color: #409eff;
}

.input-select-wrapper li:hover .search-item-delete {
  display: block;
}

#search-input:focus {
  /*width: 280px;*/
}

.input-select-wrapper {
  position: absolute;
  top: var(--input-height);
  left: 0;
  width: 100%;
  max-height: 120px;
  border-radius: 0 0 8px 8px;
  background-color: rgba(16, 18, 35, 0.6);
  font-size: 12px;
  overflow: hidden;
  user-select: none;
}

.search-item-delete:hover {
  color: #409eff;
}

.search-icon {
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  border-radius: 0 2px 2px 0;
  background-color: #101223;
  color: #757575;
  font-size: 14px;
  cursor: pointer;
}
.search-senior {
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  right: 25px;
  width: 30px;
  height: 100%;
  border-radius: 0 2px 2px 0;
  background-color: #101223;
  color: #7e8cf1;
  font-size: 14px;
  cursor: pointer;
}

#search-input:focus {
  outline: none;
}
</style>
