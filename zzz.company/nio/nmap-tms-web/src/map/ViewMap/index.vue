<template>
  <div class="nio-map">
    <MapView
      map-id="ViewMap"
      :is-show-tile-count="false"
      :is-show-tile-detail="true"
      :map-state="mapState"
      local-src-state="viewSrcState"
      region-name="viewRegionStates"
      :map-height-percent="mapHeightPercent"
    />
  </div>
</template>

<script>
import MapView from '../MapView'

export default {
  name: 'ViewMap',
  // 组件注册
  components: {
    MapView,
  },
  data() {
    return {
      mapState: 1, // 地图总览
      mapHeightPercent: 0.95,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../MapView/index.scss';
</style>
