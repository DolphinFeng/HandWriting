import { getResourceId, getOverrideid } from '../utils/utils';
import { NODETYPE } from '../const';

const defaultConditionOption = {
  background: '#fff'
};

const defaultTaskOption = {
  title: '审批任务',
  background: '#5b91fe'
};

// 获取对应节点的数据模型
export const getNodeModel = {
  getGatewayNode() {
    return {
      type: NODETYPE.Gateway,
      option: {},
      resourceId: getResourceId(),
      child: [
        {
          type: NODETYPE.Branch,
          child: [
            {
              type: NODETYPE.Condition,
              option: { ...defaultConditionOption },
              resourceId: getResourceId()
            },
            {
              type: NODETYPE.Task,
              option: {
                ...defaultTaskOption,
                overrideid: getOverrideid()
              },
              resourceId: getResourceId()
            }
          ]
        },
        {
          type: NODETYPE.Branch,
          child: [
            {
              type: NODETYPE.Condition,
              option: {
                ...defaultConditionOption,
                title: '默认',
                default: true
              },
              resourceId: getResourceId()
            },
            {
              type: NODETYPE.Task,
              option: {
                ...defaultTaskOption,
                overrideid: getOverrideid()
              },
              resourceId: getResourceId()
            }
          ]
        }
      ]
    };
  },
  getBranchNode() {
    return {
      type: NODETYPE.Branch,
      child: [
        {
          type: NODETYPE.Condition,
          option: {
            ...defaultConditionOption
          },
          resourceId: getResourceId()
        },
        {
          type: NODETYPE.Task,
          option: {
            overrideid: getOverrideid(),
            ...defaultTaskOption
          },
          resourceId: getResourceId()
        }
      ]
    };
  },
  getTaskNode() {
    return {
      type: NODETYPE.Task,
      option: {
        overrideid: getOverrideid(),
        ...defaultTaskOption
      },
      resourceId: getResourceId()
    };
  },
  initNodeModel() {
    return [
      {
        type: NODETYPE.Start,
        option: {},
        resourceId: getResourceId()
      },
      {
        type: NODETYPE.Task,
        option: {
          ...defaultTaskOption,
          overrideid: getOverrideid()
        },
        resourceId: getResourceId()
      },
      {
        type: NODETYPE.End,
        option: {},
        resourceId: getResourceId()
      }
    ];
  }
};
