import axios from 'axios';
import {meshTolls} from '../../utils/meshTool/meshTools.js';
import {NadTileMeta} from '../../system/nad/nadModel.js';
import {ElMessage} from "element-plus";
import { result } from 'lodash';

async function loadingNadTileData(payload, nadTileServiceURL, nadTileMap) {

  try {

    //console.log("load nad tile begin: ", payload.ndsVersion);

    const res = await axios.post(nadTileServiceURL + '/nmap/odd/mesh/queryMeshEventCntList', {
      ndsVersion: payload.ndsVersion,
      level: payload.level,
      hasEvent: payload.hasEvent,
      leftBottomX: payload.leftBottomX,
      leftBottomY: payload.leftBottomY,
      rightTopX: payload.rightTopX,
      rightTopY: payload.rightTopY
    });

    //console.log("load nad tile end: ", res.data.data.length);
    
    return (res.data.data as NadTileMeta[]).filter((item) => {
      return !nadTileMap.has(item.meshId);
    });
  } catch (error) {
    throw new Error('loadingNadTileData -> axios.post 异常：' + error.message);
  }

}

export const nadTileTask = {
  async loadingSourceNadTile(resolve, reject, args) {

    const queue : Promise<NadTileMeta[]>[] = [];

    queue.push(
      loadingNadTileData(
        args.payload,
        args.nadTileServiceURL,
        args.nadTileMap,
      ),
    );

    const responses = await Promise.allSettled(queue);

    let res: any[] = [];

    responses.forEach((response) => {
      if (response.status === 'fulfilled') {
        res = res.concat(response.value);
      }
      else{
        reject({data: response.reason.message + ''});
      }
    });

    resolve({
      data: res,
    });
  },
};
