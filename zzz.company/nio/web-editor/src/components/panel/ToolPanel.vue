<template>
  <transition name="el-zoom-in-top">
    <article
      v-if="visible"
      class="panel-box"
      :style="{
        top: property.top + 'px',
        left: property.left + 'px',
        zIndex: property.zIndex,
        width: property.width + 'px',
        height: property.height + 'px',
        position: position,
        ...panelStyle,
      }"
      @mousedown="raiseTop"
    >
      <!-- <header
        :style="headerStyle"
        class="title-box"
        :class="{'title-center': titleCenter}"
        @mousedown.left="property.panelDown"
      >
        <slot name="header"></slot>
      </header> -->
      <section
        class="body-box"
        @mousedown.left="property.resizeDown"
        v-loading="loading"
        :element-loading-text="loadingText"
        :element-loading-spinner="svg"
        element-loading-svg-view-box="-10, -10, 50, 50"
        element-loading-background="rgba(232, 232, 232, 0.8)"
      >
        <slot></slot>
        <div v-if="scaleAble">
          <div class="resize right"></div>
          <div class="resize left"></div>
          <div class="resize bottom"></div>
          <div class="resize right-bottom"></div>
          <div class="resize left-bottom"></div>
        </div>
      </section>
    </article>
  </transition>
</template>

<script setup>
import {useStore} from 'vuex';
import {computed, onActivated, reactive, useAttrs, watch} from 'vue';
import {svg} from '../../js/svg.js';

//不允许同时传top和bottom、left和right
const props = defineProps({
  visible: {type: Boolean, required: true},
  width: {type: Number, default: 200},
  height: {type: Number, default: 200},
  center: {type: Boolean, default: false},
  rightBottom: {type: Boolean, default: true},
  right: {type: Number, default: 0},
  left: {type: Number, default: 0},
  top: {type: Number, default: 0},
  bottom: {type: Number, default: 0},
  fixedTop: {type: Boolean, default: false},
  minWidth: {type: Number, default: 0},
  minHeight: {type: Number, default: 0},
  maxWidth: {type: Number, default: Number.POSITIVE_INFINITY},
  maxHeight: {type: Number, default: Number.POSITIVE_INFINITY},
  titleCenter: {type: Boolean, default: false},
  loading: {type: Boolean, default: false},
  loadingText: {type: String, default: ''},
  scaleAble: {type: Boolean, default: false},
  headerStyle: {type: Object, default: {}},
  panelStyle: {type: Object, default: {}},
  position: {type: String, default: 'fixed'},
});
const emit = defineEmits(['update:visible', 'created', 'changeSize']);
const store = useStore();
const attrs = useAttrs();

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      emit('created');
      raiseTop();
    }
  },
);

//面板属性
const property = reactive({
  top: props.top,
  left: props.left,
  width: props.width,
  height: props.height,
  zIndex: ++store.state.maxZIndex,
  panelDown() {
    document.addEventListener('mouseup', property.panelUp);
    document.addEventListener('mousemove', property.panelMove);
  },
  panelMove(ev) {
    property.left += ev.movementX;
    property.top += ev.movementY;
  },
  panelUp() {
    document.removeEventListener('mousemove', property.panelMove);
    document.removeEventListener('mouseup', property.panelUp);
  },
  //设置宽度
  resizeDown(ev) {
    const classList = ev.target.classList;
    if (!classList.contains('resize')) {
      return;
    }
    if (classList.contains('right')) {
      property.setCoefficient(1, 0);
    } else if (classList.contains('left')) {
      property.setCoefficient(-1, 0);
    } else if (classList.contains('bottom')) {
      property.setCoefficient(0, 1);
    } else if (classList.contains('right-bottom')) {
      property.setCoefficient(1, 1);
    } else if (classList.contains('left-bottom')) {
      property.setCoefficient(-1, 1);
    }
    document.addEventListener('mouseup', property.resizeUp);
    document.addEventListener('mousemove', property.resizeMove);
  },
  scaleWidth: 0,
  scaleHeight: 0,
  //桥接修改缩放系数
  setCoefficient(width, height) {
    property.scaleWidth = width;
    property.scaleHeight = height;
  },
  resizeMove(ev) {
    const newWidth = property.width + property.scaleWidth * ev.movementX,
      newHeight = property.height + property.scaleHeight * ev.movementY;
    if (newWidth < props.maxWidth && newWidth > props.minWidth) {
      property.width = newWidth;
      if (property.scaleWidth === -1) {
        property.left += ev.movementX;
      }
    }
    if (newHeight < props.maxHeight && newHeight > props.minHeight) {
      property.height = newHeight;
      if (property.scaleHeight === -1) {
        property.top += ev.movementY;
      }
    }
    emit('changeSize', property.width, property.height);
  },
  resizeUp() {
    document.removeEventListener('mousemove', property.resizeMove);
    document.removeEventListener('mouseup', property.resizeUp);
  },
});

//将面板提升到最顶层
const raiseTop = function () {
  property.zIndex = ++store.state.maxZIndex;
};
//初始化操作
(function () {
  if (props.minWidth > props.width) {
    property.width = props.minWidth;
  }
  if (props.minHeight > props.height) {
    property.height = props.minHeight;
  }
  let bodyWidth = document.body.clientWidth,
    bodyHeight = document.body.clientHeight;
  //将面板置于屏幕中间
  if (props.center === true) {
    property.left = (bodyWidth - property.width) / 2;
    property.top = property.top === 0 ? (bodyHeight - property.height) / 2 : property.top;
  }

  //将面板置于左下角
  if (props.rightBottom === true) {
    property.left = bodyWidth - property.width - 10;
    property.top = bodyHeight - property.height - 10;
  }

  if (props.right !== 0) {
    property.left = bodyWidth - property.width - props.right;
  }
  if (props.bottom !== 0) {
    property.top = bodyHeight - property.height - props.bottom;
  }
  if (props.fixedTop === true) {
    property.zIndex = 99999999;
  }
})();
</script>

<style scoped lang="scss">
.panel-box {
  position: fixed;
  display: flex;
  flex-flow: column nowrap;
  border-radius: 8px;
  background-color: #333745;
  box-shadow: var(--el-box-shadow-dark);
  font-size: 13px;
  color: #fff;
  overflow: hidden;
}

.title-box {
  display: flex;
  align-items: center;
  padding: 10px 8px;
  border-radius: 8px 8px 0 0;
  background-color: #393c4d;
  box-shadow: var(--el-box-shadow-lighter);
  //cursor: pointer;
  user-select: none;
  font-size: 14px;
}

.title-center {
  justify-content: center;
}

.body-box {
  display: flex;
  flex-flow: column nowrap;
  padding-bottom: 8px;
  position: relative;
  flex: 1;
  overflow-y: hidden;

  .resize {
    position: absolute;
    user-select: none;
  }

  .right {
    position: absolute;
    top: 0;
    right: 0;
    width: 3px;
    height: 100%;
    cursor: col-resize;
  }

  .left {
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    cursor: col-resize;
  }

  .bottom {
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    cursor: row-resize;
  }

  .right-bottom {
    bottom: 0;
    right: 0;
    width: 8px;
    height: 8px;
    cursor: nwse-resize;
  }

  .left-bottom {
    bottom: 0;
    left: 0;
    width: 8px;
    height: 8px;
    cursor: nesw-resize;
  }
}
</style>
