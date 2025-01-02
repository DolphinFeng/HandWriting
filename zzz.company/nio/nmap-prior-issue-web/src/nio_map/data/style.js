import { Base } from '../core/base';
import { legends, stateLegends, versionLegends } from './legendData';
import { TileState } from './tile';

export class TileStyle extends Base {
  getStyle(tile) {
    if (tile.state === TileState.loaded) {
      const tileTaskState = tile.data.status || 0;
      return legends.find(item => item.value === tileTaskState);
    }
  }

  getStateStyle(tile) {
    if (tile.state === TileState.loaded) {
      const tileTaskState = tile.data.tile_state || 0;
      // return tileTaskState ? stateLegends[tileTaskState] : '';
      return stateLegends[tileTaskState];
    }
  }
}

export function getDomId(id) {
  return `S${id}`;
}
