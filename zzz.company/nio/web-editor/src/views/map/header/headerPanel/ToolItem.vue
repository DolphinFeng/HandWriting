<template>
  <el-popover
      :visible="visible"
      effect="dark"
      :show-arrow="false"
      trigger="click"
      :width="width"
      :disabled="disabled"
      popper-class="popper"
      :teleported="false"
      :hide-after="0"
      @before-enter="beforeEnter"
      @before-leave="beforeLeave"
      @after-leave="afterLeave"
  >
    <template #reference>
      <div>
        <el-tooltip
            trigger="hover"
            effect="dark"
            :content="title"
            placement="bottom"
            :show-arrow="false"
            :show-after="800"
            :hide-after="0"
            :disabled="toolVisible"
        >
          <div :id="id" @click="handleItem" class="icon-item" :class="{'icon-active-item':active, 'icon-radius-left':left, 'icon-radius-right':right, 'icon-radius-all': all}">
            <slot name="icon">
              <i class="iconfont" :class="icon" :style="{color: color}"></i>
            </slot>
          </div>
        </el-tooltip>
      </div>
    </template>
    <slot></slot>
  </el-popover>
</template>

<script>
import {onActivated, onDeactivated, onMounted, ref} from "vue";
export default {
  name: "ToolItem",
  props: {
    id: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    left: {
      type: Boolean,
      default: false,
    },
    right: {
      type: Boolean,
      default: false,
    },
    all: {
      type: Boolean,
      default: false,
    },
    color: String,
    width: {
      type: Number,
      default: 150,
    }
  },
  emits: ['click', 'beforeEnter', 'afterLeave'],
  setup(props, {slots, emit}) {
    const toolVisible = ref(false);
    const disabled = ref(true);
    const active = ref(false);
    const visible = ref(false);

    if (slots.default) {
      disabled.value = false;
    }

    function handleItem() {
      visible.value = !visible.value;
      emit('click');
    }
    function beforeEnter() {
      emit('beforeEnter');
      toolVisible.value = true;
      active.value = true;
    }
    function beforeLeave() {
      toolVisible.value = false;
      active.value = false;
    }
    function afterLeave() {
      emit('afterLeave');
    }

    onDeactivated(() => {
      visible.value = false;
    });
    return {
      disabled, toolVisible, visible,
      beforeEnter, beforeLeave, active, handleItem, afterLeave,
    }
  }
}
</script>
<style>
.popper {
  --el-popover-padding: 0;
  border: 0!important;
}
</style>
<style scoped>
.icon-item {
  position: relative;
  padding: 4px 9px;
  margin: 0 1px;
  color: #fff;
  background-color: #101223;
  transition: background-color .3s ease;
  cursor: pointer;
  user-select: none;
}
.icon-item:hover {
  background-color: #285de7!important;
}
.icon-item i {
  font-size: 16px;
}
.icon-active-item {
  background-color: #285de7!important;
}

.icon-radius-left {
  border-top-left-radius: var(--icon-radius);
  border-bottom-left-radius: var(--icon-radius);
}
.icon-radius-right {
  border-top-right-radius: var(--icon-radius);
  border-bottom-right-radius: var(--icon-radius);
}
.icon-radius-all {
  border-radius: var(--icon-radius);
}
</style>
