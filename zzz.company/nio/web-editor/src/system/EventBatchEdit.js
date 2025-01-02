import {reactive, ref, watch} from 'vue';

//记录在作业库列表里被改过的事件的最终值
export let modifiedWorkEvents = new Map();

export let editTypePanelData = reactive({
  visible: false,
  count: 0,
  type: '经验限速',
  lawLimitSpeed: 0,
  exLimitSpeed: 0,
  infoValueList: 1,
  selectedRows: [],
});

export const workEventTableRef = ref(null);
