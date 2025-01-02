<template>
  <Panel v-model:visible="qualityData.taskModel.visible"
         center title-center
         :width="360"
         :height="200"
         :loading="qualityData.taskModel.loading"
         loading-text="提交中..."
  >
    <template #header>
      <div class="quality-result-title">
        <div v-if="qualityData.taskModel.isPass" class="success-title">质检通过</div>
        <div v-else class="fail-title">质检不通过</div>
      </div>
    </template>
    <template #default>
      <div class="quality-box">
        <div class="save-info-box">
          <div v-if="qualityData.taskModel.isPass">{{qualityData.contentConfirm}}</div>
          <div v-else>{{qualityData.contentCancel}}</div>
        </div>
        <div class="footer-btn-group">
          <button class="footer-btn cancel" title="取消" @click="cancelHandler">取消</button>
          <button style="margin-left: 40px;" class="footer-btn confirm" title="保存事件" @click="confirmHandler">确定</button>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script setup>
import Panel from "../../../../../components/panel/Panel.vue";
import {useStore} from "vuex";
import {qualityData, qualityUploadConfirm, qualityUploadCancel} from "../../../../../system/task/quality/quality.js";
import {onDeactivated} from "vue";

const store = useStore();

function cancelHandler() {
  qualityUploadCancel();
}
function confirmHandler() {
  qualityUploadConfirm();
}

onDeactivated(() => {

});
</script>

<style scoped>
.quality-result-title {
  font-size: 15px;
}
.success-title {
  color: #31a34e;
}
.fail-title {
  color: #ea4738;
}
.quality-box {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  height: 100%;
  padding: 14px 12px;
  user-select: none;
}
.save-info-box {
  margin: 25px 20px 0;
  font-size: 14px;
}
</style>
