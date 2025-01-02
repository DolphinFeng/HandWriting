import {reactive} from 'vue';

export const confirmModalDialogPanelData = reactive<{
  visible: boolean;
  title: string;
  detail: string;
  okLabel: string;
  cancelLabel: string;
  onOk: () => Promise<void>;
  onCancel: () => Promise<void>;
}>({
  visible: false,
  title: '',
  detail: '',
  okLabel: '确定',
  cancelLabel: '取消',
  onOk: async () => {
    confirmModalDialogPanelData.visible = false;
  },
  onCancel: async () => {
    confirmModalDialogPanelData.visible = false;
  },
});

/*  样例代码
let tagCount = dataManager.getLayerFeatureCount(CommonLayerName.CROSS_CHECK_TAG);
//如果没有参数，需要弹出一个模态对话框，选择是否通过
confirmModalDialogPanelData.visible = true;
confirmModalDialogPanelData.detail = '提交质检任务';
confirmModalDialogPanelData.okLabel = '通过';
confirmModalDialogPanelData.cancelLabel = '不通过';

confirmModalDialogPanelData.onOk = async () => {
  if (tagCount == 0) {
    confirmDialogPanelData.visible = true;
    confirmDialogPanelData.title = '质检通过';
    confirmDialogPanelData.detail =
      '质检通过后,该作业任务对应的标注数据,将发送至管理平台,进行后续数据成图,是否确认';
    confirmDialogPanelData.onOk = async () => {
      confirmDialogPanelData.loading = true;
      await submitTask('allowed');
      confirmDialogPanelData.loading = false;
      confirmDialogPanelData.visible = false;
    };
  } else {
    NioMessage('error', '请先删除质检标', 2000);
    return;
  }

  confirmModalDialogPanelData.visible = false;
};

confirmModalDialogPanelData.onCancel = async () => {
  if (tagCount != 0) {
    confirmDialogPanelData.visible = true;
    confirmDialogPanelData.title = '质检通过';
    confirmDialogPanelData.detail = '质检不通过,该作业任务会打回至原作业员进行修改,是否确认';
    confirmDialogPanelData.onOk = async () => {
      confirmDialogPanelData.loading = true;
      await submitTask('notAllowed');
      confirmDialogPanelData.loading = false;
      confirmDialogPanelData.visible = false;
    };
  } else {
    NioMessage('error', '请添加质检标', 2000);
    return;
  }

  confirmModalDialogPanelData.visible = false;
};
*/
