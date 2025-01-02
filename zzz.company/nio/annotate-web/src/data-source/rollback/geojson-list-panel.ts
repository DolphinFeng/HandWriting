import {reactive} from 'vue';
import axios from 'axios';
import {NioMessage} from '../../utils/utils';
import {rollbackBucketName, reCreateRollbackTilesets} from './rollback-tilesets.ts';

let rollbackURL = window.api.rollbackURL;

export interface Tree {
  label: string;
  msg: string;
  children?: Tree[];
  tiled: boolean;
}

export const geojsonPanelData = reactive<{
  visible: boolean;
  tree: Tree[];
  loading: boolean;

  onOk: () => Promise<void>;
  onCancel: () => Promise<void>;
}>({
  visible: false,
  tree: [],
  loading: false,
  onOk: async () => {
    geojsonPanelData.visible = false;
  },
  onCancel: async () => {
    geojsonPanelData.visible = false;
  },
});

export function clearMatchPrimitive() {
  geojsonPanelData.tree = [];
}

export async function loadingRollbackItems(taskId) {
  geojsonPanelData.tree = [];
  geojsonPanelData.visible = true;
  geojsonPanelData.loading = true;
  let url = rollbackURL + '/queryAllLayerPath';

  try {
    let response = await axios.post(url, {
      bucketName: rollbackBucketName,
      prefix: 'hd-rollback/' + taskId,
    });

    let tiledItems: {name: string; key: string}[] = [];
    let noTiledItems: {name: string; key: string}[] = [];

    for (let item of response.data.data) {
      if (!item.includes('visual')) continue;

      let isTiled = !item.includes('site-group') && !item.includes('hdsd');
      if (isTiled) {
        noTiledItems.push({
          name: item,
          key: item,
        });
      } else {
        tiledItems.push({
          name: item,
          key: item,
        });
      }

      geojsonPanelData.tree.push({
        label: item,
        msg: '',
        children: [],
        tiled: isTiled,
      });
    }

    reCreateRollbackTilesets(noTiledItems);
  } catch (error) {
    NioMessage('error', error + '');
  } finally {
    geojsonPanelData.loading = false;
  }
}
