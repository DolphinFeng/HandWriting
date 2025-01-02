import { Color, Cartographic, HeightReference, PolylineGraphics, PolygonGraphics, Cartesian3, Cartesian2, Math as CMath, Entity, Viewer, ConstantProperty, JulianDate, PointGraphics, ConstantPositionProperty, PolygonHierarchy, Ellipsoid, NearFarScalar, LabelStyle } from "cesium";
import * as WKT from "terraformer-wkt-parser";
import * as Terraformer from "terraformer";
import { convertToLatLng, parseWKTToGeo } from "./commons";
import _ from "lodash";

//操作配置
type UserOptions = {
  bCanChoosePoint: Boolean; //关闭则可以相同或近点重复放置点
}

type Point = {
  x: number;
  y: number;
}

export enum EditAimType {
  NoAim = '',
  Polygon = 'polygon',
  PathLine = 'pathline'
}
export interface RelaGeofence {
  id: string | number;
  name: string;
  pointString: string;
  wktString: string;
}

export interface RelaGeofenceStore {
  id: string | number;
  name: string;
  point: Entity | null;
  polygon: Entity | null;
}

export type PolygonCollect = {
  points: Entity[];
  lines: Entity[];
  polygon: Entity | null | undefined;
}

export type PathLineCollect = {
  points: Entity[];
  lines: Entity[] | undefined;
};

export class MapController {
  curEditAim: EditAimType = EditAimType.NoAim; //当前编辑目标
  mouseHoldEntity: any = null;  //用于跟踪鼠标拖动选中的点
  moveBeforeCartesian: Cartesian3 | null = null;  //鼠标移动前的位置
  selectedEntity: any = null; //用于跟踪点击选中的点
  aimPolygon: PolygonCollect = {
    points: [],
    lines: [],
    polygon: undefined
  }; //目标多边形
  aimPathLine: PathLineCollect = {
    points: [],
    lines: []
  }; //目标路径线
  mouseInPoint: Boolean = false;  //鼠标在某个点内
  userOptions: UserOptions = {
    bCanChoosePoint: true
  };

  changeAimPolygon: undefined | ((polygon: Entity | undefined) => void); //多边形变化事件
  changeAimPathLine: undefined | ((pathline: Entity[] | undefined) => void); //路径线变化事件
  changePoints: Function | undefined; //点变化事件

  constructor(private viewer: Viewer | null) {}

  render() {
    this.viewer?.scene.requestRender();
  }
  toCenter(initCenter: Cartesian3) {
    this.viewer?.camera.setView({
        destination: initCenter,
        orientation: {
            heading: CMath.toRadians(0),  // 朝北
            pitch: CMath.toRadians(-90),  // 直接向下看
            roll: 0.0
        }
    });
  }
  //设置当前编辑目标
  setCurEditAim(editAim: EditAimType) {
    if (this.curEditAim !== editAim) {
      this.hideNoEditPoints(this.curEditAim);
      this.curEditAim = editAim;
      this.resetPointsStyle();
    }
  }
  getCurEditAim() {
    return this.curEditAim;
  }

  //绘制站心
  drawCenterPoint(initCenter: Cartesian3) {
    return this.viewer?.entities.add({
      position : initCenter,
      point : {
          pixelSize : 7,
          color : Color.YELLOW,
          outlineColor : Color.RED,
          outlineWidth : 4,
      },
      label: {
        text: '站心',
        font: '18px Helvetica',
        fillColor: Color.WHITE,
        outlineColor: Color.BLACK,
        outlineWidth: 2,
        style: LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cartesian2(0, 24) // 偏移
      }
    });
  }
  //绘制相关站心
  drawRelaCenterPoint(name: string, center: Cartesian3) {
    return this.viewer?.entities.add({
      position : center,
        point : {
          pixelSize : 6,
          color : Color.LIGHTYELLOW,
          outlineColor : Color.DARKRED,
          outlineWidth : 3,
      },
      label: {
        text: name,
        font: '12px Helvetica',
        fillColor: Color.WHITESMOKE,
        outlineColor: Color.BLACK,
        outlineWidth: 2,
        style: LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cartesian2(0, 18)
      }
    });
  }
  //选择地球表面的位置的，即地形。它不会选择3D模型或其他非地形的对象。
  getPick(position: any) {
    const ray = this.viewer?.camera.getPickRay(position);
    if (!ray) {
      return undefined;
    }
    return this.viewer.scene.globe.pick(ray, this.viewer.scene);
  }
  //添加事件
  addChangeAimPolygonEvent(changeAimPolygon) {
    this.changeAimPolygon = changeAimPolygon;
  }
  //添加事件
  addChangeAimPathLineEvent(changeAimPathLine) {
    this.changeAimPathLine = changeAimPathLine;
  }
  addChangePointsEvent(changePoints) {
    this.changePoints = changePoints;
  }

