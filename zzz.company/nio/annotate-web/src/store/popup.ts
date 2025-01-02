import {reactive} from 'vue';

export let popupInfo = reactive<{
  visible: Boolean;
  pos: number[];
  type: String;
  userData: number | null;
}>({
  visible: false,
  pos: [0, 0],
  type: 'COPY_POS',
  userData: null,
});
