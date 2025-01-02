<template>
  <!-- 地图组件：把各个组件组合起来 -->
  <div
    ref="nioMap"
    class="nio-map"
  >
    <el-container class="nioMap">
      <!-- 搜索栏 -->
      <el-header height="46px">
        <MapSearch
          :search-data="searchData"
          :search-options="options"
        />
        <City
          ref="PlanCity"
          @setCity="setCity"
        />
        <VersionContrast
          v-show="mapState === 1"
          :map-source="srcState"
          @renderVersion="renderVersion"
        />
        <div
          v-show="isShowTileCount"
          class="selectCount"
        >
          已选择：<span>+{{ selectCount }}</span>
        </div>
      </el-header>
      <!-- 地图模块 -->
      <el-main style="position: relative">
        <div
          :id="mapId"
          ref="nioMapEl"
          :style="`height:${getMapHeight}`"
        />
        <ChangeBaseMap @switchBaseMap="switchBaseMap" />
        <ChangeSource
          :disabled="mapState === 2"
          :local-src-state="localSrcState"
          @switchSource="switchSource"
        />
        <MapLegend @filterChange="filterChange" />
      </el-main>
    </el-container>
  </div>
</template>

<script>
// 引入需要的组件
import { VeMap } from '@/nio_map/map';
import MapLegend from '@/components/MapLegend';
import ChangeBaseMap from '@/components/ChangeBaseMap';
import ChangeSource from '@/components/ChangeSource';
import MapSearch from '@/components/MapSearch';
import City from '@/components/City/index';
import VersionContrast from '@/components/VersionContrast'
import { LatLng } from 'leaflet';
// 引入配置好的请求
import { getTileInfo, queryPublishList } from '@/api';
import jsonp from 'jsonp';

