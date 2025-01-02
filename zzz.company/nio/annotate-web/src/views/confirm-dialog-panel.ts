import {reactive} from 'vue';

export const confirmDialogPanelData = reactive<{
  visible: boolean;
  title: string;
  detail: string;
  loading: boolean;
  onOk: () => Promise<void>;
  onCancel: () => void;
}>({
  visible: false,
  title: '',
  detail: '',
  loading: false,
  onOk: async () => {
    confirmDialogPanelData.visible = false;
  },
  onCancel: () => {
    confirmDialogPanelData.visible = false;
  },
});