  //根据当前编辑目标获取点数组
  getPoints() : Entity[] {
    return this.getPointsByEditType(this.getCurEditAim());
  }
  getPointsByEditType(editType: EditAimType) {
    if (editType === EditAimType.Polygon) {
      return this.aimPolygon.points;
    } else if (editType === EditAimType.PathLine) {
      return this.aimPathLine.points;
    }
    return [];
  }
  setPoints(points: Entity[]) : void {
    if (this.getCurEditAim() === EditAimType.Polygon) {
      this.aimPolygon.points = points;
    } else if (this.getCurEditAim() === EditAimType.PathLine) {
      this.aimPathLine.points = points;
    }
  }
  //根据当前编辑目标获取线数组
  getLines() : Entity[] {
    if (this.getCurEditAim() === EditAimType.Polygon) {
      return this.aimPolygon.lines;
    } else if (this.getCurEditAim() === EditAimType.PathLine) {
      return this.aimPathLine.lines;
    }
    return [];
  }
  setLines(lines: Entity[]) : void {
    if (this.getCurEditAim() === EditAimType.Polygon) {
      this.aimPolygon.lines = lines;
    } else if (this.getCurEditAim() === EditAimType.PathLine) {
      this.aimPathLine.lines = lines;
    }
  }
  //获取一个压缩的序列
  getPointsIds() : string[] {
    return this.getPoints().map((point) => point.id);
  }
  //点提取位置
  getPositionByPoint(point: Entity | null) : Cartesian3 {
    if (!point) {
      return;
    }
    return point.position.getValue(JulianDate.now());
  }
  //点数组提取坐标数组
  getPositionsByPoints(points: Entity[]) : Cartesian3[] {
    return points.map((point: Entity) => this.getPositionByPoint(point));
  }
  //获取点的特征，服务于撤销操作
  getPointFeature(point: Entity | undefined | null) {
    if (!point) {
      return {
        id: '',
        cartesian: null,
        points: this.getPointsIds()
      }
    }
    return {
      id: point.id,
      cartesian: this.getPositionByPoint(point),
      pointIds: this.getPointsIds()
    };
  }
  //查找点
  findPoint(pointId: string) : Entity {
    return this.getPoints().find((point) => point.id === pointId);
  }
  //返回最后一个点
  findLast() {
    return _.last(this.getPoints());
  }
  //所有点序列操作
  optPoints(optType: string, point: Entity | null = null, index: number = -1) {
    let points : Entity[] = this.getPoints();

    if (optType === 'push' && point !== null) {
      points.push(point);
    } else if (optType === 'insert' && point !== null) {
      if (index < 0) {
        points.push(point);
      } else if (index >= 0) {
        points.splice(index, 0, point);
      }
    } else if (optType === 'delete') {
      if (index >= 0) {
        points.splice(index, 1);
      } else {
        points.pop();
      }      
    } else if (optType === 'rotate' && index >= 0) {
      let ends = points.splice(index + 1);
      points = ends.concat(points);
    }

    this.setPoints(points);

    this.syncLinesAfterOptPoints(optType, index);

    if (this.changePoints) {
      this.changePoints(optType);
    }
  }
  //线跟随点变换
  syncLinesAfterOptPoints(optType: string, index: number) {
    let points: Entity[] = this.getPoints();
    let lines: Entity[] = this.getLines();
  
    switch (optType) {
      case 'push':
        if (this.hasAimPolygonWhenItEditing() && lines.length === points.length - 1) {
          this.removeEntity(lines[lines.length - 1]);
          lines[lines.length - 1] = this.addLine(points[points.length - 2], points[points.length - 1]);
          lines.push(this.addLine(points[points.length - 1], points[0]));
        } else if (points.length > 1) {
          lines.push(this.addLine(points[points.length - 2], points[points.length - 1]));
        }
        break;
  
      case 'insert':
        if (index === 0) {
          lines.unshift(this.addLine(points[0], points[1]));
  
          if (this.hasAimPolygonWhenItEditing() && points.length > 1) {
            this.removeEntity(lines[lines.length - 1]);
            lines[lines.length - 1] = this.addLine(points[points.length - 1], points[0]);
          }
        } else if (index === points.length - 1) {
          if (this.hasAimPolygonWhenItEditing()) {
            this.removeEntity(lines[lines.length - 1]);
            lines[lines.length - 1] = this.addLine(points[index - 1], points[index]);
            lines.push(this.addLine(points[index], points[0]));
          } else {
            lines.push(this.addLine(points[index - 1], points[index]));
          }
        } else {
          this.removeEntity(lines[index - 1]);
          lines.splice(index - 1, 1, this.addLine(points[index - 1], points[index]), this.addLine(points[index], points[index + 1]));
          // lines.splice(index, 0);
        }
        break;
  
      case 'delete':
        if (index === 0) {
          this.removeEntity(lines[0]);
          lines.shift();
  
          if (this.hasAimPolygonWhenItEditing() && points.length > 1) {
            this.removeEntity(_.last(lines));
            lines.push(this.addLine(_.last(points), points[0]));
          }
        } else if (index === points.length) {
          this.removeEntity(lines[lines.length - 1]);
          lines.pop();
  
          if (this.hasAimPolygonWhenItEditing() && points.length > 1) {
            this.removeEntity(lines[lines.length - 1]);
            lines[lines.length - 1] = this.addLine(points[points.length - 1], points[0]);
          }
        } else {
          this.removeEntity(lines[index - 1]);
          this.removeEntity(lines[index]);
          lines.splice(index - 1, 2, this.addLine(points[index - 1], points[index]));
        }
        break;
  
      case 'rotate':
        let movedLines = lines.splice(0, index);
        lines.push(...movedLines);
  
        if (!this.hasAimPolygonWhenItEditing()) {
          if (points.length > 1) {
            this.removeEntity(lines[lines.length - 1]);
            var orgLast = (points.length - 1 + index) % (points.length - 1);
            var orgFirst = (index) % (points.length - 1);
            lines[lines.length - 1] = this.addLine(points[orgLast], points[orgFirst]);
          }
        }
        break;
    }
  
    this.setLines(lines);

    if (this.getCurEditAim() === EditAimType.PathLine) {
      if (this.changeAimPathLine) {
        this.changeAimPathLine(this.aimPathLine.lines);
      }
    }
  }
  
