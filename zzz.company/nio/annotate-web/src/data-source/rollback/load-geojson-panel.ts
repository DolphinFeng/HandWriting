import {reactive} from 'vue';

export const loadGeojsonDlgData = reactive<{
  visible: boolean;
  title: string;
  //url: string;
  taskId: string;
  //mesh: string;
  //itemsVisible: boolean[][];
  okLabel: string;
  cancelLabel: string;
  onOk: () => Promise<void>;
  onCancel: () => Promise<void>;
}>({
  visible: false,
  title: '',
  //url: 'http://localhost:8081',
  taskId: '',
  //taskId: '99',
  //mesh: '557041152',
  //itemsVisible: [],
  okLabel: '确定',
  cancelLabel: '取消',
  onOk: async () => {
    loadGeojsonDlgData.visible = false;
  },
  onCancel: async () => {
    loadGeojsonDlgData.visible = false;
  },
});
