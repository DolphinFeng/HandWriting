import {layerListItems} from '../../../system/layer/layerController.js';
import {
  dynamicLayerSourceType,
  dynamicListPriorLayerSourceType
} from '../../../system/layer/tileLayer/tileLayerController.js';

export interface LayerItem {
  name: string;
  show: boolean;
  item_id: string;
}

export const items3: LayerItem[] = layerListItems.items.slice(
  4 + dynamicListPriorLayerSourceType.length + dynamicLayerSourceType.length + 15,
);

export const items5: LayerItem[] = layerListItems.items.slice(
  4 + dynamicListPriorLayerSourceType.length + dynamicLayerSourceType.length + 12,
  4 + dynamicListPriorLayerSourceType.length + dynamicLayerSourceType.length + 15,
);