  //画点
  addPointEntity(position: Cartesian3, toId: string = '') : Entity | undefined {
    if (toId !== '') {
      const hadPoint = this.viewer?.entities.getById(toId);
      if (hadPoint) {
        return hadPoint;
      }
    }
    //添加一个点的实体
    return this.viewer?.entities.add({
      id: toId === '' ? undefined : toId,
      position: position,
      point: this.getPointStyle('Create')
    });
  }
  //画点并记录
  addPointToList(position: Cartesian3, toId: string = '') {
    const point: Entity = this.addPointEntity(position, toId);
    if (!point) {
      return;
    }
    this.optPoints('push', point);
    this.resetPointsStyle();
  }
  //返回每个点不同的样式
  getPointStyle(name: string): PointGraphics{
    if (name === 'Create') {  //此点为刚创建，或最后一个点，下次放置的点放到此处
      return new PointGraphics({
        color: Color.ORANGE,
        pixelSize: 7,
        outlineWidth: 5,
        outlineColor: Color.BLACK,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        heightReference: HeightReference.CLAMP_TO_GROUND
      });
    } else if (name === 'Hover') {  //鼠标放上去的样式
      return new PointGraphics({
        color: Color.ORANGE,
        pixelSize: 7,
        outlineWidth: 4,
        outlineColor: Color.BLUE,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        heightReference: HeightReference.CLAMP_TO_GROUND
      });
    } else if (name === 'Selected') { //点被选择的样式
      return new PointGraphics({
        color: Color.BLACK,
        pixelSize: 7,
        outlineWidth: 4,
        outlineColor: Color.ORANGE,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        heightReference: HeightReference.CLAMP_TO_GROUND
      });
    } else if (name === 'NotActive') { //点被选择的样式
      return new PointGraphics({
        color: Color.RED,
        pixelSize: 4,
        outlineWidth: 2,
        outlineColor: Color.ORANGERED
      });
    }
    return new PointGraphics({  //其他正常点的样式
      color: Color.ORANGE,
      pixelSize: 7,
      outlineWidth: 4,
      outlineColor: Color.SLATEGREY,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      heightReference: HeightReference.CLAMP_TO_GROUND
    });
  }
  //最后一个点固定特效，除非有鼠标特效
  resetPointsStyle(point: Entity | null = null, styleName: string = '') {
    let points : Entity[] = this.getPoints();
    if (points.length == 0) {
      return;
    }
    points.map((entity: Entity) => {
      if (!entity.point) {
        return;
      }
      if (point == entity) {  //如果是指定的点，就优先设置指定点的样式
        entity.point = this.getPointStyle(styleName); 
        return;
      }
      if (entity == this.selectedEntity) { //如果没有指定点，则有被选择的点优先设置为被选择样式
        entity.point = this.getPointStyle('Selected'); 
        return;
      }
      entity.point = this.getPointStyle('Normal'); //其他点都设置为常规样式
    });
    //处理最后一个点的样式
    const lastPoint = _.last(points);
    if (lastPoint == point || lastPoint == this.selectedEntity) {  //如果最后一个点被选择，则不处理，优先设置为选择样式
      return;
    }
    lastPoint.point = this.getPointStyle('Create');
  }
  hideNoEditPoints(hideEditType: EditAimType) {
    const points = this.getPointsByEditType(hideEditType);
    points.map((entity: Entity) => {
      if (!entity.point) {
        return;
      }
      entity.point = this.getPointStyle('NotActive');
    });
  }
  //删除一个用户创建的点
  removeUserAddPoint(point: Entity | null = null) {
    const points = this.getPoints();
    if (points.length === 0) {
      return;
    }
    if (point === null) {
      point = _.last(points);
    }
    const index = points.indexOf(point);
    if (index >= 0) {
      this.optPoints('delete', null, index);
    }
    if (this.hasAimPolygonWhenItEditing()) {
      this.pointsToPolygon();
    } else {
      this.resetLinesByPoints();
    }
    this.removeEntity(point);
    this.resetPointsStyle();
  } 
  //删除一个点
  removeEntity(point: Entity) {
    this.viewer?.entities.remove(point);
  }
  //在指定位置插入点
  addPointInsertList(cartesian: Cartesian3, insertAt: number, toId: string = '') {
    const point = this.addPointEntity(cartesian, toId);
    if (!point) {
      return;
    }
    if (insertAt === -1) {
      this.optPoints('push', point);
    } else {
      this.optPoints('insert', point, insertAt);
    }
    this.resetPointsStyle();
  }
  //移动点
  movePoint(point: Entity, cartesian: Cartesian3) {
    //更新选中点的位置
    point.position = new ConstantPositionProperty(cartesian);

    const points = this.getPoints();
    const index = points.findIndex((item) => item.id === point.id);
    const lines = this.getLines();
    if (index > 0) {
      const polyline = lines[index - 1].polyline;
      if (polyline) {
        polyline.positions = new ConstantProperty([this.getPositionByPoint(points[index - 1]), cartesian]);
      }
    }
    if (points.length > index + 1) {
      const polyline = lines[index].polyline;
      if (polyline) {
        polyline.positions = new ConstantProperty([cartesian, this.getPositionByPoint(points[index + 1])]);
      }
    }

    //如果有多边形，则根据点序列重绘多边形
    if (this.hasAimPolygonWhenItEditing()) {
      if (index === lines.length - 1 || index === 0) {
        const polyline = _.last(lines).polyline;
        if (polyline) {
          polyline.positions = new ConstantProperty([this.getPositionByPoint(points[0]), this.getPositionByPoint(_.last(points))]);
        }
      }
      this.pointsToPolygon(true);
    }

    this.setLines(lines);

    if (this.getCurEditAim() === EditAimType.PathLine) {
      if (this.changeAimPathLine) {
        this.changeAimPathLine(this.aimPathLine.lines);
      }
    }
  }
  //禁止/允许鼠标移动地图
  disableMapMove(isDisable = true) {
    if (this.viewer === null) {
      return;
    }
    if (isDisable) {
      // 禁止地图导航
      this.viewer.scene.screenSpaceCameraController.enableRotate = false;
      this.viewer.scene.screenSpaceCameraController.enableZoom = false;
      this.viewer.scene.screenSpaceCameraController.enableLook = false;
      this.viewer.scene.screenSpaceCameraController.enableTilt = false;
    } else {
      // 禁止地图导航
      this.viewer.scene.screenSpaceCameraController.enableRotate = true;
      this.viewer.scene.screenSpaceCameraController.enableZoom = true;
      this.viewer.scene.screenSpaceCameraController.enableLook = true;
      this.viewer.scene.screenSpaceCameraController.enableTilt = true;
    }
  }
  //将指定的点移到最后一位
  movePointToLast(pointId: string) {
    const index = this.getPoints().findIndex((point) => point.id === pointId);
    if (index <= -1) {
      return;
    }
    this.optPoints('rotate', null, index);
  }

