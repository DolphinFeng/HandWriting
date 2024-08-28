import { getFlowableNodeModel } from '../model/flowable';
import { cloneDeep } from './utils';

export function toFlowable(flowData, other = { properties: {} }) {
  // 记录所有节点的位置信息 [[],[],[[],[]]] 在流程工厂引擎上面从左到右排列，同一个位置从上倒下
  const flowableBoundeArr = [];
  const flowable = getFlowableNodeModel.getModel();
  flowable.properties = other.properties;
  const curNodeDeepIndex = {
    curGatewayIndex: 0,
    curNodeBoundsDeepIndex: 0
  };
  flowData.forEach((element, index) => {
    dealNode(
      element,
      index,
      flowable,
      flowData,
      flowableBoundeArr,
      curNodeDeepIndex
    );
  });
  dealConditionSequenceflow(flowable);

  return JSON.stringify(flowable);
}

function dealGatewayNode(
  curElement,
  flowable,
  flowableBoundeArr,
  curNodeDeepIndex
) {
  // const { curNodeIndex } = curElement.option;
  curNodeDeepIndex.curGatewayIndex = curElement.curNodeBoundsDeepIndex;
  const curFlowable = flowable.childShapes[curElement.curFlowableIndex];
  let maxDeepIndex = 0;
  if (curElement.type === 'Gateway') {
    const { child } = curElement;
    // eslint-disable-next-line no-loop-func
    child.forEach((childelement) => {
      const curAllNode = childelement.child;
      const childLength = curAllNode.length;
      const curGatewayNodeDeepIndex = cloneDeep(curNodeDeepIndex);
      curAllNode.forEach((node, childindex) => {
        if (childindex === childLength - 1) {
          node.next = curElement.next;
        }
        dealNode(
          node,
          childindex,
          flowable,
          curAllNode,
          flowableBoundeArr,
          curGatewayNodeDeepIndex
        );
        // 添加网关的outgoing节点, 每个条件分支都是一个outgoing节点
        if (childindex === 0) {
          curFlowable.outgoing.push({ resourceId: node.resourceId });
        }
      });
      maxDeepIndex = Math.max(
        curGatewayNodeDeepIndex.curNodeBoundsDeepIndex,
        maxDeepIndex
      );
    });
  }
  curNodeDeepIndex.curNodeBoundsDeepIndex = maxDeepIndex;
}

// 循环外层节点的处理
function dealNode(
  element,
  index,
  flowable,
  allNodeData,
  flowableBoundeArr,
  curNodeDeepIndex
) {
  const toflowablemodel = getFlowableNodeModel[`get${element.type}Model`]();
  // 对应节点属性
  toflowablemodel.properties.name = element.option.title;
  toflowablemodel.properties.overrideid = element.option.overrideid || '';
  toflowablemodel.resourceId = element.resourceId;
  // 特殊判断
  const isGateway = element.type === 'Gateway';
  const isEnd = element.type === 'End';
  const isCondition = element.type === 'Condition';

  // 节点与节点之间需要添加线进行连接, 当前节点的outgonging需要添加该线的resourceId，目前默认为当前节点的resourceId加上-line
  const lineResourceId = `${element.resourceId}-line`;
  if (!isGateway && !isEnd && !isCondition) {
    toflowablemodel.outgoing.push({ resourceId: lineResourceId });
  }

  flowable.childShapes.push(toflowablemodel);

  // 获取线的model
  const line = getFlowableNodeModel.getConditionModel();
  line.resourceId = lineResourceId;
  const nextNode = allNodeData[index + 1];
  const nextResourceId = nextNode
    ? nextNode.resourceId
    : element.next?.resourceId;

  if (isCondition) {
    // 如果是条件节点，本身就是线，不需要在添加线进行链接了
    // 判断线是不是默认的,添加默认
    toflowablemodel.properties.defaultflow = element.option.default || false;
    toflowablemodel.outgoing.push({ resourceId: nextResourceId });
    toflowablemodel.target.resourceId = nextResourceId;
    return;
  }

  // 如果不是线条件节点，节点的深度+1
  element.curNodeBoundsDeepIndex = curNodeDeepIndex.curNodeBoundsDeepIndex++;

  if (nextResourceId) {
    if (isGateway) {
      // 处理网关，遍历网关里面的所有节点，这个是同步的，只有遍历完了之后，才继续往下走
      element.next = { resourceId: nextResourceId };
      element.curFlowableIndex = flowable.childShapes.length - 1;
      dealGatewayNode(element, flowable, flowableBoundeArr, curNodeDeepIndex);
    } else {
      // flowable线需要两个位置，找到下一个链接的节点
      line.outgoing.push({ resourceId: nextResourceId });
      line.target.resourceId = nextResourceId;
      flowable.childShapes.push(line);
    }
  }
  // 计算处理每个节点在流程工厂流程引擎的位置
  dealBounds(element, flowableBoundeArr);
  toflowablemodel.bounds = element.bounds;
}

function dealBounds(node, flowableBoundeArr) {
  // 特殊判断
  const isCondition = node.type === 'Condition';
  if (isCondition) return;
  const boundeArrIndex = node.curNodeBoundsDeepIndex;

  flowableBoundeArr[boundeArrIndex] = flowableBoundeArr[boundeArrIndex] || [];
  const curArr = flowableBoundeArr[boundeArrIndex];
  const pos = {
    row: boundeArrIndex,
    line: curArr.length
  };
  const bounds = getFlowableNodeModel.getBoundsPos(pos, node.type);
  curArr.push({
    bounds,
    resourceId: node.resourceId
  });
  node.bounds = bounds;
}

// 遍历计算出线节点的dockers，以及lowerRight和upperLeft
function dealConditionSequenceflow(flowable) {
  const { childShapes } = flowable;
  const data = {};
  childShapes.forEach((item, index) => {
    data[item.resourceId] = {
      index,
      type: item.stencil.id
    };
  });
  childShapes.forEach((item) => {
    if (item.stencil.id === 'SequenceFlow') {
      const { resourceId } = item;
      const preNode = childShapes.filter((ele) => {
        return (
          ele.outgoing.filter((i) => {
            return i.resourceId === resourceId;
          }).length > 0
        );
      })[0];
      const nextNodeIndex = data[item.target.resourceId].index;
      const nextNode = childShapes[nextNodeIndex];
      item.dockers.push({
        x: (preNode.bounds.lowerRight.x - preNode.bounds.upperLeft.x) / 2,
        y: (preNode.bounds.lowerRight.y - preNode.bounds.upperLeft.y) / 2
      });
      item.dockers.push({
        x: (nextNode.bounds.lowerRight.x - nextNode.bounds.upperLeft.x) / 2,
        y: (nextNode.bounds.lowerRight.y - nextNode.bounds.upperLeft.y) / 2
      });
      item.bounds = {
        lowerRight: {
          x: (nextNode.bounds.lowerRight.x + nextNode.bounds.upperLeft.x) / 2,
          y: (nextNode.bounds.lowerRight.y + nextNode.bounds.upperLeft.y) / 2
        },
        upperLeft: {
          x: (preNode.bounds.lowerRight.x + preNode.bounds.upperLeft.x) / 2,
          y: (preNode.bounds.lowerRight.y + preNode.bounds.upperLeft.y) / 2
        }
      };
    }
  });
}
