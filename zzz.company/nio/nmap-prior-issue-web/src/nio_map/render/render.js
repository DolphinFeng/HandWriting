import { SvgLayer } from './svgLayer';
import { RegionLayer } from './regionLayer';
import { Base } from '../core/base';
export class Render extends Base {
  constructor(context, mapState) {
    super(context);
    this.lmap = context.lmap;
    this.regionLayer = new RegionLayer(context);
    this.svgLayer = new SvgLayer(context, mapState);
    this.svgLayer.addTo(this.lmap);
  }

  updateSelectTiles(selectId, isSelected) {
    this.svgLayer.updateSelectTiles(selectId, isSelected);
  }

  setSelectId(selectId) {
    this.svgLayer.setSelectId(selectId);
  }

  setVersion1Tiles(tiles, isSelected) {
    this.svgLayer.setVersion1Tiles(tiles, isSelected);
  }

  setVersion2Tiles(tiles, isSelected) {
    this.svgLayer.setVersion2Tiles(tiles, isSelected);
  }

  renderTiles(tiles) {
    const canShowTiles = [];
    const canShowStateTiles = [];
    tiles.forEach((tile) => {
      if (this.context.dataManager.canShow(tile)) {
        if (this.context.dataManager.stateCanShow(tile)) {
          canShowStateTiles.push(tile);
        }
        return canShowTiles.push(tile);
      }
    });
    this.svgLayer.renderTiles(canShowTiles, canShowStateTiles);
  }
}