  //添加一条线
  addLine(startPoint: Entity, endPoint: Entity, width: number = 2, material: Color = Color.DARKORANGE) : Entity | undefined {
    return this.viewer?.entities.add({
      polyline: new PolylineGraphics({
        positions: new ConstantProperty([this.getPositionByPoint(startPoint), this.getPositionByPoint(endPoint)]),
        width,
        material,
      }),
    });
  }
  //根据坐标绘制点，并将其相关的线画出来
  addPointWithLine(cartesian: Cartesian3, toId: string = '') {
    this.addPointToList(cartesian, toId);
    //正常放置点后，如果已经形成多边形，则需要重置多边形的线关系
    if (this.hasAimPolygonWhenItEditing()) {
      this.pointsToPolygon();
    }
  }
  //通过点序列重新设置连线
  resetLinesByPoints() {
    let lines = this.getLines();
    //删除所有连线
    lines.map((line: Entity) => {
      this.removeEntity(line);
    });
    lines = [];
    const points = this.getPoints();
    if (points.length <= 1) {
      this.setLines(lines);
      return;
    }
    //建立连线以及与点的关系
    let lastPoint: Entity | null = null;
    points.map((point: Entity) => {
      if (lastPoint == null) {
        lastPoint = point;
        return;
      }
      lines.push(this.addLine(lastPoint, point));
      lastPoint = point;
    });
    //如果已经形成多边形，则最后一个点与第一个点建立连线
    if (this.hasAimPolygonWhenItEditing()) {
      lines.push(this.addLine(_.last(points), points[0]));
    }
    this.setLines(lines);
  }

