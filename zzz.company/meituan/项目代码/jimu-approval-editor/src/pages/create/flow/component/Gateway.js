import { observer } from 'mobx-react';
// import '@ss/mtd-react/lib/style/index.css';
import React, { Component } from 'react';
import { Icon } from '@ss/mtd-react';
import AddNode from './AddNode';
import { cloneDeep } from '../utils/utils';
import { NODETYPE } from '../const';

@observer
export default class Gateway extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.flowRef = React.createRef();
  }

  componentDidMount() {}

  addConditionBranch() {
    const { curNodeIndex, dealWithNodeFn } = this.props.option || {};
    const params = {
      index: curNodeIndex,
      type: NODETYPE.Branch
    };
    dealWithNodeFn(params, 'add');
  }

  render() {
    const { child, NodeRenderStrategies, option } = this.props;

    const { curNodeIndex, dealWithNodeFn, getAllOverrideid } = option;
    const Branchs = child.map((item, index) => {
      const nodeChild = item.child;
      const condition = nodeChild[0];
      const curBranchIndex = cloneDeep(curNodeIndex);
      curBranchIndex.push(index);
      return (
        <div key={condition.resourceId} className='flow-node branch'>
          <div className='top-line-mask'></div>
          <div className='top-v-line'></div>
          <div className='nodes'>
            {nodeChild.map((node, indexC) => {
              const curIndexArr = cloneDeep(curBranchIndex);
              curIndexArr.push(indexC);
              node.option.dealWithNodeFn = dealWithNodeFn;
              node.option.getAllOverrideid = getAllOverrideid;
              node.option.curNodeIndex = curIndexArr;
              node.option.priority = index;

              // 节点数量
              node.nodesCount = child.length;
              const component = NodeRenderStrategies[node.type](node);

              return component;
            })}
          </div>
          <div className='bottom-v-line'></div>
          <div className='bottom-line-mask'></div>
        </div>
      );
    });

    return (
      <div className='flow-node route'>
        <div className='top-h-line'></div>
        <div className='add-branch'>
          <div
            className='add-branch-inner'
            onClick={() => {
              this.addConditionBranch();
            }}
          >
            添加条件
            <Icon type='right'></Icon>
          </div>
        </div>
        <div className='branches'>{Branchs}</div>
        <div className='bottom-h-line'></div>
        <div className='bottom-v-line'></div>
        <AddNode {...this.props}></AddNode>
      </div>
    );
  }
}
