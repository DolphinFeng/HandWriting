import { ElMessage } from "element-plus";
import { convertToLatLng } from "./commons";
import { Cartesian3 } from "cesium";
import { AddPointCommand, CommandHistory, MakePolygonCommand, MovePointCommand, RemovePointCommand } from "./commands";
import { MapController } from "./MapController";
import useClipboard from 'vue-clipboard3'

//toolbars
export class ToolbarController {
  constructor(private commandHistory: CommandHistory, private mapCtrl: MapController) {}
  
  render() {
    this.mapCtrl.render();
  }

  undo() {
    this.commandHistory.undo();
    this.render();
  }

  redo() {
    this.commandHistory.redo();
    this.render();
  }

  toCenter(locationPoint) {
    const center = convertToLatLng(locationPoint);
    if (!center) {
      ElMessage.error({
        message: '中心经纬度格式错误',
      });
      return;
    }
    this.mapCtrl.toCenter(Cartesian3.fromDegrees(center.lng, center.lat, 500.0));
    this.render();
  }
  
  deletePoint() {
    if (this.mapCtrl.selectedEntity) { //如果有选择的点，则删除并重置线和多边形
      this.commandHistory.executeCommand(new RemovePointCommand(this.mapCtrl, this.mapCtrl.selectedEntity));
    } else {  //没有选择则删除最后一个点并重置
      this.commandHistory.executeCommand(new RemovePointCommand(this.mapCtrl, null));
    }
    this.render();
  }

  copyWKTString() {
    const { toClipboard } = useClipboard();
    toClipboard(this.mapCtrl.getCurWkt())
      .then(() => {
        ElMessage.success({
          message: "成功复制WKT字符串",
          showClose: true,
        });
      }).catch((err) => {
        ElMessage.success({
          message: "成功失败",
          showClose: true,
        });
      });
  }

  unselected() {
    if (this.mapCtrl.selectedEntity) { //放弃选择
      this.mapCtrl.selectedEntity = null;
      this.mapCtrl.resetPointsStyle();
      this.render();
    }
  }
  
  makePolygon() {
    if (this.mapCtrl.hasAimPolygon()) {
      return;
    }
    this.commandHistory.executeCommand(new MakePolygonCommand(this.mapCtrl));
    this.render();
  }
  addPoint(cartesian: Cartesian3) {
    this.commandHistory.executeCommand(new AddPointCommand(this.mapCtrl, cartesian));
    this.render();
  }
  movePoint(cartesian: Cartesian3) {
    this.commandHistory.executeCommand(new MovePointCommand(this.mapCtrl, this.mapCtrl?.mouseHoldEntity, this.mapCtrl?.moveBeforeCartesian, cartesian));
    this.render();
  }
}