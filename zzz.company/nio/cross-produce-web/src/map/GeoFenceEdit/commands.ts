import { Cartesian3, Color, Entity, PolylineGraphics } from "cesium";
import _ from "lodash";
import { EditAimType, MapController } from "./MapController";

interface PointFeature {
  id: string;
  cartesian: Cartesian3 | null;
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
  private lastPointIdBeforeSelectedInsert: string = '';
  private selectedEntityId: string = '';
  constructor(private mapCtrl: MapController, cartesian: Cartesian3) {
    console.log('AddPointCommand constructor - 开始');
    console.log('mapCtrl:', mapCtrl);
    console.log('当前选中实体:', mapCtrl?.selectedEntity);
    console.log('当前点数量:', mapCtrl?.getPoints()?.length);

    // 安全检查
    if (!mapCtrl) {
      console.error('MapController 为空');
      throw new Error('MapController cannot be null');
    }

    // 初始化默认值
    this.lastPointIdBeforeSelectedInsert = '';
    this.selectedEntityId = '';
    
    // 检查是否有选中的实体
    if (mapCtrl.selectedEntity && mapCtrl.getPoints().length > 0) {
      console.log('有选中的实体，准备处理选中点后的插入');
      const lastPoint = _.last(mapCtrl.getPoints()) as Entity;
      if (lastPoint) {
        this.lastPointIdBeforeSelectedInsert = lastPoint.id;
        this.selectedEntityId = mapCtrl.selectedEntity.id;
        console.log('记录最后一个点ID:', this.lastPointIdBeforeSelectedInsert);
        console.log('记录选中实体ID:', this.selectedEntityId);
      }
    }
    
    this.pointFeature = {
      id: '',
      cartesian,
      pointIds: mapCtrl.getPointsIds()
    };
    this.curEditType = mapCtrl.getCurEditAim();
    
    console.log('AddPointCommand constructor - 结束');
  }
  execute() {
    console.log('AddPointCommand execute - 开始');
    const tmpEditType = this.mapCtrl.getCurEditAim();
    this.mapCtrl.setCurEditAim(this.curEditType);

    try {
      if (this.mapCtrl.selectedEntity && this.pointFeature.cartesian) {
        console.log('执行选中点后的插入操作');
        this.mapCtrl.movePointToLast(this.mapCtrl.selectedEntity.id);
        this.mapCtrl.selectedEntity = null;
        this.mapCtrl.addPointToList(this.pointFeature.cartesian, this.pointFeature.id);
        this.mapCtrl.resetLinesByPoints();
        this.optDesc = '在选择的点之后创建点';
      } else {
        console.log('执行普通点插入操作');
        if (this.pointFeature.cartesian) {
          this.mapCtrl.addPointWithLine(this.pointFeature.cartesian, this.pointFeature.id);
        }
        this.optDesc = '创建点';
      }

      const newPoint = _.last(this.mapCtrl.getPoints()) as Entity;
      if (newPoint) {
        this.pointFeature.id = newPoint.id;
        console.log('新点ID:', this.pointFeature.id);
      } else {
        console.error('添加新点失败');
      }
    } catch (error) {
      console.error('Execute 执行出错:', error);
    }

    this.mapCtrl.setCurEditAim(tmpEditType);
    console.log('AddPointCommand execute - 结束');
  }
  undo() {
    const tmpEditType = this.mapCtrl.getCurEditAim();
    this.mapCtrl.setCurEditAim(this.curEditType);

    const pointId = this.pointFeature.id;
    const point = this.mapCtrl.getPoints().find(point => point.id === pointId);
    this.mapCtrl.removeUserAddPoint(point);

    if (this.lastPointIdBeforeSelectedInsert != '') {
      const selectId = this.selectedEntityId;
      this.mapCtrl.selectedEntity = this.mapCtrl.getPoints().find(point => point.id === selectId) || null;
      this.mapCtrl.movePointToLast(this.lastPointIdBeforeSelectedInsert);
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
  private hadAimPoloygon: boolean = false;
  constructor(private mapCtrl: MapController, point: Entity | null) {
    if (!point) {
      point = this.mapCtrl.findLast() || null;
    }
    this.pointFeature = this.mapCtrl.getPointFeature(point) as PointFeature;
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
    if (this.pointFeature.cartesian) {
      this.mapCtrl.addPointInsertList(this.pointFeature.cartesian, index, pointId);
    }
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
  constructor(private mapCtrl: MapController, point: Entity, private beforCartesian: Cartesian3, private afterCartesian: Cartesian3) {
    this.pointFeature = this.mapCtrl.getPointFeature(point) as PointFeature;
    this.curEditType = this.mapCtrl.getCurEditAim();
  }
  
  execute() {
    const tmpEditType = this.mapCtrl.getCurEditAim();
    this.mapCtrl.setCurEditAim(this.curEditType);

    const point = this.mapCtrl.findPoint(this.pointFeature.id);
    if (point) {
      this.mapCtrl.movePoint(point, this.afterCartesian);
    }
    this.mapCtrl.setCurEditAim(tmpEditType);
  }
  undo() {
    const tmpEditType = this.mapCtrl.getCurEditAim();
    this.mapCtrl.setCurEditAim(this.curEditType);

    const point = this.mapCtrl.findPoint(this.pointFeature.id);
    if (point) {
      this.mapCtrl.movePoint(point, this.beforCartesian);
    }

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
  constructor(private mapCtrl: MapController) {
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

  handleRunCommand: ((optType: OperateType) => void) | undefined;

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
