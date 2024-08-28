import React from 'react';
import { Provider } from 'mobx-react';
import { render } from '@testing-library/react';
import Flow from '../flow';
import { getNodeModel } from '../model/default';

import TaskRuleConditionGroup from '../component/Condition/TaskRuleConditionGroup';
import ApprovalCreate from '@/store/approval';
import {
  buildConditionValue,
  syncConditionDisplay,
  validateHasErrorInCondition
} from '../component/Condition/util';

describe('流程画布 UI 测试', () => {
  describe('test flow ', () => {
    const initFlow = () => {
      const store = new ApprovalCreate();

      const initData = getNodeModel.initNodeModel();
      store.setProcess(initData);
      store.setData('componentList', []);

      return render(
        <Provider approval={store}>
          <Flow></Flow>
        </Provider>,
        container
      );
    };

    let flowComponent;
    let container;

    beforeEach(() => {
      container = document.createElement('container');
      flowComponent = initFlow();
    });

    afterEach(() => {
      container = null;
      flowComponent = null;
    });

    test('snapshot 渲染测试', () => {
      const store = new ApprovalCreate();
      const process = [
        {
          type: 'Start',
          option: {},
          resourceId: 'sid-272ABF3A-758D-4866-834F-C4879557C2B9',
          curNodeBoundsDeepIndex: 0,
          bounds: { upperLeft: { x: 35, y: 25 }, lowerRight: { x: 65, y: 55 } }
        },
        {
          type: 'Gateway',
          option: {},
          resourceId: 'sid-EC230FB5-ED7A-4DE4-83A4-1DB71F6DCC13',
          child: [
            {
              type: 'Branch',
              child: [
                {
                  type: 'Condition',
                  option: {
                    conditions: [
                      {
                        businessType: 2,
                        data: [
                          {
                            id: '15001251',
                            value: '15001251',
                            label:
                              '美团失效部门/到店事业群无效部门/收单渠道组/美团'
                          },
                          {
                            id: '20080368',
                            value: '20080368',
                            label:
                              '美团/到店事业群/充电宝业务部/线上合作商根结点/吕蓝莹/美团人'
                          },
                          {
                            id: '10015880',
                            value: '10015880',
                            label:
                              '美团/到家事业群/外卖事业部/外卖渠道部/锦屏县/锦屏县一组/锦屏美团'
                          }
                        ],
                        leaf: true,
                        operationCode: 'in',
                        operationDisplay: '属于',
                        operationName: 'in',
                        propertyCode: 'SYS_CRT_DEPTID',
                        propertyName: '制单人部门',
                        value: '15001251,20080368,10015880'
                      }
                    ],
                    logical: 1,
                    leaf: false
                  },
                  resourceId: 'sid-1016EA68-1F2C-438A-88D3-744AE1359AB1',
                  nodesCount: 3
                },
                {
                  type: 'Task',
                  option: {
                    overrideid: 'bpm0vw1ysljmabf',
                    approvalGroup: {
                      approverType: '0',
                      seriesType: '5',
                      seriesValue: '3',
                      approveType: 'ALL'
                    },
                    title: '审批任务',
                    ccGroups: []
                  },
                  resourceId: 'sid-FFE2D3C6-452B-45CC-BF3C-AE6FAFE8E101',
                  nodesCount: 3,
                  next: {
                    resourceId: 'sid-DD66ACCC-605D-43E0-9EB5-26FABA5E7F17'
                  },
                  curNodeBoundsDeepIndex: 2,
                  bounds: {
                    upperLeft: { x: 280, y: 0 },
                    lowerRight: { x: 380, y: 80 }
                  },
                  id: 144972
                }
              ],
              option: {}
            },
            {
              type: 'Branch',
              child: [
                {
                  type: 'Condition',
                  option: {
                    conditions: [
                      {
                        businessType: 1,
                        data: {
                          id: '6011957',
                          value: 'guanbingchang',
                          label: '管秉昌'
                        },
                        leaf: true,
                        operationCode: 'eq',
                        operationDisplay: '等于',
                        operationName: '==',
                        propertyCode: 'SYS_CRT_USERID',
                        propertyName: '制单人',
                        value: '6011957'
                      },
                      {
                        conditions: [
                          {
                            businessType: 0,
                            data: '123',
                            leaf: true,
                            operationCode: 'in',
                            operationDisplay: '属于',
                            operationName: 'in',
                            propertyCode: 'number_4d00d7f2',
                            propertyName: '数字输入框',
                            value: '123'
                          },
                          {
                            businessType: 0,
                            data: '10000',
                            leaf: true,
                            operationCode: 'ge',
                            operationDisplay: '大于等于',
                            operationName: '>=',
                            propertyCode: 'money_45c44d82',
                            propertyName: '金额',
                            value: '10000'
                          },
                          {
                            businessType: 0,
                            data: [
                              { label: '选项1', value: '选项1', id: '选项1' }
                            ],
                            leaf: true,
                            operationCode: 'CT',
                            operationDisplay: '包含',
                            operationName: 'contains',
                            propertyCode: 'selectdd_7b74bf05',
                            propertyName: '多选框',
                            value: '选项1'
                          }
                        ],
                        leaf: false,
                        logical: 1
                      },
                      {
                        businessType: 0,
                        data: [{ label: '选项1', value: '选项1', id: '选项1' }],
                        leaf: true,
                        operationCode: 'in',
                        operationDisplay: '属于',
                        operationName: 'in',
                        propertyCode: 'select_4c3190c3',
                        propertyName: '单选框',
                        value: '选项1'
                      }
                    ],
                    logical: 1,
                    leaf: false
                  },
                  resourceId: 'sid-DAE46BFD-6FA2-477B-A453-5012C46E7689',
                  nodesCount: 3
                },
                {
                  type: 'Task',
                  option: {
                    overrideid: 'bpm0me36l158tc8',
                    approvalGroup: {
                      approverType: '0',
                      seriesType: '0',
                      seriesValue: '5',
                      approveType: 'ALL'
                    },
                    title: '审批任务',
                    ccGroups: []
                  },
                  resourceId: 'sid-D96DFDF9-9210-4358-90D3-18D9E58354A1',
                  nodesCount: 3,
                  next: {
                    resourceId: 'sid-DD66ACCC-605D-43E0-9EB5-26FABA5E7F17'
                  },
                  curNodeBoundsDeepIndex: 2,
                  bounds: {
                    upperLeft: { x: 280, y: 100 },
                    lowerRight: { x: 380, y: 180 }
                  },
                  id: 144971
                }
              ],
              option: {}
            },
            {
              type: 'Branch',
              child: [
                {
                  type: 'Condition',
                  option: { default: true },
                  resourceId: 'sid-5DC3523B-8509-4DD8-9BEC-6511B16F4F68',
                  nodesCount: 3
                },
                {
                  type: 'Task',
                  option: {
                    overrideid: 'bpm0e5myuy1va05',
                    approvalGroup: {
                      approverType: '1',
                      seriesType: 'DEPARTMENT_LEVEL',
                      seriesValue: '3',
                      approveType: 'ALL'
                    },
                    title: '审批任务',
                    ccGroups: []
                  },
                  resourceId: 'sid-BE26C08B-DB41-448B-83BC-8CB89238A90B',
                  nodesCount: 3,
                  next: {
                    resourceId: 'sid-DD66ACCC-605D-43E0-9EB5-26FABA5E7F17'
                  },
                  curNodeBoundsDeepIndex: 2,
                  bounds: {
                    upperLeft: { x: 280, y: 200 },
                    lowerRight: { x: 380, y: 280 }
                  },
                  id: 144970
                }
              ],
              option: {}
            }
          ],
          curNodeBoundsDeepIndex: 1,
          next: { resourceId: 'sid-DD66ACCC-605D-43E0-9EB5-26FABA5E7F17' },
          curFlowableIndex: 2,
          bounds: {
            upperLeft: { x: 170, y: 20 },
            lowerRight: { x: 210, y: 60 }
          }
        },
        {
          type: 'Task',
          option: {
            overrideid: 'bpm01woif9hgh9a',
            approvalGroup: {
              approverType: '1',
              seriesType: 'DEPARTMENT_GRADE',
              seriesValue: 'X3A',
              approveType: 'ALL'
            },
            title: '审批任务',
            ccGroups: []
          },
          resourceId: 'sid-DD66ACCC-605D-43E0-9EB5-26FABA5E7F17',
          curNodeBoundsDeepIndex: 3,
          bounds: {
            upperLeft: { x: 420, y: 0 },
            lowerRight: { x: 520, y: 80 }
          },
          id: 144969
        },
        {
          type: 'Task',
          option: {
            overrideid: 'bpm0xpafrwtuz1i',
            approvalGroup: {
              approverType: '2',
              selectedUsers: [
                { id: '6011957', label: '管秉昌', value: 'guanbingchang' },
                { id: '2947100', label: '马孟杰', value: 'mamengjie02' }
              ],
              approveType: 'ANY'
            },
            title: '审批任务',
            ccGroups: []
          },
          resourceId: 'sid-7593EEA1-DB15-4D31-AD80-424AF8097E5C',
          curNodeBoundsDeepIndex: 4,
          bounds: {
            upperLeft: { x: 560, y: 0 },
            lowerRight: { x: 660, y: 80 }
          },
          id: 144968
        },
        {
          type: 'Task',
          option: {
            overrideid: 'bpm0aafundyjj27',
            approvalGroup: {
              approverType: '3',
              seriesType: '0',
              seriesValue: '4',
              approveType: 'SERIES'
            },
            title: '审批任务',
            ccGroups: []
          },
          resourceId: 'sid-A690FB06-12F2-49A5-BF89-FBEC00131AB9',
          curNodeBoundsDeepIndex: 5,
          bounds: {
            upperLeft: { x: 700, y: 0 },
            lowerRight: { x: 800, y: 80 }
          },
          id: 144967
        },
        {
          type: 'Task',
          option: {
            overrideid: 'bpm0sfw6e4jfqla',
            approvalGroup: {
              approverType: '3',
              seriesType: '1',
              seriesValue: 'X3B',
              approveType: 'SERIES'
            },
            title: '审批任务',
            ccGroups: []
          },
          resourceId: 'sid-7B1B4B76-13E7-4029-86E1-34847F5536CA',
          curNodeBoundsDeepIndex: 6,
          bounds: {
            upperLeft: { x: 840, y: 0 },
            lowerRight: { x: 940, y: 80 }
          },
          id: 144966
        },
        {
          type: 'Task',
          option: {
            overrideid: 'bpm05deiko9lfi8',
            approvalGroup: { approverType: '4', approveType: 'ALL' },
            title: '审批任务',
            ccGroups: []
          },
          resourceId: 'sid-91F30CB8-5B0D-471D-AEAA-1AD2B4773B7C',
          curNodeBoundsDeepIndex: 7,
          bounds: {
            upperLeft: { x: 980, y: 0 },
            lowerRight: { x: 1080, y: 80 }
          },
          id: 144965
        },
        {
          type: 'Task',
          option: {
            overrideid: 'bpm0q4qsucx476l',
            approvalGroup: {
              approverType: '6',
              formKey: 'people_8c35fd12',
              formValue: 'HRBP',
              approveType: 'ALL'
            },
            title: '审批任务',
            ccGroups: []
          },
          resourceId: 'sid-7B593220-49D1-4359-BC53-A9513ED77058',
          curNodeBoundsDeepIndex: 8,
          bounds: {
            upperLeft: { x: 1120, y: 0 },
            lowerRight: { x: 1220, y: 80 }
          },
          id: 144964
        },
        {
          type: 'Task',
          option: {
            overrideid: 'bpm0xjkxjpz8o7',
            approvalGroup: {
              approverType: '6',
              formKey: 'department_11064f99',
              formValue: 'RECRUITER_LEADER',
              approveType: 'ALL'
            },
            title: '审批任务',
            ccGroups: []
          },
          resourceId: 'sid-B40BED59-8DE7-4A59-A845-1973258321FC',
          curNodeBoundsDeepIndex: 9,
          bounds: {
            upperLeft: { x: 1260, y: 0 },
            lowerRight: { x: 1360, y: 80 }
          },
          id: 144963
        },
        {
          type: 'Task',
          option: {
            overrideid: 'bpm0nex1b9iv2h',
            approvalGroup: {
              approverType: '0',
              seriesType: '0',
              seriesValue: '1',
              approveType: 'ALL'
            },
            title: '审批任务',
            ccGroups: [
              {
                approverType: '2',
                selectedUsers: [
                  { id: '22146', label: '管芳涛', value: 'guanfangtao' },
                  { id: '28902', label: '管晓琳', value: 'guanxiaolin' }
                ]
              }
            ]
          },
          resourceId: 'sid-6CD072DC-A1D5-4606-A7F0-913C78299FD5',
          curNodeBoundsDeepIndex: 10,
          bounds: {
            upperLeft: { x: 1400, y: 0 },
            lowerRight: { x: 1500, y: 80 }
          },
          id: 144962
        },
        {
          type: 'End',
          option: {},
          resourceId: 'sid-E76B426A-5B82-4006-98D3-35956DEFB522',
          curNodeBoundsDeepIndex: 11,
          bounds: {
            upperLeft: { x: 1576, y: 26 },
            lowerRight: { x: 1604, y: 54 }
          }
        }
      ];
      const componentList = [
        {
          id: 'number_4d00d7f2',
          label: '数字输入框',
          type: 'number',
          required: true,
          componentName: 'Number'
        },
        {
          id: 'money_45c44d82',
          label: '金额',
          type: 'number',
          required: true,
          componentName: 'Money'
        },
        {
          id: 'selectdd_7b74bf05',
          label: '多选框',
          options: [{ value: '选项1', label: '选项1' }],
          type: 'array',
          required: true,
          componentName: 'SelectDD'
        },
        {
          id: 'select_4c3190c3',
          label: '单选框',
          options: [{ value: '选项1', label: '选项1' }],
          type: 'string',
          required: true,
          componentName: 'Select'
        },
        {
          id: 'people_8c35fd12',
          label: '联系人',
          type: 'people',
          required: true,
          componentName: 'People'
        },
        {
          id: 'department_11064f99',
          label: '部门',
          type: 'department',
          required: true,
          componentName: 'Department'
        }
      ];

      store.setProcess(process);
      store.setData('componentList', componentList);

      const wrapComponent = () => {
        return render(
          <Provider approval={store}>
            <Flow></Flow>
          </Provider>
        );
      };

      const component = wrapComponent();
      expect(component).toMatchSnapshot();
    });
  });

  describe('test condition 渲染', () => {
    test('复杂条件组', () => {
      const option = {
        conditions: [
          {
            conditions: [
              {
                businessType: 0,
                data: '2222',
                leaf: true,
                operationCode: 'eq',
                operationDisplay: '等于',
                operationName: '==',
                propertyCode: 'number_64594324',
                propertyName: '数字输入框',
                value: '2222'
              },
              {
                businessType: 0,
                data: { label: '选项1', value: '选项1', id: '选项1' },
                leaf: true,
                operationCode: 'eq',
                operationDisplay: '等于',
                operationName: '==',
                propertyCode: 'select_f94c66af',
                propertyName: '单选框',
                value: '选项1'
              },
              {
                businessType: 2,
                data: {
                  id: '21063410',
                  value: '21063410',
                  label:
                    '美团/到店事业群/充电宝业务部/线上合作商根结点/fengqiyi个人企业认证'
                },
                leaf: true,
                operationCode: 'ne',
                operationDisplay: '不等于',
                operationName: '!=',
                propertyCode: 'SYS_CRT_DEPTID',
                propertyName: '制单人部门',
                value: '21063410'
              },
              {
                businessType: 1,
                data: {
                  id: '6011957',
                  value: 'guanbingchang',
                  label: '管秉昌'
                },
                leaf: true,
                operationCode: 'eq',
                operationDisplay: '等于',
                operationName: '==',
                propertyCode: 'SYS_CRT_USERID',
                propertyName: '制单人',
                value: '6011957'
              }
            ],
            leaf: false,
            logical: 1
          },
          {
            conditions: [
              {
                businessType: 0,
                data: [{ label: '选项1', value: '选项1', id: '选项1' }],
                leaf: true,
                operationCode: 'CT',
                operationDisplay: '包含',
                operationName: 'contains',
                propertyCode: 'selectdd_76e59aeb',
                propertyName: '多选框',
                value: '选项1'
              },
              {
                businessType: 1,
                data: { id: '9201', value: 'guanxiaoxiao', label: '管晓霄' },
                leaf: true,
                operationCode: 'ne',
                operationDisplay: '不等于',
                operationName: '!=',
                propertyCode: 'SYS_CRT_USERID',
                propertyName: '制单人',
                value: '9201'
              }
            ],
            leaf: false,
            logical: 1
          }
        ],
        logical: 1,
        leaf: false,
        curNodeIndex: [1, 2, 0],
        priority: 2
      };
      const formProperties = [
        {
          propertyCode: 'number_64594324',
          propertyName: '数字输入框',
          businessType: 0,
          componentType: 'number',
          componentName: 'Number'
        },
        {
          propertyCode: 'select_f94c66af',
          propertyName: '单选框',
          businessType: 0,
          options: [{ value: '选项1', label: '选项1' }],
          data: [{ value: '选项1', label: '选项1' }],
          componentType: 'string',
          componentName: 'Select'
        },
        {
          propertyCode: 'selectdd_76e59aeb',
          propertyName: '多选框',
          businessType: 0,
          options: [{ value: '选项1', label: '选项1' }],
          data: [{ value: '选项1', label: '选项1' }],
          componentType: 'array',
          componentName: 'SelectDD'
        },
        {
          propertyCode: 'money_22b7be1a',
          propertyName: '金额',
          businessType: 0,
          componentType: 'number',
          componentName: 'Money'
        }
      ];

      const wrapComponent = () => {
        return render(
          <TaskRuleConditionGroup
            formProperties={formProperties}
            onAddOrRemoveCondition={() => {}}
            logical={option.logical ? option.logical : 1}
            conditions={option.conditions}
          ></TaskRuleConditionGroup>
        );
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const component = wrapComponent();
      expect(component).toMatchSnapshot();
    });

    test('buildConditionValue', () => {
      const optionValue = {
        conditions: [
          {
            businessType: 1,
            data: {
              id: '6011957',
              value: 'guanbingchang',
              label: '管秉昌'
            },
            leaf: true,
            operationCode: 'eq',
            operationDisplay: '等于',
            operationName: '==',
            propertyCode: 'SYS_CRT_USERID',
            propertyName: '制单人',
            value: '6011957'
          },
          {
            conditions: [
              {
                businessType: 0,
                data: '123',
                leaf: true,
                operationCode: 'in',
                operationDisplay: '属于',
                operationName: 'in',
                propertyCode: 'number_4d00d7f2',
                propertyName: '数字输入框',
                value: '123'
              },
              {
                businessType: 0,
                data: '10000',
                leaf: true,
                operationCode: 'ge',
                operationDisplay: '大于等于',
                operationName: '>=',
                propertyCode: 'money_45c44d82',
                propertyName: '金额',
                value: '10000'
              },
              {
                businessType: 0,
                data: [
                  {
                    label: '选项1',
                    value: '选项1',
                    id: '选项1'
                  }
                ],
                leaf: true,
                operationCode: 'CT',
                operationDisplay: '包含',
                operationName: 'contains',
                propertyCode: 'selectdd_7b74bf05',
                propertyName: '多选框',
                value: '选项1'
              }
            ],
            leaf: false,
            logical: 1
          },
          {
            businessType: 0,
            data: [
              {
                label: '选项1',
                value: '选项1',
                id: '选项1'
              }
            ],
            leaf: true,
            operationCode: 'in',
            operationDisplay: '属于',
            operationName: 'in',
            propertyCode: 'select_4c3190c3',
            propertyName: '单选框',
            value: '选项1'
          }
        ],
        logical: 1,
        leaf: false,
        curNodeIndex: [1, 1, 0],
        priority: 1,
        title: '条件2',
        exchangePriority: 1
      };

      buildConditionValue(optionValue.conditions);

      expect(optionValue).toMatchObject({
        conditions: [
          {
            businessType: 1,
            data: {
              id: '6011957',
              value: 'guanbingchang',
              label: '管秉昌'
            },
            leaf: true,
            operationCode: 'eq',
            operationDisplay: '等于',
            operationName: '==',
            propertyCode: 'SYS_CRT_USERID',
            propertyName: '制单人',
            value: 'guanbingchang'
          },
          {
            conditions: [
              {
                businessType: 0,
                data: '123',
                leaf: true,
                operationCode: 'in',
                operationDisplay: '属于',
                operationName: 'in',
                propertyCode: 'number_4d00d7f2',
                propertyName: '数字输入框',
                value: '123'
              },
              {
                businessType: 0,
                data: '10000',
                leaf: true,
                operationCode: 'ge',
                operationDisplay: '大于等于',
                operationName: '>=',
                propertyCode: 'money_45c44d82',
                propertyName: '金额',
                value: '10000'
              },
              {
                businessType: 0,
                data: [
                  {
                    label: '选项1',
                    value: '选项1',
                    id: '选项1'
                  }
                ],
                leaf: true,
                operationCode: 'CT',
                operationDisplay: '包含',
                operationName: 'contains',
                propertyCode: 'selectdd_7b74bf05',
                propertyName: '多选框',
                value: '选项1'
              }
            ],
            leaf: false,
            logical: 1
          },
          {
            businessType: 0,
            data: [
              {
                label: '选项1',
                value: '选项1',
                id: '选项1'
              }
            ],
            leaf: true,
            operationCode: 'in',
            operationDisplay: '属于',
            operationName: 'in',
            propertyCode: 'select_4c3190c3',
            propertyName: '单选框',
            value: '选项1'
          }
        ],
        logical: 1,
        leaf: false,
        curNodeIndex: [1, 1, 0],
        priority: 1,
        title: '条件2',
        exchangePriority: 1
      });
    });

    test('conditionValidator', () => {
      //发起人
      const conditions = [
        {
          key: 'bpm0rrol40qprnm',
          value: '',
          propertyCode: 'SYS_CRT_USERID',
          propertyName: '发起人',
          businessType: 1,
          subPropertyCode: '',
          subPropertyName: '',
          operationCode: '',
          operationName: '',
          operationDisplay: '',
          data: [],
          showSub: true,
          editOperation: true,
          leaf: true,
          subProperties: [],
          label: ''
        }
      ];
      const hasError = validateHasErrorInCondition(conditions);
      expect(hasError).toBe(true);

      conditions[0].value = undefined;
      const hasErrorWhenUndefined = validateHasErrorInCondition(conditions);
      expect(hasErrorWhenUndefined).toBe(true);

      conditions[0].value = {};
      const hasErrorWhenEmptryObject = validateHasErrorInCondition(conditions);
      expect(hasErrorWhenEmptryObject).toBe(true);

      conditions[0].value = [];
      const hasErrorWhenEmptryArray = validateHasErrorInCondition(conditions);
      expect(hasErrorWhenEmptryArray).toBe(true);

      //发起人等于管秉昌
      const conditions1 = [
        {
          key: 'bpm0rrol40qprnm',
          value: '2877543',
          propertyCode: 'SYS_CRT_USERID',
          propertyName: '发起人',
          businessType: 1,
          subPropertyCode: '',
          subPropertyName: '',
          operationCode: 'eq',
          operationName: '==',
          operationDisplay: '等于',
          data: { id: '2877543', label: '关兵 / guanbing03', value: '2877543' },
          showSub: true,
          editOperation: true,
          leaf: true,
          subProperties: [],
          label: ''
        }
      ];
      const hasError1 = validateHasErrorInCondition(conditions1);
      expect(hasError1).toBe(false);

      //嵌套
      const conditionNest = [
        {
          key: 'bpm0rrol40qprnm',
          value: '2877543',
          propertyCode: 'SYS_CRT_USERID',
          propertyName: '发起人',
          businessType: 1,
          subPropertyCode: '',
          subPropertyName: '',
          operationCode: 'eq',
          operationName: '==',
          operationDisplay: '等于',
          data: { id: '2877543', label: '关兵 / guanbing03', value: '2877543' },
          showSub: true,
          editOperation: true,
          leaf: true,
          subProperties: [],
          label: ''
        },
        {
          logical: 1,
          leaf: false,
          conditions: [
            {
              key: 'bpm0vzp4epqe43',
              value: '22036385',
              propertyCode: 'SYS_CRT_DEPTID',
              propertyName: '发起人部门',
              businessType: 2,
              subPropertyCode: '',
              subPropertyName: '',
              operationCode: 'eq',
              operationName: '==',
              operationDisplay: '等于',
              data: {
                id: '22036385',
                label:
                  '美团/买菜事业部/零售代理商(test)/华北大区/邯郸/gxw的二区/gxw测试店3',
                value: '22036385'
              },
              showSub: true,
              editOperation: true,
              leaf: true,
              subProperties: [],
              label: ''
            },
            {
              key: 'bpm0q930475xgz',
              propertyCode: 'money_45c44d82',
              propertyName: '金额',
              businessType: 0,
              subPropertyCode: '',
              subPropertyName: '',
              operationCode: 'gt',
              operationName: '>',
              operationDisplay: '大于',
              data: {},
              showSub: true,
              editOperation: true,
              leaf: true,
              componentType: 'number',
              componentName: 'Money',
              label: ''
            }
          ]
        }
      ];
      const hasErrorNest = validateHasErrorInCondition(conditionNest);
      expect(hasErrorNest).toBe(true);

      expect(validateHasErrorInCondition([])).toBe(false);
    });
  });

  describe('test syncConditionDisplay', () => {
    test('test syncConditionDisplay', () => {
      const option = {
        conditions: [
          {
            businessType: 0,
            data: [
              {
                label: 'select000zh7nmlquzz',
                value: 'select000zh7nmlquzz',
                id: 'select000zh7nmlquzz'
              }
            ],
            leaf: true,
            operationCode: 'in',
            operationDisplay: '等于任一',
            operationName: 'in',
            propertyCode: 'select_47b7a61d',
            propertyName: '单选框',
            value: 'select000zh7nmlquzz'
          },
          {
            businessType: 1,
            data: {
              id: '6011957',
              value: 'guanbingchang',
              label: '管秉昌'
            },
            leaf: true,
            operationCode: 'eq',
            operationDisplay: '等于',
            operationName: '==',
            propertyCode: 'SYS_CRT_USERID',
            propertyName: '发起人',
            value: '6011957'
          },
          {
            businessType: 2,
            data: {
              id: '10018199',
              value: '10018199',
              label:
                '公司-美团-到家事业群-外卖事业部-外卖渠道部-灌南县-灌南县一组-企业园'
            },
            leaf: true,
            operationCode: 'eq',
            operationDisplay: '等于',
            operationName: '==',
            propertyCode: 'SYS_CRT_DEPTID',
            propertyName: '发起人部门',
            value: '10018199'
          }
        ],
        logical: 2,
        leaf: false,
        curNodeIndex: [1, 0, 0],
        priority: 0
      };
      const formProperties = [
        {
          propertyCode: 'money_c632c208',
          propertyName: '金额',
          businessType: 0,
          componentType: 'number',
          componentName: 'Money'
        },
        {
          propertyCode: 'select_47b7a61d',
          propertyName: '单选框1111',
          businessType: 0,
          options: [
            {
              value: 'select000zh7nmlquzz',
              label: '11111'
            }
          ],
          data: [
            {
              value: 'select000zh7nmlquzz',
              label: '11111'
            }
          ],
          componentType: 'string',
          componentName: 'Select'
        },
        {
          propertyCode: 'number_1b56ac54',
          propertyName: '数字输入框',
          businessType: 0,
          componentType: 'number',
          componentName: 'Number'
        },
        {
          propertyCode: 'selectdd_e2d729e3',
          propertyName: '多选框',
          businessType: 0,
          options: [
            {
              value: 'selectdd0rmrdmz4ctaj',
              label: '3333'
            }
          ],
          data: [
            {
              value: 'selectdd0rmrdmz4ctaj',
              label: '3333'
            }
          ],
          componentType: 'array',
          componentName: 'SelectDD'
        }
      ];

      syncConditionDisplay(formProperties, option);
      expect(option).toMatchObject({
        conditions: [
          {
            businessType: 0,
            data: [{ value: 'select000zh7nmlquzz', label: '11111' }],
            leaf: true,
            operationCode: 'in',
            operationDisplay: '等于任一',
            operationName: 'in',
            propertyCode: 'select_47b7a61d',
            propertyName: '单选框1111',
            value: 'select000zh7nmlquzz',
            options: [{ value: 'select000zh7nmlquzz', label: '11111' }]
          },
          {
            businessType: 1,
            data: { id: '6011957', value: 'guanbingchang', label: '管秉昌' },
            leaf: true,
            operationCode: 'eq',
            operationDisplay: '等于',
            operationName: '==',
            propertyCode: 'SYS_CRT_USERID',
            propertyName: '发起人',
            value: '6011957'
          },
          {
            businessType: 2,
            data: {
              id: '10018199',
              value: '10018199',
              label:
                '公司-美团-到家事业群-外卖事业部-外卖渠道部-灌南县-灌南县一组-企业园'
            },
            leaf: true,
            operationCode: 'eq',
            operationDisplay: '等于',
            operationName: '==',
            propertyCode: 'SYS_CRT_DEPTID',
            propertyName: '发起人部门',
            value: '10018199'
          }
        ],
        logical: 2,
        leaf: false,
        curNodeIndex: [1, 0, 0],
        priority: 0
      });
    });
  });
});