  setAimPolygon(polygon: Entity | undefined) {
    this.aimPolygon.polygon = polygon;
    if (this.changeAimPolygon) {
      this.changeAimPolygon(polygon);
    }
  }
  //根据当前所有的点绘制多边形
  pointsToPolygon(justRedraw: Boolean = false) {
    if (this.getCurEditAim() !== EditAimType.Polygon) {
      return;
    }
    const positions: Array<any> = [];
    this.aimPolygon.points.forEach((point: Entity) => {
      positions.push(this.getPositionByPoint(point));
    });
    if (justRedraw) {
      this.aimPolygon.polygon.polygon = new PolygonGraphics({
        hierarchy: new PolygonHierarchy(positions),
        material: Color.RED.withAlpha(0.5),
      });
      if (this.changeAimPolygon) {
        this.changeAimPolygon(this.aimPolygon.polygon);
      }
      return;
    }
    this.createAimPolygon(positions);
    this.resetLinesByPoints();
  }
  //根据当前多边形恢复到创建多边形前
  polygonUndoPoints() {
    if (!this.aimPolygon) {
      return;
    }

    this.removeEntity(this.aimPolygon.polygon);
    this.setAimPolygon(undefined);
    
    this.resetLinesByPoints();
  }
  //根据坐标点数组创建一个多边形
  addPolygon(positions: Array<any>, material: any = Color.RED.withAlpha(0.5)) : Entity | undefined {  
    if (positions.length <= 2) {
      return ;
    }
    return this.viewer?.entities.add({
      polygon: new PolygonGraphics({
        hierarchy: new PolygonHierarchy(positions),
        material,
      }),
    });
  }
  //创建目标多边形
  createAimPolygon(positions: Array<any>) {
    if (this.hasAimPolygon()) {
      this.removeEntity(this.aimPolygon.polygon);
    }
    if (positions.length <= 2) {
      this.setAimPolygon(undefined);
      return;
    }
    this.setAimPolygon(this.addPolygon(positions));
  }
  hasAimPolygon() {
    return !!this.aimPolygon.polygon;
  }
  hasAimPolygonWhenItEditing() {
    return this.getCurEditAim() === EditAimType.Polygon && this.hasAimPolygon();
  }
  //核对多边形是否符合规定
  checkPolygonVaild(polygon: Entity) {
    // if (!this.isPolygonInteriorAngleLessThan180(polygon)) {
    //   return {
    //     isSuccess: false,
    //     errMsg: '围栏内角不能大于180度'
    //   };
    // }
    if (!this.isNoPolygonSelfIntersecting(polygon)) {
      return {
        isSuccess: false,
        errMsg: '围栏绘制存在自相交的情况'
      };
    }

    return {
      isSuccess: true,
      errMsg: ''
    };
  }

