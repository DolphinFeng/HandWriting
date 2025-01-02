import {Cesium3DTileStyle, PrimitiveCollection} from "cesium";
import {CustomTileLayer} from "./tileLayer/CustomTileLayer.js";

const baseMapURL = window.api.baseMap

const serviceTileData = {
    name: '',
    collection: new PrimitiveCollection(),
};

export function loadServiceTile(name) {
    const tileStyle = new Cesium3DTileStyle({
        color: `color("#fbbd17")`,
    });
    const tileLayer = new CustomTileLayer(name, tileStyle);
    tileLayer.load3DTile(baseMapURL + '/customLayers/20221202-hd-dst', '#fbbd1a').then(() => {

    });
}
