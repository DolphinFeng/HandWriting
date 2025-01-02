import { Cartesian3, Color, Entity, PolylineGraphics } from "cesium";
import _ from "lodash";
import { EditAimType } from "./MapController";

interface PointFeature {
  id: string;
  cartesian: Cartesian3;
  pointIds: string[];
}

// Command interface
interface ICommand {
  execute(): void;
  undo(): void;
  getOptDesc(): string;
}

//创建点
//如果选择一个点后再增加点，则旋转点次序，将选择的点为最后点，再在后面放置点
export class AddPointCommand implements ICommand {
  optDesc: string = '创建点';
  private curEditType : EditAimType = EditAimType.NoAim;
  private pointFeature: PointFeature;
  private lastPointIdBeforeSelectedInsert: string;
  private selectedEntityId: string;
  constructor(private mapCtrl, cartesian: Cartesian3) {
    if (this.mapCtrl.selectedEntity && this.mapCtrl.getPoints().length > 0) {
      //保存为撤销提供的特征数据
      const lastPoint = _.last(this.mapCtrl.getPoints()) as Entity;
      this.lastPointIdBeforeSelectedInsert = lastPoint.id;
      this.selectedEntityId = this.mapCtrl.selectedEntity.id;
    };
    this.pointFeature = {
      id: '',
      cartesian,
      pointIds: this.mapCtrl.getPointsIds()
    };
    this.curEditType = this.mapCtrl.getCurEditAim();
  }
  execute() {
    const tmpEditType = this.mapCtrl.getCurEditAim();
    this.mapCtrl.setCurEditAim(this.curEditType);

    if (this.mapCtrl.selectedEntity) {
      //以选择的点作为最后一点
      this.mapCtrl.movePointToLast(this.mapCtrl.selectedEntity.id);
      this.mapCtrl.selectedEntity = null;
      //创建点
      this.mapCtrl.addPointToList(this.pointFeature.cartesian, this.pointFeature.id);
      this.mapCtrl.resetLinesByPoints(); //要重置线的次序，以防一点三线等问题

      this.optDesc = '在选择的点之后创建点';
    } else {  //正常放置点
      this.mapCtrl.addPointWithLine(this.pointFeature.cartesian, this.pointFeature.id);
      this.optDesc = '创建点';
    }
    //记录添加点的id，以便撤销
    const newPoint = _.last(this.mapCtrl.getPoints()) as Entity;
    this.pointFeature.id = newPoint.id;

    this.mapCtrl.setCurEditAim(tmpEditType);
  }
  undo() {
    const tmpEditType = this.mapCtrl.getCurEditAim();
    this.mapCtrl.setCurEditAim(this.curEditType);

    //删除新增的点
    const pointId = this.pointFeature.id;
    const point = this.mapCtrl.getPoints().find(point => point.id === pointId);
    this.mapCtrl.removeUserAddPoint(point);

    //如果之前有选择重置序列操作，则恢复选择和序列关系
    if (this.lastPointIdBeforeSelectedInsert != '') {
      //恢复选择的点
      const selectId = this.selectedEntityId;
      this.mapCtrl.selectedEntity = this.mapCtrl.getPoints().find(point => point.id === selectId);
      //恢复点序列
      this.mapCtrl.movePointToLast(this.lastPointIdBeforeSelectedInsert);
      //重置线关系和点样式
      this.mapCtrl.resetLinesByPoints();
    }
    this.mapCtrl.setCurEditAim(tmpEditType);
  }
  getOptDesc() {
    return this.optDesc;
  }
}

//删除点
export class RemovePointCommand implements ICommand {
  optDesc: string = '删除点';
  private curEditType : EditAimType = EditAimType.NoAim;
  private pointFeature: PointFeature;
  private hadAimPoloygon: boolean;
  constructor(private mapCtrl, point: Entity | null) {
    if (!point) {
      point = this.mapCtrl.findLast();
    }
    this.pointFeature = this.mapCtrl.getPointFeature(point);
    if (this.mapCtrl.hasAimPolygonWhenItEditing()) {
      this.hadAimPoloygon = true;
    }
    this.curEditType = this.mapCtrl.getCurEditAim();
  }
  
