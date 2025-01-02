import { popup } from 'leaflet';
import { Base } from '../core/base';

function getContent(tile) {
  let tile_id; let platform; let city; let taskId;
  if (tile.data) {
    const tileData = tile.data;
    tile_id = tileData.tileId;
    taskId = tileData.taskId;
    platform = tileData.plateForm;
    city = tileData.city;
  }
  return `
      <div class = 'tile-detail'>
        <div class='tile-title'>tile详情</div>
        <div class='tile-item'>
          <div class='tile-label'>tile_id：</div>
          <div class='tile-value'>${tile_id}</div>
        </div>
        <div class='tile-item'>
          <div class='tile-label'>当前城市：</div>
          <div class='tile-value'>${city}</div>
        </div>
        <div class='tile-item'>
          <div class='tile-label'>当前任务：</div>
          <div class='tile-value'>${taskId}</div>
        </div>
        <div class='tile-item'>
          <div class='tile-label'>当前平台：</div>
          <div class='tile-value'>${platform}</div>
        </div>
      </div>
    `;
}
export class PopUpFactory extends Base {
  constructor(context) {
    super(context);
    this.selectedTile = null;
    this.popInstance = null;
  }
  showup(tile) {
    const center = tile.getCenter();
    this.popInstance = new popup({
      closeButton: false,
      closeOnClick: true,
    });
    this.popInstance
      .setLatLng(center)
      .setContent(getContent(tile));
    this.selectedTile = tile;
    setTimeout(() => { // hard code 在显示同一个pop的时候，map会先触发一次close
      this.popInstance.openOn(this.context.lmap);
      this.context.lmap.once('popupclose', () => {
        this.context.dataManager.setSelectId(null);
      });
    }, 100);
  }

  close() {
    if (this.popInstance) {
      this.context.lmap.closePopup();
      this.popInstance = null;
    }
  }
}
