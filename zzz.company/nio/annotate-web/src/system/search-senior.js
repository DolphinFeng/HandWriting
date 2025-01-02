import { ref, watch } from 'vue';

export const searchSeniorPanelVisible = ref(false);

export const setSearchSeniorPanelVisible = function (visible) {
  searchSeniorPanelVisible.value = visible ?? !searchSeniorPanelVisible.value;
};
