<template>
  <el-dialog
      :title="title"
      v-model="showDialog"
      show-close
      @close="close"
  >
    <div style="height: 400px;overflow-y: auto">
      <json-viewer
          :value="parseJson"
          :expand-depth="10"
          copyable
          boxed
          :show-array-index="true"
          :expanded="true"
      >
      </json-viewer>
    </div>
    <template #footer>
      <el-button size="small" type="success" @click="copyJsonSource">复制源格式</el-button>
    </template>
  </el-dialog>
</template>

<script>
import {copyTextToClipboard} from "../utils/index.js";
import {computed} from "vue";
import {ElMessage} from "element-plus";

export default {
  name: "JsonView",
  props: {
    data: String,
    title: String,
    visible: Boolean,
  },
  computed: {
    showDialog: {
      get() {
        return this.visible;
      },
      set(value) {
      }
    }
  },
  emits: ["update:visible"],
  setup(props, {emit}) {
    const parseJson = computed(() => {
      let result = '';
      try {
        result = JSON.parse(props.data);
      } catch (e) {
        result = props.data;
      }
      return result;
    });
    //复制源字符串
    function copyJsonSource() {
      copyTextToClipboard(props.data);
    }

    function close() {
      if (props.visible === false) {
        return;
      }
      emit('update:visible', false);
    }

    return {
      parseJson,
      copyJsonSource, close,
    }
  },
}
</script>

<style scoped>

</style>
