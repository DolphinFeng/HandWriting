import {reactive} from 'vue';
import axios from 'axios';
import {rollbackBucketName, reCreateRollbackTilesets} from './rollback-tilesets.ts';
import {NioMessage} from '../../utils/utils';
import {renderPrimitiveManager} from '../../model/render-primitive.ts';
import {NioFeature, dataManager, generateFeatureId} from '../../model/feature.js';
//import { testData } from './test-data.js';

const rollbackURL = window.api.rollbackURL;

export const pagedListData: {
  url: string;
  key: string;
  visible: boolean;
  loading: boolean;
  marker: string;
  idNameMap: Map<any, any>;
  posMap: Map<any, any>;
  list: {
    cos_prefix: string;
    name: string;
  }[];
  pageNo: number;
  pageSize: number;
  total: number;
} = reactive({
  url: '',
  key: '',
  visible: false,
  loading: false,
  marker: '',
  idNameMap: new Map(),
  posMap: new Map(),
  list: [],
  pageNo: 1,
  pageSize: 200,
  total: 0,
});

export async function loadingListHandler() {
  pagedListData.list = [];
  pagedListData.idNameMap.clear();

  try {
    let url = rollbackURL + '/queryLayerPathAllFile';
    let response = await axios.post(url, {
      bucketName: rollbackBucketName,
      prefix: pagedListData.key,
      marker: pagedListData.marker,
      maxKeys: pagedListData.pageSize,
    });

    for (let item of response.data.data.files) {
      pagedListData.list.push({
        cos_prefix: item,
        name: item,
      });

      //pagedListData.marker = item;
    }

    pagedListData.marker = response.data.data.nextMaker;

    pagedListData.visible = true;
    pagedListData.total = pagedListData.list.length;
  } catch (error) {
    NioMessage('error', error + '');
  }
}

export async function laodingOneItem(cos_prefix, visible) {
  try {
    if (visible) {
      if (pagedListData.idNameMap.has(cos_prefix)) {
        let id = pagedListData.idNameMap.get(cos_prefix);
        renderPrimitiveManager.setVisible(id, visible);
      } else {
        let url = rollbackURL + '/queryLayerFile';
        let response = await axios.get(url + '?bucketName=' + rollbackBucketName + '&key=' + cos_prefix);
        //let response = testData;

        let featureId = generateFeatureId();
        let record: {
          type: string;
          features: {
            geometry: {
              type: string;
              coordinates: [];
            };
            type: string;
            properties: {};
          }[];
        } = response.data;

        let pos = [];
        for (let feature of record.features) {
          if (feature.geometry.type == 'Point') {
            pos.push(feature.geometry.coordinates[0]);
            pos.push(feature.geometry.coordinates[1]);
          } else if (feature.geometry.type == 'LineString') {
            for (let coordinate of feature.geometry.coordinates) {
              pos.push(coordinate[0]);
              pos.push(coordinate[1]);
            }
          } else if (feature.geometry.type == 'Polygon') {
          }
        }

        pagedListData.idNameMap.set(cos_prefix, featureId);
        pagedListData.posMap.set(cos_prefix, pos);
        renderPrimitiveManager.addComponentPrimitive(featureId, record, '#0000ff');
      }
    } else {
      let id = pagedListData.idNameMap.get(cos_prefix);
      renderPrimitiveManager.setVisible(id, visible);
    }
  } catch (error) {
    NioMessage('error', error + '');
  }
}

export async function clearRollbackAllPrimitive(resetMarker: boolean) {
  for (let item of pagedListData.idNameMap.values()) {
    renderPrimitiveManager.removePrimitive(item);
  }

  pagedListData.idNameMap.clear();
  pagedListData.posMap.clear();
  pagedListData.total = 0;
  if (resetMarker) {
    pagedListData.marker = '';
  }

  pagedListData.list = [];
}
