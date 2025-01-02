import { reactive, ref } from 'vue';


export const priorConPaneldata = reactive<{
  visible: boolean,
  productId: string,
  branchId: string,
}>({
  visible: false,
  productId: '',
  branchId: '',
});
