import {ref} from "vue";

export const qualityTagListVisible = ref(false);

export const setQualityTagListVisible = function (visible) {
  qualityTagListVisible.value = visible ?? !qualityTagListVisible.value;
};
