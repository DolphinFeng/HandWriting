<template>
  <Panel
      center v-model:visible="saveOddData.visible"
      title-center
      :width="400"
      :height="230"
      :loading="saveOddData.loading"
      loading-text="提交中..."
  >
    <template #header>
      <div class="save-title">提交</div>
    </template>
    <template #default>
      <div class="save-box">
        <div class="save-info-box">
          <div>本次提交包含事件信息如下：</div>
          <div>新增事件：<span class="success-number">{{saveOddData.create}}</span>条</div>
          <div>修改事件：<span class="warning-number">{{saveOddData.modify}}</span>条</div>
          <div>删除事件：<span class="danger-number">{{saveOddData.delete}}</span>条</div>
        </div>
        <div class="footer-btn-group">
          <button class="footer-btn cancel" title="取消" @click="cancelHandler">取消</button>
          <button style="margin-left: 40px;" class="footer-btn confirm" title="保存事件" @click="confirm">确定</button>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script setup>
import Panel from "../../../components/panel/Panel.vue";
import {closeSavePanel, clearPanel, saveOddData, uploadOddTaskHandler} from "../../../system/odd/saveOdd/saveOdd.js";
import {onActivated, ref} from "vue";

function confirm() {
  uploadOddTaskHandler();
}

//取消事件
const cancelHandler = function () {
  closeSavePanel();
};

onActivated(() => {

});
</script>

<style scoped>
.save-title {
  font-size: 14px;
  color: #fff;
}
.save-box {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  height: 100%;
  padding: 14px 12px;
  user-select: none;
}
.save-info-box > div {
  margin: 2px 0;
  font-size: 14px;
}
.danger-number {
  color: #f56c6c;
}
.warning-number {
  color: #e6a23c;
}
.success-number {
  color: #67c23a;
}
</style>
