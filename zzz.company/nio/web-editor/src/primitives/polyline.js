import {
  Cartesian3,
  Color,
  ColorGeometryInstanceAttribute,
  destroyObject,
  EllipsoidSurfaceAppearance,
  GeometryInstance,
  Material,
  PointPrimitive,
  PolygonGeometry,
  PolygonHierarchy,
  PolylineColorAppearance,
  PolylineGeometry,
  PolylineMaterialAppearance,
  Primitive,
} from 'cesium';
import {DefineAppearance, DefineColor} from '../cesium/materail.js';
import {createViewer} from '../cesium/initMap.js';
import {OddData} from '../system/odd/oddData/OddDataModel.js';
import {copyObj} from '../../src/utils/utils.js';
import {Cartographic} from 'cesium';

const viewer = createViewer();

/**
 * 预置线状态
 */
const PolylineState = {
  //选中lane
  ARROW_HOVER_LANE: {
    type: 'ARROW_HOVER_LANE',
    width: 3,
    appearance: new PolylineMaterialAppearance({
      material: Material.fromType('Color', {
        color: Color.fromCssColorString('#fbbe11'),
      }),
    }),
  },
  //事件
  ARROW_EVENT: {
    type: 'ARROW_EVENT',
    width: 3,
    appearance: new PolylineMaterialAppearance({
      material: Material.fromType('Color', {
        color: Color.fromCssColorString('#4cfdff'),
      }),
    }),
  },
  //选中事件
  ARROW_HOVER_EVENT: {
    type: 'ARROW_HOVER_EVENT',
    width: 3,
    appearance: new PolylineMaterialAppearance({
      material: Material.fromType('Color', {
        color: Color.fromCssColorString('#00a6a6'),
      }),
    }),
  },
};

class CustomPolyline {
  //_positionsArray;
  /** @type{OddData[]} */
  oddDataList = [];
  _primitiveArray;
  states = new Map(); //与oddDataList一一对应，标记每条事件的渲染状态
  state; //用于保留对象被构建时的初始化时的值，作为默认值赋给states
  name;
  //get positionsArray() {
  //    return this._positionsArray;
  //}

  //Cartesian3数组
  //set positionsArray(oddData) {
  //    if(oddData instanceof OddData){
  //      if(oddData.eventId === ''){

  //      }
  //      else{

  //        for (let i = 0; i < this._primitiveArray.length; i++) {
  //          if(this._primitiveArray[i].eventId === oddData.eventId){
  //            this._primitiveArray[i].destroy();
  //            this._primitiveArray.splice(i, 1);
  //            break;
  //          }
  //        }

  //        let primitive = this.getPrimitive(oddData.positions, oddData.eventId);
  //        this._primitiveArray.push(primitive);
  //      }
  //    }
  //    //this._positions = value;
  //    //this._primitive && this._primitive.destroy();
  //    //this._primitive = this.getPrimitive();
  //}

  constructor(options) {
    //this._positionsArray = [];
    this._primitiveArray = [];

    if (typeof options.state === 'string') {
      if (!(options.state in PolylineState)) {
        throw new Error('预置线类型不存在');
      }
      this.state = PolylineState[options.state];
    } else {
      this.state = options.state;
    }
    this.name = options.name ?? '';
    //this.positionsArray = options.oddData;
    //this._primitiveArray[0]._allowPicking = options.allowPicking ?? false;
  }

  set allowPicking(value) {
    this.setStyle(this.state.type);
    //this._primitive._allowPicking = value;
    for (let i = 0; i < this._primitiveArray.length; i++) {
      this._primitiveArray[i]._allowPicking = value;
    }
  }

  set oddDataList(value) {
    for (let i = 0; i < value.length; i++) {
      this.states.set(value.eventId, this.state);
    }

    oddDataList = value;
  }

  get oddDataList() {
    return oddDataList;
  }

  getState(eventId) {
    if (this.states.has(eventId)) {
      return this.states.get(eventId);
    } else {
      this.states.set(eventId, this.state);
      return this.state;
    }
  }

