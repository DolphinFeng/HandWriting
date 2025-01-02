<template>
  <div>
    <!-- 选择城市组件-->
    <div class="city-list-wrapper">
      <div class="title-info">
        请选择城市
      </div>
      <div class="show-city-info">
        <p v-show="showSetDefaultCity">
          <span>{{ select_value }}</span>
          <span
            class="blue-color"
            @click="setDefaultCity(select_value)"
          >设为默认城市</span>
        </p>
        <p v-show="showDefaultCity">
          <span>您的默认城市是</span>
          <span class="blue-color">{{ default_city }}</span>
          <span>[</span>
          <span
            class="blue-color"
            @click="deleteDefaultCity"
          >删除</span>
          <span>]</span>
        </p>
      </div>
      <div class="city-input-wrapper">
        <el-select
          v-model="search_city"
          filterable
          placeholder="请输入城市名"
          style="width: 250px;"
        >
          <el-option
            v-for="item in results_data"
            :key="item.key"
            :label="item.label"
            :value="item.value"
          >
            <span style="padding-left: 15px">{{ item.label }}</span>
          </el-option>
        </el-select>
        <el-button
          id="search_icon"
          theme="primary"
          variant="outline"
          @click="cityByValue(search_city)"
        >
          <el-icon name="search" />
        </el-button>
      </div>
      <div class="city-menu-wrapper">
        <div class="hot-city-entry">
          <p>热门城市</p>
          <div class="text-content">
            <span
              v-for="i in data_hot_city"
              :key="i"
            >
              <a
                class="blue-color"
                @click="cityByValue(i)"
              >{{ i }}</a>
            </span>
          </div>
        </div>
        <div class="city-list-container">
          <div class="list-title">
            <span>全国城市列表</span>
            <div class="show-list-btn">
              <span
                class="show-city-by-prov"
                :class="[showProv ? 'active' : '']"
                @click="showDisplay"
              >按省份</span>
              <span
                class="show-city-by-letter"
                :class="[!showProv ? 'active' : '']"
                @click="showDisplay"
              >按拼音</span>
            </div>
          </div>
          <div
            v-show="showProv"
            class="city-list-by-prov-container"
          >
            <div class="prov-list default">
              <div>
                <a
                  class="blue-color"
                  @click="cityByValue('中国')"
                >中国</a>
              </div>
            </div>
            <div
              v-for="i in data_city_prov"
              :key="i[0]"
              class="prov-list"
            >
              <div class="left">
                <a
                  class="blue-color"
                  @click="cityByValue(i[0])"
                >{{ i[0] }}</a>
              </div>
              <div class="citys">
                <span
                  v-for="j in i.length"
                  :key="i[j]"
                >
                  <a
                    class="blue-color"
                    @click="cityByValue(i[j])"
                  >{{ i[j] }}</a>
                </span>
              </div>
            </div>
          </div>
          <div
            v-show="showLetter"
            class="city-list-by-letter-container"
          >
            <div
              v-for="i in data_city_letter"
              :key="i[0]"
              class="prov-list"
            >
              <div class="left">
                <a>{{ i[0] }}</a>
              </div>
              <div class="citys">
                <span
                  v-for="j in i.length"
                  :key="j"
                >
                  <a
                    class="blue-color"
                    @click="cityByValue(i[j])"
                  >{{ i[j] }}</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 引入js数据
import { data_city_prov, data_city_letter, cityPoint } from '../city_data';

export default {
  name: 'CityBlock',
  data() {
    return {
      search_city: '',
      select_value: localStorage.getItem('defaultCity') || '上海',
      default_city: '',
      data_hot_city: ['北京', '上海', '广州', '天津', '重庆', '深圳', '杭州', '成都', '武汉', '香港'],
      data_city_prov,
      data_city_letter,
      cityPoint,
      results_data: [],
      showProv: true,
      showLetter: false,
      showDefaultCity: true,
      showSetDefaultCity: false,
    };
  },
  mounted() {
    const localDefaultCity = localStorage.getItem('defaultCity');
    if (localDefaultCity) {
      this.default_city = localDefaultCity;
      this.select_value = localDefaultCity;
    }
  },
  created() {
    // 初始化默认城市
    this.default_city = this.select_value;
    // 最开始的下拉选项
    const citys = Object.values(this.data_city_letter).reduce((pre, curr) => pre.concat(curr), []);
    citys.forEach((item) => {
      this.results_data.push({ value: item, label: item });
    });
  },
  methods: {
    /**
       * 切换城市列表（按省份、按拼音
       */
    showDisplay() {
      this.showProv = !this.showProv;
      this.showLetter = !this.showLetter;
    },

    /**
       * 删除默认城市
       */
    deleteDefaultCity() {
      this.showDefaultCity = false;
      this.showSetDefaultCity = true;
      localStorage.removeItem('defaultCity');
    },

    /**
       * 设置默认城市
       */
    setDefaultCity(value) {
      this.default_city = value;
      this.showDefaultCity = true;
      this.showSetDefaultCity = false;
      localStorage.setItem('defaultCity', value);
    },

    /**
       * 传值给父组件
       */
    cityByValue(value) {
      console.log(value);
      // cityByValue是在父组件on监听的方法
      // 第二个参数value是需要传的值
      this.select_value = value;
      this.$emit('cityByValue', value);
    },
  },
};
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
