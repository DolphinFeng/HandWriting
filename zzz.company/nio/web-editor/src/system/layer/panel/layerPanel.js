import {ref, watch} from 'vue';

export const layerPanelVisible = ref(false);
export const addLayerPanelVisible = ref(false);
watch(layerPanelVisible, (newVal) => {
  if (newVal === false) {
    addLayerPanelVisible.value = false;
  }
});
export const setLayerPanelVisible = function (visible) {
  layerPanelVisible.value = visible ?? !layerPanelVisible.value;
};

export function setAddLayerPanelVisible(visible) {
  addLayerPanelVisible.value = visible ?? !addLayerPanelVisible.value;
}

export const mapVersionPanelVisible = ref(false);

export const setMapVersionPanelVisible = function (visible) {
  mapVersionPanelVisible.value = visible ?? !mapVersionPanelVisible.value;
};
