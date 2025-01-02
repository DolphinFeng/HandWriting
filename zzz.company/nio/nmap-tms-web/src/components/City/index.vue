<template>
  <!-- 城市搜索栏中的城市选择框 -->
  <div
    id="city"
    ref="showListRef"
  >
    <span
      class="city-list-btn"
      @click="taggleCityList"
    >
      {{ city_name }}
      <i :class="[showList ? 'active' : '']" />
    </span>
    <CityBlock
      v-show="showList"
      @cityByValue="cityByValue"
    />
  </div>
</template>

<script>
// 引入需要的组件
import CityBlock from './CityBlock/index.vue';
// 引入js数据
import { cityPoint } from './city_data';
import { LatLng } from 'leaflet';

export default {
  name: 'City',
  // 组件注册
  components: {
    CityBlock,
  },
  data() {
    return {
      city_name: localStorage.getItem('defaultCity') || '上海',
      showList: false,
      cityPoint,
    };
  },
  watch: {
    // city_name: function (newValue, oldValue) {
    //   if (newValue.includes(oldValue)) return
    //   // this.searchCity(newValue);
    // },
    showList() {
      if (this.showList) {
        document.addEventListener('click', this.bodyCloseMenus);
      } else {
        document.removeEventListener('click', this.bodyCloseMenus);
      }
    },
  },
  mounted() {
    // 初始化默认城市定位
    setTimeout(() => {
      this.searchCity(localStorage.getItem('defaultCity') || '上海');
    }, 100);
  },
  methods: {
    /**
       * 弹窗开关
       */
    taggleCityList() {
      this.showList = !this.showList;
    },

    /**
       * 点击空白处关闭弹窗
       * @param e 默认事件
       */
    bodyCloseMenus(e) {
      if (this.$refs.showListRef) {
        const isSelf = this.$refs.showListRef.contains(e.target);
        if (!isSelf) {
          this.showList = false;
        }
      }
    },

    /**
       * 按钮回填城市值
       */
    cityByValue(selectValue) {
      // childValue就是子组件传过来的值
      this.city_name = selectValue;
      this.searchCity(this.city_name);
    },

    /**
       * 城市定位
       */
    searchCity(value) {
      let center = new LatLng(39.908578, 116.39694079);
      for (let i = 0; i < this.cityPoint.length; i++) {
        if (this.cityPoint[i].split(':')[0] === value) {
          center = new LatLng(this.cityPoint[i].split(':')[1].split(',')[0], this.cityPoint[i].split(':')[1].split(',')[1]);
        }
      }
      this.$emit('setCity', {
        city_name: this.city_name,
        center,
      });
      this.showList = false;
    },
    setCityName(name) {
      this.city_name = name;
    },
  },
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