  checkPathLineVaild(pathLine: Entity[]) {
    if (pathLine.length <= 0) {
      return {
        isSuccess: false,
        errMsg: '没找到匝道线段'
      };
    }
    return {
      isSuccess: true,
      errMsg: ''
    };
  }

  //将多边形转换为Point数组
  convertPolygonEntityToPoints(polygonEntity: Entity): Point[] | null {
    if (polygonEntity instanceof Entity && polygonEntity.polygon instanceof PolygonGraphics) {
      const positions = polygonEntity.polygon.hierarchy.getValue(JulianDate.now()).positions;
      const points: Point[] = [];
  
      for (const position of positions) {
        const cartesian = Cartographic.fromCartesian(position);
        const lonDeg = CMath.toDegrees(cartesian.longitude);
        const latDeg = CMath.toDegrees(cartesian.latitude);
  
        points.push({ x: lonDeg, y: latDeg });
      }
  
      return points;
    }
  
    return null;
  }
  
  //判断多边形内角是否超过180度
  // isPolygonInteriorAngleLessThan180(polygonEntity: Entity): boolean {
  //   if (!polygonEntity.polygon) {
  //     return false;
  //   }
  //   const hierarchy = polygonEntity.polygon.hierarchy.getValue(JulianDate.now());
  //   const positions = hierarchy.positions;
  
  //   if (positions.length < 3) {
  //     return false;
  //   }

  //   // 计算前三个点的叉积来估计法向量
  //   const normal = Cartesian3.cross(
  //     Cartesian3.subtract(positions[1], positions[0], new Cartesian3()),
  //     Cartesian3.subtract(positions[2], positions[1], new Cartesian3()),
  //     new Cartesian3()
  //   );
  //   for (let i = 0; i < positions.length; i++) {
  //     const p0 = positions[i];
  //     const p1 = positions[(i + 1) % positions.length];
  //     const p2 = positions[(i + 2) % positions.length];

  //     const v1 = Cartesian3.subtract(p1, p0, new Cartesian3());
  //     const v2 = Cartesian3.subtract(p2, p1, new Cartesian3());

  //     const cross = Cartesian3.cross(v1, v2, new Cartesian3());

  //     if (Cartesian3.dot(cross, normal) <= 0) {
  //       // 如果叉积与法向量的点积为负或零，则角度大于或等于180度
  //       return false;
  //     }
  //   }

  //   return true;
  // }

  // 判断两线段是否相交
  doSegmentsIntersect(p1: Point, p2: Point, q1: Point, q2: Point): boolean {
    function crossProduct(v1: Point, v2: Point): number {
      return v1.x * v2.y - v1.y * v2.x;
    }

    function subtract(p: Point, q: Point): Point {
      return { x: p.x - q.x, y: p.y - q.y };
    }

    function direction(p1: Point, p2: Point, p3: Point): number {
      return crossProduct(subtract(p3, p1), subtract(p2, p1));
    }

    function onSegment(p1: Point, p2: Point, p3: Point): boolean {
      return Math.min(p1.x, p2.x) <= p3.x && p3.x <= Math.max(p1.x, p2.x) &&
            Math.min(p1.y, p2.y) <= p3.y && p3.y <= Math.max(p1.y, p2.y);
    }

    const d1 = direction(q1, q2, p1);
    const d2 = direction(q1, q2, p2);
    const d3 = direction(p1, p2, q1);
    const d4 = direction(p1, p2, q2);

    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
      return true;
    }

