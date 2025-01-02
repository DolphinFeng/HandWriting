<template>
  <div class="legend">
    <div
      v-for=" item in legends"
      :key="'legnd'+item.value"
      :class="`legend-item legend-item-${item.value} ${item.display ? ' activated' : ''}`"
      @click="displayControl(item.value)"
    >
      <div :class="'legend-color '+item.className" />
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>

<script>
import { legends } from '@/nio_map/data/legendData';
export default {
  name: 'MapLegend',
  data() {
    return {
      legends,
      displayLayers: [0, 1],
    };
  },
  mounted() {
    const displayLayers = localStorage.getItem('displayLayers');
    if (displayLayers) {
      this.displayLayers = JSON.parse(displayLayers);
    }
    const len = this.legends.length;
    for (let i = 0; i < len; i++) {
      if (!this.displayLayers.includes(this.legends[i].value)) {
        this.legends[i].display = false;
      }
    }
    this.$emit('filterChange', this.legends);
  },
  methods: {
    displayControl(val) {
      const idx = this.displayLayers.indexOf(val);
      if (idx > -1) {
        this.displayLayers.splice(idx, 1);
        this.legends.find(item => val === item.value).display = false;
      } else {
        this.displayLayers.push(val);
        this.legends.find(item => val === item.value).display = true;
      }
      this.$emit('filterChange', this.legends);
      localStorage.setItem('displayLayers', JSON.stringify(this.displayLayers));
    },
  },
};
</script>

<style lang="scss" scoped>
.legend {
    user-select: none;
    position: absolute;
    bottom: 20px;
    right: 30px;
    width: 130px;
    z-index: 1000;
    padding: 5px;
    padding-left: 20px;
    border-radius: 5px;
    background: #FFFFFF;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.24);
    opacity: 0.9;
    font-size: 12px;
}
.legend-item {
    display: inline-block;
    width: 120px;
    line-height: 27px;
    text-align: left;
    position: relative;
    padding-left: 20px;
    cursor: pointer;
    color: gray;
}
.legend-color::before {
    content: '';
    width: 0;
    height: 0;
    border: 6px solid;
    font-size: 0;
    position: absolute;
    top: 8px;
    left: 0;
    border-color: #D8D8D8;
}
.legend-item.activated {
    color: black;
    .legend-0::before {
        border-color: #b7b8bb;
    }
    .legend-1::before {
        border-color: #0091FF;
    }
}
.legend-item:hover {
    color: #7fbcff;
}

.legend-item-1 {
    width: 120px;
}
</style>