  execute() {
    const tmpEditType = this.mapCtrl.getCurEditAim();
    this.mapCtrl.setCurEditAim(this.curEditType);
    
    const point = this.mapCtrl.findPoint(this.pointFeature.id);
    this.mapCtrl.removeUserAddPoint(point);

    this.mapCtrl.setCurEditAim(tmpEditType);
  }
  undo() {
    const tmpEditType = this.mapCtrl.getCurEditAim();
    this.mapCtrl.setCurEditAim(this.curEditType);

    //找出删除前的位置
    const pointId = this.pointFeature.id;
    const index = this.pointFeature.pointIds.findIndex(id => id === pointId);
    this.mapCtrl.addPointInsertList(this.pointFeature.cartesian, index, pointId);
    if (this.hadAimPoloygon) {
      this.mapCtrl.pointsToPolygon();
    }

    this.mapCtrl.setCurEditAim(tmpEditType);
  }
  getOptDesc() {
    return this.optDesc;
  }
}

//移动点
//在完全移动后执行
export class MovePointCommand implements ICommand {
  optDesc: string = '移动点';
  private curEditType : EditAimType = EditAimType.NoAim;
  private pointFeature: PointFeature;
  constructor(private mapCtrl, point: Entity, private beforCartesian: Cartesian3, private afterCartesian: Cartesian3) {
    this.pointFeature = this.mapCtrl.getPointFeature(point);
    this.curEditType = this.mapCtrl.getCurEditAim();
  }
  
  execute() {
    const tmpEditType = this.mapCtrl.getCurEditAim();
    this.mapCtrl.setCurEditAim(this.curEditType);

    const point = this.mapCtrl.findPoint(this.pointFeature.id);
    this.mapCtrl.movePoint(point, this.afterCartesian);

    this.mapCtrl.setCurEditAim(tmpEditType);
  }
  undo() {
    const tmpEditType = this.mapCtrl.getCurEditAim();
    this.mapCtrl.setCurEditAim(this.curEditType);

    const point = this.mapCtrl.findPoint(this.pointFeature.id);
    this.mapCtrl.movePoint(point, this.beforCartesian);

    this.mapCtrl.setCurEditAim(tmpEditType);
  }
  getOptDesc() {
    return this.optDesc;
  }
}

//创建多边形
export class MakePolygonCommand implements ICommand {
  optDesc: string = '创建多边形';
  private curEditType : EditAimType = EditAimType.NoAim;
  constructor(private mapCtrl) {
    this.curEditType = this.mapCtrl.getCurEditAim();
  }

  execute() {
    const tmpEditType = this.mapCtrl.getCurEditAim();
    this.mapCtrl.setCurEditAim(this.curEditType);

    this.mapCtrl.pointsToPolygon();
    
    this.mapCtrl.setCurEditAim(tmpEditType);
  }
  undo() {
    const tmpEditType = this.mapCtrl.getCurEditAim();
    this.mapCtrl.setCurEditAim(this.curEditType);

    this.mapCtrl.polygonUndoPoints();

    this.mapCtrl.setCurEditAim(tmpEditType);
  }
  getOptDesc() {
    return this.optDesc;
  }
}

export enum OperateType {
  EXEC = '执行新命令',
  UNDO = '撤销',
  REDO = '恢复'
}

export class CommandHistory {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];

  handleRunCommand: (optType: OperateType) => void | undefined;

  executeCommand(command: ICommand) {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
    if (this.handleRunCommand) {
      this.handleRunCommand(OperateType.EXEC);
    }
  }

  undo() {
    const command = this.undoStack.pop();
    if (command) {
        command.undo();
        this.redoStack.push(command);
        if (this.handleRunCommand) {
          this.handleRunCommand(OperateType.UNDO);
        }
    }
  }

  redo() {
    const command = this.redoStack.pop();
    if (command) {
        command.execute();
        this.undoStack.push(command);
        if (this.handleRunCommand) {
          this.handleRunCommand(OperateType.REDO);
        }
    }
  }

  getUndoStackDescs() {
    return this.undoStack.map((command) => command.getOptDesc());
  }
  getRedoStackDescs() {
    return this.redoStack.map((command) => command.getOptDesc());
  }

  addCommandRunEvent(handler: (optType: OperateType) => void) {
    this.handleRunCommand = handler;
  }
  removeCommandRunEvent() {
    this.handleRunCommand = undefined;
  }
}