  /**
   * options为空时，将恢复primitive原来的样式
   * @param state{String}
   * @param isForceUpdate{boolean}
   */
  setStyle(state, eventId, isForceUpdate = false) {
    if (eventId === undefined) {
      for (let i = 0; i < this.oddDataList.length; i++) {
        if (this.states.has(this.oddDataList[i].eventId) === false) {
          this.states.set(this.oddDataList[i].eventId, this.state);
        }

        if (this.states.get(this.oddDataList[i].eventId).type !== state) {
          this.states.set(this.oddDataList[i].eventId, PolylineState[state]);
          let positions = this.oddDataList[i].positions;

          //加高一点，否则太长了渲染会有压盖不正常
          if (state === 'ARROW_HOVER_EVENT') {
            positions = copyObj(this.oddDataList[i].positions);

            for (let i = 0; i < positions.length; i++) {
              let carto = Cartographic.fromCartesian(positions[i]);
              carto.height = 0.1;
              positions[i] = Cartographic.toCartesian(carto);
            }
          }

          let primitive = this.getPrimitive(positions, this.oddDataList[i].eventId);

          //在从hoverLayer转到oddLayer时，调用了cesium的remove，会同时把_primitiveArray清空。
          if (i > this._primitiveArray.length - 1) {
            this._primitiveArray.push(primitive);
          } else {
            this._primitiveArray[i].destroy();
            this._primitiveArray[i] = primitive;
          }
        }
      }
    } else {
      //this._primitiveArray = [];
      for (let i = 0; i < this.oddDataList.length; i++) {
        if (this.states.has(eventId) === false) {
          this.states.set(eventId, this.state);
        }

        if (this.oddDataList[i].eventId === eventId && this.states.get(eventId).type !== state) {
          for (let j = 0; j < this._primitiveArray.length; j++) {
            if (this._primitiveArray[j].eventId === eventId) {
              this.states.set(eventId, PolylineState[state]);

              let positions = this.oddDataList[i].positions;

              //加高一点，否则太长了渲染会有压盖不正常
              if (state === 'ARROW_HOVER_EVENT') {
                positions = copyObj(this.oddDataList[i].positions);

                for (let i = 0; i < positions.length; i++) {
                  let carto = Cartographic.fromCartesian(positions[i]);
                  carto.height = 0.1;
                  positions[i] = Cartographic.toCartesian(carto);
                }
              }

              let primitive = this.getPrimitive(positions, this.oddDataList[i].eventId);
              //this._primitiveArray[j].destroy();
              //this._primitiveArray[j] = primitive;

              if (j > this._primitiveArray.length - 1) {
                this._primitiveArray.push(primitive);
              } else {
                this._primitiveArray[j].destroy();
                this._primitiveArray[j] = primitive;
              }
            }
          }
        }
      }
    }

    //this._primitive && this._primitive.destroy();
    //this._primitive = this.getPrimitive();
    viewer.scene.requestRender();
  }

  getPrimitive(positions, eventId) {
    let primitive = new Primitive({
      geometryInstances: new GeometryInstance({
        geometry: new PolylineGeometry({
          positions: positions,
          width: this.getState(eventId).width,
          vertexFormat: PolylineMaterialAppearance.VERTEX_FORMAT,
        }),
        id: this,
      }),
      appearance: this.getState(eventId).appearance,
      releaseGeometryInstances: true,
      asynchronous: true,
    });

    primitive.eventId = eventId;
    return primitive;
  }

  isVisible() {
    return true;
  }

  update(context, frameState, commandList) {
    if (this.isVisible()) {
      //this._primitive.update(context, frameState, commandList);
      for (let i = 0; i < this._primitiveArray.length; i++) {
        this._primitiveArray[i].update(context, frameState, commandList);
      }
    }
  }

  isDestroyed() {
    //return this._primitive.isDestroyed();
    for (let i = 0; i < this._primitiveArray.length; i++) {
      if (this._primitiveArray[i].isDestroyed() != true) {
        return false;
      }
    }

    return true;
  }

  destroy() {
    //this._primitive = this._primitive && this._primitive.destroy();
    for (let i = 0; i < this._primitiveArray.length; i++) {
      this._primitiveArray[i].destroy();
    }

    this._primitiveArray = [];

    return destroyObject(this);
  }
}

class CustomPoint extends PointPrimitive {
  _customPosition;
  get customPosition() {
    return this._customPosition;
  }

  set customPosition(value) {
    this._customPosition.x = value.x;
    this._customPosition.y = value.y;
    this._customPosition.z = value.z;
  }

  name;

  constructor(options) {
    super(options);
    this.id = this;
    this.name = options.id;
    this._customPosition = options.position;
  }
}

export {CustomPolyline, CustomPoint};
