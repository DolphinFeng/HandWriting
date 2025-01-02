import store from '../../../../src/store/index.js';
import {getBaseMapJsonUrl, getBaseMapUrl} from '../../../system/layer/tileLayer/tileLayerController.js';
import axios from 'axios';

let linkIdGeolineId = new Map();
let linkCoordinates = new Map();

export async function fetchLink(linkId) {
  let geolineIds = [];
  await fetchLinkNdsJson(linkId);

  let linkIdKey = linkId + '' + store.state.version.curVersion;
  geolineIds = linkIdGeolineId.get(linkIdKey);
  if (geolineIds.length == 0) {
    return;
  }

  let lines = [];
  for (let geolindId of geolineIds) {
    let mesh_num = BigInt(geolindId) >> BigInt(32);
    let currentKey = mesh_num + '' + store.state.version.curVersion;
    await fetchLinkCoordinates(currentKey, mesh_num);

    let coordinates = linkCoordinates.get(currentKey)[geolindId];
    lines.push(coordinates);
  }

  return lines;
}

export async function fetchSdLink(linkId) {
  linkId = linkId.trim();

  let link_num = BigInt(linkId);
  let mesh_num = link_num >> BigInt(32);

  let coordinates = [];

  let ret = await axios.get(
    window.api.sdLinkURL + '?map_version=' + store.state.version.curVersion + '&tile_id=' + mesh_num,
  );
  let tiles_data = ret.data?.data?.tiles_data;
  if (!tiles_data || tiles_data.length == 0) {
    NioMessage('info', '未查询到sd link', 1500);
    return;
  }

  let sdLinks = tiles_data[0].sdLinks;
  if (!sdLinks) {
    NioMessage('info', '未查询到sd link', 1500);
    return;
  }

  for (let link of sdLinks) {
    if (link.id == linkId) {
      if (link.geometry) {
        for (let item of link.geometry) {
          coordinates.push([item.lon, item.lat]);
        }
      }
    }
  }

  return coordinates;
}

async function fetchLinkNdsJson(linkId) {
  try {
    let link_num = BigInt(linkId);
    let mesh_num = link_num >> BigInt(32);

    let linkIdKey = linkId + '' + store.state.version.curVersion;
    if (!linkIdGeolineId.has(linkIdKey)) {
      linkIdGeolineId.set(linkIdKey, []);
      const baseMapJsonURL = getBaseMapJsonUrl(store.state.version.curVersion);
      let linkMesh = await axios.get(`${baseMapJsonURL}/tile_${mesh_num}.json`);

      let linkList = linkMesh.data.linkList;
      if (linkList) {
        for (let link of linkList) {
          let linkIdKeyTmp = link.id + '' + store.state.version.curVersion;

          if (!linkIdGeolineId.has(linkIdKeyTmp)) {
            linkIdGeolineId.set(linkIdKeyTmp, []);
          }

          for (let geoId of link.roadGeoLineIds) {
            linkIdGeolineId.get(linkIdKeyTmp).push(geoId);
          }
        }
      }
    }
  } catch (error) {
    linkIdGeolineId.clear();
    NioMessage('error', '获取图幅数据失败', 1500);
    throw error;
  }
}

async function fetchLinkCoordinates(currentKey, mesh) {
  if (!linkCoordinates.has(currentKey)) {
    linkCoordinates.set(currentKey, {});
    const baseMapURL = getBaseMapUrl(store.state.version.curVersion);

    try {
      let res = await axios.get(
        `${baseMapURL}/hd_map/china_json_${store.state.version.curVersion}_new/road/${mesh}.geojson`,
      );

      let features = res.data.features;
      for (let j = 0; j < features.length; j++) {
        linkCoordinates.get(currentKey)[features[j].properties.id] = features[j].geometry.coordinates;
      }
    } catch (error) {
      linkCoordinates.delete(currentKey);
      NioMessage('error', '获取图幅数据失败', 1500);
      throw error;
    }
  }
}
