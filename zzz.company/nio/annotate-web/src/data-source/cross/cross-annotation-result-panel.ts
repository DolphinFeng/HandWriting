import {reactive} from 'vue';

export const annoResultPanelData = reactive<{
  visible: boolean;
  height: number;
  loading: boolean;
  list: {
    crossId: string;
    routeId: string;
    annotation: number;
  }[];
}>({
  visible: false,
  height: 200,
  loading: false,
  list: [],
});

export let crossAnnoResultPanelCallback: Array<() => {}> = [];

export function openAnnoResultPanel() {
  for (let callback of crossAnnoResultPanelCallback) {
    callback();
  }
}