    if (d1 === 0 && onSegment(q1, q2, p1)) return true;
    if (d2 === 0 && onSegment(q1, q2, p2)) return true;
    if (d3 === 0 && onSegment(p1, p2, q1)) return true;
    if (d4 === 0 && onSegment(p1, p2, q2)) return true;

    return false;
  }
  
  // 判断多边形是否存在自相交
  isNoPolygonSelfIntersecting(polygonEntity: Entity): boolean {
    if (!polygonEntity.polygon) {
      return true; //不关我事
    }
    const hierarchy = polygonEntity.polygon.hierarchy.getValue(JulianDate.now());
    const positions = hierarchy.positions;
  
    if (positions.length < 4) {
      return true; // 少于4个顶点的多边形不可能自相交
    }
  
    for (let i = 0; i < positions.length - 1; i++) {
      for (let j = i + 2; j < positions.length; j++) {
        // 确保不是相邻的边
        if (i === 0 && j === positions.length - 1) {
          continue;
        }
        if (this.doSegmentsIntersect(positions[i], positions[i + 1], positions[j], j + 1 < positions.length ? positions[j + 1] : positions[0])) {
          return false; // 发现自相交
        }
      }
    }
  
    return true; // 未发现自相交
  }

  setAimPathLine(pathLine: PathLineCollect | undefined) {
    this.aimPathLine = pathLine;
    if (this.changeAimPathLine) {
      this.changeAimPathLine(pathLine.lines);
    }
  }
  addPathLine(positions: Array<any>, material: any = Color.GREEN.withAlpha(0.9)) : PathLineCollect | undefined {  
    if (positions.length <= 0) {
      return ;
    }
    const pathLine = {
      points: [],
      lines: []
    }
    positions.map((pos: any) => {
      let point = this.addPointEntity(pos);
      if (!point) {
        return;
      }
      if (pathLine.points.length > 0) {
        pathLine.lines.push(this.addLine(_.last(pathLine.points), point, 4, material));
      }
      pathLine.points.push(point);
    });
    return pathLine;
  }
  //创建目标多边形
  createAimPathLine(positions: Array<any>) {
    if (this.aimPathLine) {
      this.aimPathLine.points.map((point: Entity) => {
        this.removeEntity(point);
      });
      this.aimPathLine.lines.map((line: Entity) => {
        this.removeEntity(line);
      });
    }
    this.setAimPathLine(this.addPathLine(positions));
  }

  //判断两个点经纬度是否重复
  areCoordinatesEqual(cartesianA, cartesianB, tolerance = CMath.EPSILON21) {
    var ellipsoid = Ellipsoid.WGS84;

    var cartographicA = ellipsoid.cartesianToCartographic(cartesianA);
    var cartographicB = ellipsoid.cartesianToCartographic(cartesianB);
    
    return CMath.equalsEpsilon(cartographicA.longitude, cartographicB.longitude, tolerance) &&
    CMath.equalsEpsilon(cartographicA.latitude, cartographicB.latitude, tolerance);
  }

  //将多边形转化为WKT字符串
  polygonToWKT(entity: Entity | undefined) {
    if (!entity) {
      return '';
    }
    if (!entity.polygon?.hierarchy) {
      return '';
    }
    const positions: Array<any> = entity.polygon.hierarchy.getValue(JulianDate.now()).positions;
    if (!positions) {
      return '';
    }
    if (!this.areCoordinatesEqual(positions[0], _.last(positions))) {
      positions.push(positions[0]);
    }

    return this.postionsToWKT(positions, "Polygon");
  }
  //将多段线转化为WKT字符串
  pathLineToWKT(pathLine: PathLineCollect | undefined) {
    if (!pathLine || pathLine.lines.length === 0) {
      return '';
    }
    return this.postionsToWKT(this.getPositionsByPoints(pathLine.points), "LineString");
  }
  //根据坐标数组和图形类型转化为wkt字符串
  postionsToWKT(positions: Array<any>, type: "Polygon" | "LineString") {
    const cartographics = positions.map((pos: Cartesian3) => Cartographic.fromCartesian(pos));
    const coords = cartographics.map((carto: Cartographic) => [
      CMath.toDegrees(carto.longitude),
      CMath.toDegrees(carto.latitude)
    ]);
    let terf = null;
    if (type === "Polygon") {
      terf = new Terraformer.Polygon({  //TODO：会不会异常
        type,
        coordinates: [coords]
      });
    } else if (type === "LineString") {
      terf = new Terraformer.LineString({
        type,
        coordinates: coords
      });
    } else {
      return "";
    }
    return WKT.convert(terf);
  }
  getAimPolygonWkt() {
    return this.polygonToWKT(this.aimPolygon.polygon);
  }
  getAimPathLineWkt() {
    return this.pathLineToWKT(this.aimPathLine);
  }
  getCurWkt() {
    if (this.curEditAim === EditAimType.Polygon) {
      return this.getAimPolygonWkt();
    } else if (this.curEditAim === EditAimType.PathLine) {
      return this.getAimPathLineWkt();
    }
    return '';
  }
  //解析wkt字符串成点数组
  getPositionsByWKT(wktString: string): { type: "" | "Polygon" | "MultiPolygon" | "LineString", positions: Cartesian3[] } {
    const geo =  parseWKTToGeo(wktString);
    const positions: Cartesian3[] = [];
    geo.coordinates.map((coord: any, index: number) => {
      for (let i = 0; i < index; i++) {
        const beforCoord = geo.coordinates[i];
        if (beforCoord[0] == coord[0] && beforCoord[1] == coord[1]) {
          return;
        }
      }
      positions.push(Cartesian3.fromDegrees(coord[0], coord[1]));
      return ;
    });
    return {
      type: geo.type,
      positions
    };
  }
  //将多边形的WKT字符串绘制到地图上
  WKTToViewer(wktString: string) {
    const { type, positions } = this.getPositionsByWKT(wktString);
    if (positions.length === 0) {
      return;
    }

    const tmpEditType = this.getCurEditAim();

    if (type === 'MultiPolygon' || type === 'Polygon') {
      this.setCurEditAim(EditAimType.Polygon);      

      positions.map((cartesian: Cartesian3) => {
        this.addPointToList(cartesian);
      });
      this.createAimPolygon(positions);
    } else if (type === 'LineString') {
      this.setCurEditAim(EditAimType.PathLine);
      
      positions.map((cartesian: Cartesian3) => {
        this.addPointToList(cartesian);
      });
      this.createAimPathLine(positions);
    }
    
    this.resetLinesByPoints();
    this.resetPointsStyle();
    this.render();

    this.setCurEditAim(tmpEditType);
  }
  //将辅助多边形画在地图上
  drawRelaPolygonByWKT(wktString: string) {
    const { type, positions } = this.getPositionsByWKT(wktString);
    if (positions.length === 0) {
      return null;
    }
    return this.addPolygon(positions, Color.BLUE.withAlpha(0.5));
  }
  //绘制所有相关站心和围栏
  drawRelaGeofences(nearGeofences: RelaGeofence[]) {
    const relaGeofences: RelaGeofenceStore[] = [];
    nearGeofences.map((item: RelaGeofence) => {
      let geofence : RelaGeofenceStore = {
        id: item.id,
        name: item.name,
        point: null,
        polygon: null
      };

      if (item.wktString && item.wktString != '') {
        geofence.polygon = this.drawRelaPolygonByWKT(item.wktString);
      }

      const center = convertToLatLng(item.pointString);
      if (center) {
        geofence.point = this.drawRelaCenterPoint(item.name, Cartesian3.fromDegrees(center.lng, center.lat, 0.0));
      }

      relaGeofences.push(geofence);
    });
    return relaGeofences;
  }
  clearRelaGeoFences(nearGeofences: RelaGeofenceStore[]) {
    nearGeofences.map((item: RelaGeofenceStore) => {
      if (item.point) {
        this.removeEntity(item.point);
      }
      if (item.polygon) {
        this.removeEntity(item.polygon);
      }
    });
  }
}
