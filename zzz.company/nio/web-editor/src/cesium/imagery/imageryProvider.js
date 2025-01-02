//百度矢量地图
import BaiduImageryProvider from "./imageryProviderSource/imagery/baidu/BaiduImageryProvider";
import TencentImageryProvider from "./imageryProviderSource/imagery/tencent/TencentImageryProvider";
import {UrlTemplateImageryProvider} from "cesium";
import {ref} from "vue";
import {createViewer} from "../initMap.js";

let options = {
    style: 'normal', // style: img、vec、normal、dark
    crs: 'WGS84', // 使用84坐标系，默认为：BD09
    minimumLevel: 3,
    maximumLevel: 18,
}

const baiduImageryProvider = new BaiduImageryProvider(options);
//腾讯矢量地图
const tencentImageryProvider = new TencentImageryProvider(options);
//高德地图
const gdImageryProvider = new UrlTemplateImageryProvider({
    url: `${window.api.apiMapGDImageryProvider}?style=6&x={x}&y={y}&z={z}`,
    minimumLevel: 3,
    maximumLevel: 18,
});
//高德矢量地图
const gdImageryProviderWMTS = new UrlTemplateImageryProvider({
    url: `${window.api.apiMapGDWMTSImageryProvider}?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}`,
    minimumLevel: 3,
    maximumLevel: 18,
});
const hereImageryProvider = new UrlTemplateImageryProvider({
    url: `https://vector.hereapi.com/v2/vectortiles/base/mc/{z}/{y}/{x}/omv?xnlp=CL_JSMv3.1.35.3&apikey=7ucx1TMj0HFDivHD850KDm83I4kXXWkBOeNuOGIMcJs&mv=in334jp128`,
    minimumLevel: 3,
    maximumLevel: 18,
})

export const imageryProvider = {
    '百度地图': baiduImageryProvider,
    '高德影像': gdImageryProvider,
    '高德地图': gdImageryProviderWMTS,
    '腾讯地图': tencentImageryProvider,
    'HERE': hereImageryProvider,
};
