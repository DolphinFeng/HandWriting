// 获取对应节点的数据模型
export const getFlowableNodeModel = {
  getBoundsPos(pos, type) {
    // pos{line, row}表示位置在第几行第几列
    // pos.line = 1, pos.row = 1
    // 下面数组表示规则[x, y]
    const firstPosCenter = [50, 40];
    const step = [140, 100];
    const allWh = {
      Start: {
        w: 30,
        h: 30
      },
      Task: {
        w: 100,
        h: 80
      },
      Gateway: {
        w: 40,
        h: 40
      },
      End: {
        w: 28,
        h: 28
      }
    };
    const curCenter = [
      firstPosCenter[0] + step[0] * pos.row,
      firstPosCenter[1] + step[1] * pos.line
    ];
    return {
      upperLeft: {
        x: curCenter[0] - allWh[type].w / 2,
        y: curCenter[1] - allWh[type].h / 2
      },
      lowerRight: {
        x: curCenter[0] + allWh[type].w / 2,
        y: curCenter[1] + allWh[type].h / 2
      }
    };
  },
  getModel() {
    return {
      modelId: '1',
      // 画布大小
      bounds: {
        lowerRight: {
          x: 2560,
          y: 1950
        },
        upperLeft: {
          x: 0,
          y: 0
        }
      },
      // 流程名称
      properties: {
        process_id: 'mmj11',
        name: 'mmj1'
      },
      // 子节点
      childShapes: [],
      // 模版
      stencil: {
        id: 'BPMNDiagram'
      },
      // 模版配置
      stencilset: {
        namespace: 'http://b3mn.org/stencilset/bpmn2.0#',
        url: '../editor/stencilsets/bpmn2.0/bpmn2.0.json'
      }
    };
  },
  getStartModel() {
    return {
      resourceId: '',
      properties: {
        overrideid: '',
        name: 'StartEvent'
      },
      stencil: {
        id: 'StartNoneEvent'
      },
      childShapes: [],
      // 节点之间的互连
      outgoing: [],
      // 节点位置, 根据左上和右下的点来确定
      bounds: {
        lowerRight: {
          x: 0,
          y: 0
        },
        upperLeft: {
          x: 0,
          y: 0
        }
      },
      // 点, 一般线会有这个链接点
      dockers: []
    };
  },
  getGatewayModel() {
    return {
      resourceId: 'sid-D467C3C2-AC9A-4FBD-8782-CE837841BE5B',
      properties: {
        overrideid: 'bpm0g70w9en3m66',
        name: '排他网关'
      },
      stencil: {
        id: 'ExclusiveGateway'
      },
      childShapes: [],
      outgoing: [],
      bounds: {
        lowerRight: {
          x: 535,
          y: 400
        },
        upperLeft: {
          x: 495,
          y: 360
        }
      },
      dockers: []
    };
  },
  getConditionModel() {
    return {
      resourceId: '',
      properties: {
        overrideid: '',
        name: '',
        conditionsequenceflow: '',
        defaultflow: false
      },
      stencil: {
        id: 'SequenceFlow'
      },
      childShapes: [],
      outgoing: [],
      bounds: {
        lowerRight: {
          x: 839.5,
          y: 430
        },
        upperLeft: {
          x: 760.5,
          y: 430
        }
      },
      // 线在节点上的连接点, xy为根据对应连接节点的长宽的一半
      dockers: [
        // {
        //   x: 50,
        //   y: 40
        // },
        // {
        //   x: 14,
        //   y: 14
        // }
      ],
      target: {
        resourceId: ''
      }
    };
  },
  getTaskModel() {
    return {
      resourceId: '',
      properties: {
        overrideid: '',
        name: ''
      },
      stencil: {
        id: 'UserTask'
      },
      childShapes: [],
      outgoing: [],
      bounds: {
        lowerRight: {
          x: 760,
          y: 470
        },
        upperLeft: {
          x: 660,
          y: 390
        }
      },
      dockers: []
    };
  },
  getEndModel() {
    return {
      resourceId: '',
      properties: {
        overrideid: 'bpm09n6prk3gun',
        name: 'EndEvent'
      },
      stencil: {
        id: 'EndNoneEvent'
      },
      childShapes: [],
      outgoing: [],
      bounds: {
        lowerRight: {
          x: 868,
          y: 444
        },
        upperLeft: {
          x: 840,
          y: 416
        }
      },
      dockers: []
    };
  }
};
