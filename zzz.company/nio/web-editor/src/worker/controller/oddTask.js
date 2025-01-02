import axios from 'axios';
import {meshTolls} from '../../utils/meshTool/meshTools.js';
import {parseWKT} from '../../utils/wkt/parseWKT.js';
import JSONBitInt from 'json-bigint';

function createOddTaskResult(oddItem, isWork) {
  return {
    dynamic: oddItem.dynamicInfo,
    positions: parseWKT.read(oddItem.geometry),
    featureId: oddItem.featureId,
    law: oddItem.lawSpdlmt,
    ex: oddItem.expSpdlmt,
    st: oddItem.startOffset,
    end: oddItem.endOffset,
    ver: oddItem.mapVersion,
    status: oddItem.status,
    source: oddItem.source,
    eventId: oddItem.eventId,
    geometry: oddItem.geometry,
    isWork: isWork,
    createTime: oddItem.createTime,
    updateTime: oddItem.updateTime,
    provinceName: oddItem.provinceName,
    cityName: oddItem.cityName,
    tile: oddItem.tile,
    memo: oddItem.memo,
    siteMapId: oddItem.siteMapId,
    layerName: oddItem.layerName,
    path: oddItem.path,
    paths2e: oddItem.paths2e,
    infoValueList: oddItem.infoValueList,
  };
}

function loadingSourceOddData(version, apiDynamicMasterViewURL, tiles, eventMap, result) {
  if (tiles.length === 0) {
    return Promise.resolve();
  }

  return axios
    .post(apiDynamicMasterViewURL + '/dynamic-map/event/master/view', {
      mapVersion: version,
      tiles: tiles,
    })
    .then((res) => {
      if (res.data.code === 200) {
        let dataList = res.data.data;
        for (let i = 0; i < dataList.length; i++) {
          //跳过已经存在的事件
          if (eventMap.has(dataList[i].eventId)) {
            continue;
          }
          result.push(createOddTaskResult(dataList[i], false));
        }
      } else {
        throw new Error('loadingSourceOddData错误：' + res.data.msg);
      }
    })
    .catch(function (error) {
      throw new Error('loadingSourceOddData->axios.post 错误：' + error);
    });
}

function loadingWorkOddData(apiDynamicURL, branchName, mapVersion) {
  return axios
    .post(apiDynamicURL + '/dynamic-map/event/branch/fetch', {
      branchName: branchName,
      mapVersion: mapVersion,
    })
    .then((res) => {
      if (res.data.code === 200) {
        let data = res.data.data;
        return data.map((oddItem) => createOddTaskResult(oddItem, true));
      } else {
        throw new Error('loadingWorkOddData错误:' + res.data.msg);
      }
    })
    .catch(function (error) {
      throw new Error('loadingWorkOddData->axios.post 错误：' + error);
    });
}

function loadingTrajectoryData(apiRouteURL, curVersion, stPos, edPos, distance) {
  return axios
    .post(
      apiRouteURL + '/route',
      {
        version: curVersion,
        startpos: stPos,
        endpos: edPos,
        distance: distance,
      },
      {
        transformResponse: (data) => JSONBitInt.parse(data),
      },
    )
    .then((res) => {
      if (!('errmsg' in res.data)) {
        let box = res.data.bbox,
          routePath = res.data['route_path'];
        const lanes = [];
        for (let i = 0; i < routePath.length; i++) {
          let laneInfos = routePath[i]['lane_infos'];
          for (let j = 0; j < laneInfos.length; j++) {
            let lane = laneInfos[j];
            lanes.push({
              laneId: typeof lane.id === 'number' ? lane.id : lane.id.toString(),
              positions: parseWKT.read(lane.wkt),
              group: typeof lane.group === 'number' ? lane.group : lane.group.toString(),
              len: typeof lane.len === 'number' ? lane.len : lane.len.toNumber(),
              wkt: lane.wkt,
            });
          }
        }
        return {
          box: box.split(',').map((item) => parseFloat(item)),
          routePath: lanes,
        };
      } else {
        throw new Error('loadingTrajectoryData错误:' + res.data.errmsg);
      }
    });
}

export const oddTask = {
  loadingSourceOdd(resolve, reject, args) {
    const tiles = meshTolls.intersectsTile(args['lbLon'], args['lbLat'], args['rtLon'], args['rtLat']),
      len = tiles.length,
      queue = [],
      result = [];
    let queueSize, tileLen;
    if (len <= 4) {
      queueSize = len;
      tileLen = 1;
    } else if (len <= 8) {
      queueSize = 4;
      tileLen = 2;
    } else {
      queueSize = 8;
      tileLen = Math.ceil(len / 8);
    }
    for (let i = 0; i < queueSize; i++) {
      queue.push(
        loadingSourceOddData(
          args.mapVersion,
          args.apiDynamicURL,
          tiles.slice(i * tileLen, i * tileLen + tileLen),
          args.eventMap,
          result,
        ),
      );
    }

    Promise.all(queue)
      .then(() => {
        resolve(result);
      })
      .catch((err) => {
        reject(err.message);
      });
  },
  loadingWorkOdd(resolve, reject, args) {
    loadingWorkOddData(args.apiDynamicURL, args.branchName, args.mapVersion)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err.message);
      });
  },
  loadingTrajectory(resolve, reject, args) {
    loadingTrajectoryData(args.apiRouteURL, args.curVersion, args.stPos, args.edPos, args.distance)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err.message);
      });
  },
};
