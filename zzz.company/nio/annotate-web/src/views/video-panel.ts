import {reactive, ref} from 'vue';

/**
 * 视频面板开关
 */
export let videoPanelVisible = ref(false);

export const videoData = reactive<{
  curIdx: number;
  video: {url: string}[];
  total: number;
  loading: boolean;
}>({
  curIdx: 0,
  video: [],
  total: 0,
  loading: false,
});