export default {
  name: 'MapView',
  // 组件注册
  components: {
    MapSearch,
    City,
    ChangeBaseMap,
    MapLegend,
    ChangeSource,
    VersionContrast
  },
  // 接收父组件传来的参数
  props: {
    selectTileIds: {
      type: Array,
      default: () => [],
    },
    mapId: String,
    isShowTileCount: Boolean,
    isShowTileDetail: Boolean,
    mapState: Number,
    localSrcState: {
      type: String,
      default: 'srcState',
    },
    mapHeightPercent: {
      type: Number,
      default: 0.8,
    },
  },
  data() {
    return {
      options: {
        width: '150px',
        tilePlaceholder: '输入地点、tile号',
        taskPlaceholder: '输入任务号'
      },
      form: {
        vague: '',
      },
      city_name: '上海市',
      map: null,
      pixelToCenter: [0, 0],
      getMapHeight: `${0.7 * document.documentElement.clientHeight - 50}px`,
    };
  },
  computed: {
    selectIds() {
      return this.map ? this.map.dataManager.getSelectIds() : [];
    },
    selectCount() {
      return this.map ? this.map.dataManager.getSelectIds().length : 0;
    },
    srcState() {
      return this.map ? this.map.dataManager.getSrcState() : 1;
    },
    searchData() {
      return {
        input: (val) => {
          this.form.vague = val;
        },
        search: async () => {
          if (!this.form.vague) return;
          const reg = /^\d+$/;
          if (reg.test(this.form.vague)) {
            const flag = await this.setTileCenter(this.form.vague, this.isShowTileDetail);
            if (flag) return;
          }
          const url = [
            'https://apis.map.qq.com/ws/place/v1/search',
            `?boundary=region(${this.city_name},1)`,
            `&keyword=${this.form.vague}`,
            '&page_size=10&page_index=1&orderby=_distance',
            '&output=jsonp',
            '&key=2O4BZ-UJHCW-YP6RL-RH5VW-CYYSS-LUFCK',
          ].join('');
          jsonp(url, null, (err, res) => {
            if (err) {
              this.$message({
                type: 'error',
                message: err,
                showClose: true,
              });
            } else {
              console.log('QQMap data-------', res);
              this.$emit('scrollbar', 400);
              const { data, region } = res;
              if (data && data.length) {
                const { location } = data[0];
                const center = new LatLng(location.lat, location.lng);
                if (this.map) {
                  this.map.lmap.setView(center);
                  if (region?.title) {
                    this.$refs.PlanCity.setCityName(region.title);
                  }
                }
              } else {
                this.$message({
                  type: 'error',
                  message: '未搜索到相关内容',
                  showClose: true,
                });
              }
            }
          });
        },
        searchByTask: async () => {
          if (!this.form.vague) return;
          const reg = /^\d+$/;
          if (reg.test(this.form.vague)) {
            const flag = await this.setTileCenter(this.form.vague, this.isShowTileDetail, true);
            if (flag) return;
          } else {
            this.$message({
              type: 'error',
              message: '请输入正确的任务号格式',
              showClose: true,
            });
          }
        }

      };
    },
  },
  watch: {
    selectIds(newSelectIds) {
      this.$emit('getSelectIds', newSelectIds);
    },
    srcState() {
      if (this.selectTileIds.length) {
        this.map.dataManager.setSelectIds(this.selectTileIds);
      } else {
        this.map.dataManager.setSelectIds([]);
      }
      this.map.dataManager.refresh();
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.nioMapEl.addEventListener('pointerdown', () => {
        this.focusMapEl(this.$refs.nioMapEl);
      });
      const isOpen = localStorage.getItem('isOpen');
      const url = isOpen === 'false' ? 'http://rt0.map.gtimg.com/realtimerender?z={z}&x={x}&y={-y}&type=vector&style=0'
        : 'http://nmap-tile-service.tencent-dev.nioint.com/nio/grid/tile/{z}/{x}/{-y}.png';
      this.map = new VeMap(`${this.mapId}`, {
        center: [31.251, 121.451],
        zoom: 11,
        url,
      }, this.mapState);
      const mapHeight = this.$refs.nioMapEl.clientHeight;
      this.pixelToCenter = [0, -parseInt(mapHeight * 0.4, 10)];
      if (this.selectTileIds.length) {
        this.setTileCenter(this.selectTileIds[0], false);
        this.map.dataManager.setSelectIds(this.selectTileIds);
      }
      const srcState = localStorage.getItem(this.localSrcState) || 1;
      this.map.dataManager.setSrcState(Number(srcState))
    });
    this.getMapHeight = `${this.mapHeightPercent * document.documentElement.clientHeight - 52}px`;
    window.addEventListener('resize', this.resize, true);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resize, true);
  },
  methods: {
    /**
       * 解点击地图，位置移动问题
       */
    focusMapEl(el) {
      el.focus({
        preventScroll: true,
      });
    },
    setCity(city) {
      if (this.map) {
        const { city_name, center } = city;
        this.city_name = city_name;
        this.map.lmap.setView(center);
      }
    },
    filterChange(legends) {
      if (this.map) {
        this.map.setFilters(legends);
      }
    },
    async getMeshByTask(taskId) {
      const data = {
        count: 20,
        page: 1,
        filters: {
          task_id: [taskId],
          pub_mesh: [],
          pub_version: [],
          create_time: [],
          product_type: this.srcState
        }
      }
      let tileIds = []
      const res = await queryPublishList(data)
      const resData = res.data.data
      if (resData && resData.list.length) {
        tileIds = resData.list[0].pub_mesh ? resData.list[0].pub_mesh.split(',').map(meshId => Number(meshId)) : []
        if (!tileIds.length) {
          this.$message({
            type: 'error',
            message: '该任务没有图幅',
            showClose: true,
          });
        }
      } else {
        this.$message({
          type: 'error',
          message: '未搜索到该任务',
          showClose: true,
        });
      }
      return tileIds

    },
    async setTileCenter(val, isPopup, isByTaskId) {
      try {
        const searchId = Number(val);
        let tileIds = []
        if (isByTaskId) {
          tileIds = await this.getMeshByTask(val)
        } else {
          tileIds = [searchId]
        }
        if (!tileIds.length) return
        const res = await getTileInfo({
          tile_ids: tileIds,
          product_type: this.srcState
        });
        const resData = res.data
        if (resData.data && resData.data.length) {
          const tileData = resData.data[0];
          const { tileId } = tileData;
          if (this.map) {
            this.$emit('scrollbar', 400)
            this.map.dataManager.setTile(tileId, tileData)
            this.map.selectTile(tileId, this.pixelToCenter, isPopup)
          }
        } else {
          this.$message({
            type: 'error',
            message: '未搜索到相关内容',
            showClose: true,
          });
        }
        return true;
      } catch (err) {
        this.$message({
          type: 'error',
          message: err,
          showClose: true,
        });
        return true;
      }
    },
    resize() {
      this.getMapHeight = `${this.mapHeightPercent * document.documentElement.clientHeight - 50}px`;
    },
    switchBaseMap(isOpen) {
      const url = isOpen ? 'http://nmap-tile-service.tencent-dev.nioint.com/nio/grid/tile/{z}/{x}/{-y}.png'
        : 'http://rt0.map.gtimg.com/realtimerender?z={z}&x={x}&y={-y}&type=vector&style=0';
      if (this.map) {
        this.map.setBackgroundLayer(url);
      }
    },
    switchSource(srcState) {
      if (this.map) {
        this.map.dataManager.setSrcState(srcState)
      }
    },
    renderVersion(options) {
      if (this.map) {
        options.version === 1 ? this.map.dataManager.setVersion1Tiles(options.tileIds) : this.map.dataManager.setVersion2Tiles(options.tileIds)
      }
    }
  },
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
