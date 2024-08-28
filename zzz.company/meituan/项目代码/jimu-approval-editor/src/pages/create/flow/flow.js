import { inject, observer } from 'mobx-react';
// import '@ss/mtd-react/lib/style/index.css';
import React, { Component } from 'react';
import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';
import './flow.less';
import { validateNode, findNode } from '@/utils/form';
import { NODETYPE } from './flow.type.ts';

import { NodeRenderStrategies } from './render';
// import { data as allData } from './model/data';
import { getNodeModel } from './model/default';
import { cloneDeep } from './utils/utils';

@inject(({ approval }) => ({
  setProcess: approval.setProcess,
  componentList: approval.conditionComponentList,
  process: approval.process
}))
@observer
export default class Flow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      curAllData: [] // initData
    };

    this.flowRef = React.createRef();
  }

  componentWillMount() {
    const { process } = this.props;
    if (process.length < 1) {
      const initData = getNodeModel.initNodeModel();
      this.props.setProcess(initData);
      this.setState({
        curAllData: cloneDeep(initData)
      });
    } else {
      this.setState({
        curAllData: cloneDeep(process)
      });
    }
  }

  componentDidMount() {
    // 初始化
    // eslint-disable-next-line no-new
    const ps = new PerfectScrollbar(this.flowRef);
    // 定位在开始画布的中间
    this.flowRef.scrollLeft = (ps.contentWidth - window.innerWidth) / 2;

    // 为了得到 curNodeIndex;
    this.props.setProcess(this.state.curAllData);
  }

  saveTaskNode(option) {
    const { curAllData } = this.state;
    const result = validateNode(NODETYPE.Task, option);
    option.validateMessage = result;

    const updateAllData = cloneDeep(curAllData);

    this.setState({
      curAllData: updateAllData
    });

    this.props.setProcess(updateAllData);
  }

  saveStartNode() {
    const { curAllData } = this.state;
    const updateAllData = cloneDeep(curAllData);

    this.setState({
      curAllData: updateAllData
    });

    this.props.setProcess(updateAllData);
  }

  saveConditionNode(option) {
    const { curAllData } = this.state;

    const { curNodeIndex, priority, exchangePriority } = option;
    const result = validateNode(NODETYPE.Condition, option);
    option.validateMessage = result;

    const updateAllData = cloneDeep(curAllData);

    // 交换 priority 和 exchangePriority ;
    // 通过 curNodeIndex 找到所在 branch
    const curBranchs = curNodeIndex.slice(0, curNodeIndex.length - 2);
    const currentGateWay = findNode(curBranchs, updateAllData);

    // 交换优先级
    const temp = currentGateWay.child[priority];
    currentGateWay.child[priority] = currentGateWay.child[exchangePriority];
    currentGateWay.child[exchangePriority] = temp;

    this.setState({
      curAllData: updateAllData
    });

    this.props.setProcess(updateAllData);
  }

  addNode(option) {
    const modelType = option.type;
    const modelFn = getNodeModel[`get${modelType}Node`];
    const model = modelFn && modelFn();
    let curArr;
    const { curAllData } = this.state;
    const updateAllData = cloneDeep(curAllData);
    const curIndex = cloneDeep(option.index);
    // 如果是添加条件，直接拿的是geteway的index信息，所以不需要pop
    const lastIndex = modelType === NODETYPE.Branch ? 0 : curIndex.pop();
    curIndex.forEach((item) => {
      curArr =
        (curArr && curArr.child && curArr.child[item]) || updateAllData[item];
    });

    curArr = (curArr && curArr.child) || updateAllData;
    const nodeIndex =
      modelType === NODETYPE.Branch ? curArr.length - 1 : lastIndex + 1;

    curArr.splice(nodeIndex, 0, model);

    this.setState({
      curAllData: updateAllData
    });
    this.props.setProcess(updateAllData);
  }

  deleteNode(option) {
    let curArr;
    let prevNode;

    const { curAllData } = this.state;
    const { type } = option;
    const updateAllData = cloneDeep(curAllData);
    const curIndex = cloneDeep(option.index);
    // 如果是Condition节点需要找到branch数组的位置，然后删掉，需要在上一层
    if (type === NODETYPE.Condition) curIndex.pop();
    let lastIndex = curIndex.pop();
    curIndex.forEach((item) => {
      prevNode = curArr || updateAllData;
      curArr =
        (prevNode && prevNode.child && prevNode.child[item]) ||
        updateAllData[item];
    });
    curArr = (curArr && curArr.child) || updateAllData;
    if (curArr.length === 2 && option.type === NODETYPE.Condition) {
      // 处理两个条件节点的条件时，删除条件节点，直接移除整个Gateway
      curArr = prevNode.type === NODETYPE.Branch ? prevNode.child : prevNode;
      lastIndex = curIndex.pop();
    }
    curArr.splice(lastIndex, 1);
    this.setState({
      curAllData: updateAllData
    });
    this.props.setProcess(updateAllData);
  }

  dealWithNode(option, dealType) {
    /* option 
      type: Task、Gateway、Branch
      index: [1, 2, 3], 根据数据按顺序找到对应层级位置，如：[1].child[2].child[3]
      other: [1, 2, 2], 根据index的位置进行交换，目前只能支持branch互换
    */
    const curFn = this[`${dealType}Node`].bind(this);
    curFn && curFn(option);
  }

  // 获取所有的Overrideid, 排除curID
  getAllOverrideid(curId) {
    const { curAllData } = this.state;
    const allOverrideid = [];
    const dfs = (nodes, allOverrideid) => {
      for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        /**
         * task 和 conditions 没有 child 节点，branch 有
         */
        if (!node.child || node.child.length === 0) {
          const overrideid = node.option?.overrideid;
          if (overrideid) {
            if (curId && overrideid === curId) continue;
            allOverrideid.push(overrideid);
          }
        } else {
          dfs(node.child, allOverrideid);
        }
      }
    };

    dfs(curAllData, allOverrideid);
    return allOverrideid;
  }

  componentWillUmount() {}

  render() {
    const { curAllData } = this.state;
    const dealWithNodeFn = this.dealWithNode.bind(this);
    const getAllOverrideid = this.getAllOverrideid.bind(this);

    return (
      <div className='flow-editor'>
        <div
          id='flow-ps'
          ref={(flowRef) => {
            this.flowRef = flowRef;
          }}
          style={{
            position: 'relative',
            height: '100%'
          }}
        >
          <div className='flow-root-wrap'>
            <div className='flow-editor-root flow-editor-node branch'>
              {(curAllData &&
                curAllData.map((item, index) => {
                  item.option.dealWithNodeFn = dealWithNodeFn;
                  item.option.curNodeIndex = [index];
                  item.option.getAllOverrideid = getAllOverrideid;
                  return NodeRenderStrategies[item.type](item);
                })) ||
                null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
