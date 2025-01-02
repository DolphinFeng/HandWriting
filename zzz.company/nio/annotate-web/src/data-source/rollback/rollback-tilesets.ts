import {PrimitiveCollection, Cesium3DTileStyle, Cesium3DTileset} from 'cesium';
import {createViewer} from '../../cesium/create-viewer.js';
import {NioMessage} from '../../utils/utils.js';

let viewer = createViewer();
const baseMapHL = window.api.baseMapHL;
const rollbackURL = window.api.rollbackURL;

//export const rollbackBucketName = "aa-tcbj-map-nmap-test-1306458289";
export const rollbackBucketName = 'nmap-merge-pre-1';

let rollbackTilesetsContainer = new PrimitiveCollection();
let rollbackContainerMap = new Map();
viewer.scene.primitives.add(rollbackTilesetsContainer);

export function getCrossMatchColor() {
  return {
    conditions: [
      ["${feature['hdsd_type']} === 'site'", "color('red', 1.0)"],
      ["${feature['hdsd_type']} === 'hd'", "color('#1ED0F7FF')"],
      ['true', "color('#409EEF')"],
    ],
  };
}

export function getIntersectionGraphColor() {
  return {
    conditions: [
      ["${feature['type']} === 'INSIDE'", "color('red', 1.0)"],
      ["${feature['hdsd_type']} === 'hd'", "color('#1ED0F7FF')"],
      ["${feature['site_id']} === '0'", "color('red', 1.0)"],
      ['true', "color('#409EEF')"],
    ],
  };
}

async function createRollbackTileSet(key, color) {
  let tileStyle;

  if (key.includes('cross_match')) {
    let color = getCrossMatchColor();
    tileStyle = new Cesium3DTileStyle({
      color: color,
    });
  } else if (key.includes('intersection_graph')) {
    let color = getIntersectionGraphColor();
    tileStyle = new Cesium3DTileStyle({
      color: color,
    });
  } else {
    tileStyle = new Cesium3DTileStyle({
      //color: `color("${color}")`,
      color: {
        //如果geojson里存在color字段，则按照color字段的值显示颜色，没有color字段，则显示函数另外传入的color值
        //geojson里color的写法为:  "color": "rgb(0, 255, 0)" 或者 "color": "#ff0000"
        conditions: [
          ["${feature['color']} !== undefined", "color(${feature['color']})"],
          ['true', "color('" + color + "')"],
        ],
      },
    });
  }

  let spaceError = 4;
  let memoryUsage = 200;

  let tilesetOption: any = {
    //url: `${baseMapHL}/dynamicMap/3dtile_uri_nds/tileset.json`,
    url: `${baseMapHL}/dynamicMap/3dtile_uri_nds_bias/tileset.json`,
    shadows: false,
    maximumMemoryUsage: memoryUsage,
    maximumScreenSpaceError: spaceError,
    customUri: rollbackURL + '/queryLayerFile',
    queryParameters: {
      bucketName: rollbackBucketName,
      suffix: '.geojson',
      key: key,
    },
  };

  try {
    let tileset: any = await new Cesium3DTileset(tilesetOption).readyPromise;
    tileset.style = tileStyle;
    tileset.style.geometryWidth = 1.0;
    return tileset;
  } catch (error) {
    NioMessage('error', rollbackURL + '/queryLayerFile' + ', 加载失败: ' + error);
  }
}

export function rollbackLineWidthCallback(lineWidth) {
  for (let i = 0; i < rollbackTilesetsContainer.length; i++) {
    let subContainer = rollbackTilesetsContainer.get(i);
    if (subContainer.length > 0) {
      let tileset = subContainer.get(0);
      tileset.style.geometryWidth = lineWidth;
    }
  }
}

export function setRollbackTilesetVisible(name: string, visible: boolean) {
  if (!rollbackContainerMap.has(name)) return;
  rollbackContainerMap.get(name).show = visible;
}

export function removeAllRollbackTilesets() {
  rollbackTilesetsContainer.removeAll();
  rollbackContainerMap.clear();
}

export async function reCreateRollbackTilesets(items: {name: string; key: string}[]) {
  removeAllRollbackTilesets();

  for (let item of items) {
    let subContainer = new PrimitiveCollection();
    subContainer.show = false;
    rollbackTilesetsContainer.add(subContainer);
    rollbackContainerMap.set(item.name, subContainer);
    let tileset = await createRollbackTileSet(item.key, '#409EEF');
    subContainer.add(tileset);
  }
}
