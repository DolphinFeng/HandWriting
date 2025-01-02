import {reactive, ref, watch} from "vue";

export const batchPanelVisible = ref(false);

export const batchData = reactive({
    list: [],
    pageNo: 1,
    pageSize: 10,
    total: 0,
});

export const eventListData = reactive({
    show: false,
    loading: false,
    list: [],
    batchNum: '',
    pageNo: 1,
    pageSize: 20,
    total: 0,
});

export function setBatchPanel(show) {
    batchPanelVisible.value = show;
}
watch(batchPanelVisible, (newVal) => {
    if (newVal === false) {
        eventListData.show = false;
    }
});
