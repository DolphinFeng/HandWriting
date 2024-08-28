import {
  findNodesByPropertyCodes,
  findAllChildrenByInstanceKey,
  convertFormToData,
  convertDataToForm,
  validateForm,
  getFormComponentList
} from '../form';

import {
  convertConditionToForm,
  removeProperties,
  buildTaskDescription,
  buildConditionDescription,
  validateProcess,
  getFormRoles,
  convertApprovalToForm,
  validateNode,
  getUsedPropertyCodes,
  convertApprovalToData,
  isReachableNode
} from '../flow';

import { data } from './data';

import { FORM_PEOPLE_ROLES } from '@/pages/create/flow/component/Task/const';

import {
  APPROVEFORMROLE,
  APPROVERTYPE
} from '@/pages/create/flow/component/Task/task.type';

import {
  GroupTypeEnum,
  ReportChainTypeEnum,
  ChoiceTypeEnum,
  EntityTypeEnum,
  OutputTypeEnum
} from '../form.type';

describe('流程画布方法测试', () => {
  let process;

  const initProcess = () => {
    return [
      {
        type: 'Start',
        option: { curNodeIndex: [0] },
        resourceId: 'sid-BA23C0E8-E67B-40B7-A090-742D4C29DC6F',
        curNodeBoundsDeepIndex: 0,
        bounds: { upperLeft: { x: 35, y: 25 }, lowerRight: { x: 65, y: 55 } }
      },
      {
        type: 'Gateway',
        option: { curNodeIndex: [1] },
        resourceId: 'sid-080661EE-E6EB-4489-97DB-816D117E3F58',
        child: [
          {
            type: 'Branch',
            child: [
              {
                type: 'Condition',
                option: {
                  title: '条件',
                  background: '#fff',
                  curNodeIndex: [1, 0, 0],
                  priority: 0,
                  conditions: [
                    {
                      key: 'bpm0h5o2hb5fjkf',
                      value: '选项1',
                      propertyCode: 'select_7cc996a2',
                      propertyName: '单选框`1',
                      businessType: 0,
                      subPropertyCode: '',
                      subPropertyName: '',
                      operationCode: 'eq',
                      operationName: '==',
                      operationDisplay: '等于',
                      data: { value: '选项1', label: '选项1' },
                      showSub: true,
                      editOperation: true,
                      leaf: true,
                      options: [{ value: '选项1', label: '选项1' }],
                      componentType: 'string',
                      componentName: 'Select',
                      label: ''
                    },
                    {
                      logical: 1,
                      leaf: false,
                      conditions: [
                        {
                          key: 'bpm0wvfz6phg8g9',
                          value: '27800',
                          propertyCode: 'SYS_CRT_USERID',
                          propertyName: '发起人',
                          businessType: 1,
                          subPropertyCode: '',
                          subPropertyName: '',
                          operationCode: 'eq',
                          operationName: '==',
                          operationDisplay: '等于',
                          data: {
                            id: '27800',
                            label: '关斌 / guanbin',
                            value: '27800'
                          },
                          showSub: true,
                          editOperation: true,
                          leaf: true,
                          subProperties: [],
                          label: ''
                        },
                        {
                          key: 'bpm0n06xpewbz6',
                          value: '选项1',
                          propertyCode: 'select_7cc996a2',
                          propertyName: '单选框`1',
                          businessType: 0,
                          subPropertyCode: '',
                          subPropertyName: '',
                          operationCode: 'eq',
                          operationName: '==',
                          operationDisplay: '等于',
                          data: { value: '选项1', label: '选项1' },
                          showSub: true,
                          editOperation: true,
                          leaf: true,
                          options: [{ value: '选项1', label: '选项1' }],
                          componentType: 'string',
                          componentName: 'Select',
                          label: ''
                        },
                        {
                          key: 'bpm0alv8fgszpjh',
                          value: '选项1',
                          propertyCode: 'select_7cc996a2',
                          propertyName: '单选框`1',
                          businessType: 0,
                          subPropertyCode: '',
                          subPropertyName: '',
                          operationCode: 'in',
                          operationName: 'in',
                          operationDisplay: '属于',
                          data: [{ value: '选项1', label: '选项1' }],
                          showSub: true,
                          editOperation: true,
                          leaf: true,
                          options: [{ value: '选项1', label: '选项1' }],
                          componentType: 'string',
                          componentName: 'Select',
                          label: ''
                        }
                      ]
                    },
                    {
                      key: 'bpm0bm48k0q42qh',
                      value: '选项1',
                      propertyCode: 'selectdd_43f33219',
                      propertyName: '多选框',
                      businessType: 0,
                      subPropertyCode: '',
                      subPropertyName: '',
                      operationCode: 'CT',
                      operationName: 'contains',
                      operationDisplay: '包含',
                      data: [{ value: '选项1', label: '选项1' }],
                      showSub: true,
                      editOperation: true,
                      leaf: true,
                      options: [{ value: '选项1', label: '选项1' }],
                      componentType: 'array',
                      componentName: 'SelectDD',
                      label: ''
                    }
                  ],
                  logical: 1,
                  exchangePriority: 0,
                  validateMessage: ''
                },
                resourceId: 'sid-A3010220-6C18-4058-B5B2-1BE22045E648',
                nodesCount: 3
              },
              {
                type: 'Task',
                option: {
                  title: '审批任务',
                  background: '#5b91fe',
                  overrideid: 'bpm0fa0vx3vlxhr',
                  curNodeIndex: [1, 0, 1],
                  priority: 0,
                  approvalGroup: {
                    approverType: '6',
                    selectedUsers: [],
                    approveType: 'ALL',
                    seriesType: '0',
                    seriesValue: '1',
                    formKey: 'people_89de8085',
                    formValue: 'CEO-2'
                  },
                  validateMessage: ''
                },
                resourceId: 'sid-EB5C4501-32F6-48EC-8BE3-8A4DD1578CC6',
                nodesCount: 3,
                next: {
                  resourceId: 'sid-A84D2BC2-7974-4FB4-954A-88C6B1E6DBED'
                },
                curNodeBoundsDeepIndex: 2,
                bounds: {
                  upperLeft: { x: 280, y: 0 },
                  lowerRight: { x: 380, y: 80 }
                }
              }
            ]
          },
          {
            type: 'Branch',
            child: [
              {
                type: 'Condition',
                option: {
                  title: '条件',
                  background: '#fff',
                  curNodeIndex: [1, 1, 0],
                  priority: 1,
                  conditions: [
                    {
                      key: 'bpm0lkod1w55mo',
                      value: '选项1',
                      propertyCode: 'select_df3098e4',
                      propertyName: '单选框',
                      businessType: 0,
                      subPropertyCode: '',
                      subPropertyName: '',
                      operationCode: 'eq',
                      operationName: '==',
                      operationDisplay: '等于',
                      data: { value: '选项1', label: '选项1' },
                      showSub: true,
                      editOperation: true,
                      leaf: true,
                      options: [{ value: '选项1', label: '选项1' }],
                      componentType: 'string',
                      componentName: 'Select',
                      label: ''
                    }
                  ],
                  logical: 1,
                  exchangePriority: 1,
                  validateMessage: ''
                },
                resourceId: 'sid-248AE89B-8AA9-4094-BEB2-A6E6CDE37348',
                nodesCount: 3
              },
              {
                type: 'Gateway',
                option: { curNodeIndex: [1, 1, 1], priority: 1 },
                resourceId: 'sid-C45AA390-A629-421F-B3D3-D82F00A0597F',
                child: [
                  {
                    type: 'Branch',
                    child: [
                      {
                        type: 'Condition',
                        option: {
                          title: '条件',
                          background: '#fff',
                          curNodeIndex: [1, 1, 1, 0, 0],
                          priority: 0,
                          conditions: [
                            {
                              key: 'bpm0aonhr0rldgu',
                              value: '选项1',
                              propertyCode: 'selectdd_43f33219',
                              propertyName: '多选框',
                              businessType: 0,
                              subPropertyCode: '',
                              subPropertyName: '',
                              operationCode: 'CT',
                              operationName: 'contains',
                              operationDisplay: '包含',
                              data: [{ value: '选项1', label: '选项1' }],
                              showSub: true,
                              editOperation: true,
                              leaf: true,
                              options: [{ value: '选项1', label: '选项1' }],
                              componentType: 'array',
                              componentName: 'SelectDD',
                              label: ''
                            }
                          ],
                          logical: 1,
                          exchangePriority: 0,
                          validateMessage: ''
                        },
                        resourceId: 'sid-7693A5A2-F171-4968-94A3-E56C65402DA9',
                        nodesCount: 2
                      },
                      {
                        type: 'Task',
                        option: {
                          title: '审批任务',
                          background: '#5b91fe',
                          overrideid: 'bpm0m38or98vdeh',
                          curNodeIndex: [1, 1, 1, 0, 1],
                          priority: 0,
                          approvalGroup: {
                            approverType: '6',
                            selectedUsers: [],
                            approveType: 'ALL',
                            seriesType: '0',
                            seriesValue: '1',
                            formKey: 'people_89de8085',
                            formValue: 'CEO-2'
                          },
                          ccGroups: [
                            {
                              approverType: '6',
                              selectedUsers: [],
                              formKey: 'people_89de8085',
                              formValue: 'CEO-2'
                            }
                          ],
                          validateMessage: ''
                        },
                        resourceId: 'sid-D6FA88F0-FD46-4F85-BBDA-FBD2FEF81F62',
                        nodesCount: 2,
                        next: {
                          resourceId: 'sid-C9C8235F-1A10-4CF3-B4AB-1CA66009F1EE'
                        },
                        curNodeBoundsDeepIndex: 3,
                        bounds: {
                          upperLeft: { x: 420, y: 0 },
                          lowerRight: { x: 520, y: 80 }
                        }
                      }
                    ]
                  },
                  {
                    type: 'Branch',
                    child: [
                      {
                        type: 'Condition',
                        option: {
                          title: '默认',
                          background: '#fff',
                          default: true,
                          curNodeIndex: [1, 1, 1, 1, 0],
                          priority: 1,
                          validateMessage: ''
                        },
                        resourceId: 'sid-6FACE4CF-4BDD-467E-A561-CB99D5DAEF34',
                        nodesCount: 2
                      },
                      {
                        type: 'Task',
                        option: {
                          title: '审批任务',
                          background: '#5b91fe',
                          overrideid: 'bpm01qxao1bdie8',
                          curNodeIndex: [1, 1, 1, 1, 1],
                          priority: 1,
                          approvalGroup: {
                            approverType: '0',
                            selectedUsers: [],
                            approveType: 'ALL',
                            seriesType: '0',
                            seriesValue: '1'
                          },
                          validateMessage: ''
                        },
                        resourceId: 'sid-00BEDE75-8129-44D7-9B94-8DF101CE7594',
                        nodesCount: 2,
                        next: {
                          resourceId: 'sid-C9C8235F-1A10-4CF3-B4AB-1CA66009F1EE'
                        },
                        curNodeBoundsDeepIndex: 3,
                        bounds: {
                          upperLeft: { x: 420, y: 100 },
                          lowerRight: { x: 520, y: 180 }
                        }
                      }
                    ]
                  }
                ],
                nodesCount: 3,
                curNodeBoundsDeepIndex: 2,
                next: {
                  resourceId: 'sid-C9C8235F-1A10-4CF3-B4AB-1CA66009F1EE'
                },
                curFlowableIndex: 7,
                bounds: {
                  upperLeft: { x: 310, y: 120 },
                  lowerRight: { x: 350, y: 160 }
                }
              },
              {
                type: 'Task',
                option: {
                  overrideid: 'bpm09cd0z40asb9',
                  title: '审批任务',
                  background: '#5b91fe',
                  curNodeIndex: [1, 1, 2],
                  priority: 1,
                  approvalGroup: {
                    approverType: '0',
                    selectedUsers: [],
                    approveType: 'ALL',
                    seriesType: '0',
                    seriesValue: '1'
                  },
                  validateMessage: ''
                },
                resourceId: 'sid-C9C8235F-1A10-4CF3-B4AB-1CA66009F1EE',
                nodesCount: 3,
                next: {
                  resourceId: 'sid-A84D2BC2-7974-4FB4-954A-88C6B1E6DBED'
                },
                curNodeBoundsDeepIndex: 4,
                bounds: {
                  upperLeft: { x: 560, y: 0 },
                  lowerRight: { x: 660, y: 80 }
                }
              }
            ]
          },
          {
            type: 'Branch',
            child: [
              {
                type: 'Condition',
                option: {
                  title: '默认',
                  background: '#fff',
                  default: true,
                  curNodeIndex: [1, 2, 0],
                  priority: 2,
                  validateMessage: ''
                },
                resourceId: 'sid-56700E22-ED35-4F1F-905C-F48BB4B1A14D',
                nodesCount: 3
              },
              {
                type: 'Task',
                option: {
                  title: '审批任务',
                  background: '#5b91fe',
                  overrideid: 'bpm0chpu4g8r8kb',
                  curNodeIndex: [1, 2, 1],
                  priority: 2,
                  validateMessage: '',
                  approvalGroup: {
                    approverType: '0',
                    selectedUsers: [],
                    approveType: 'ALL',
                    seriesType: '0',
                    seriesValue: '1'
                  }
                },
                resourceId: 'sid-BDD750AA-A80C-436F-A45D-01CAF2E8D0F7',
                nodesCount: 3,
                next: {
                  resourceId: 'sid-A84D2BC2-7974-4FB4-954A-88C6B1E6DBED'
                },
                curNodeBoundsDeepIndex: 2,
                bounds: {
                  upperLeft: { x: 280, y: 200 },
                  lowerRight: { x: 380, y: 280 }
                }
              }
            ]
          }
        ],
        curNodeBoundsDeepIndex: 1,
        next: { resourceId: 'sid-A84D2BC2-7974-4FB4-954A-88C6B1E6DBED' },
        curFlowableIndex: 2,
        bounds: { upperLeft: { x: 170, y: 20 }, lowerRight: { x: 210, y: 60 } }
      },
      {
        type: 'Task',
        option: {
          title: '审批任务',
          background: '#5b91fe',
          overrideid: 'bpm0vsit2t8vvr9',
          curNodeIndex: [2],
          approvalGroup: {
            approverType: '6',
            selectedUsers: [],
            approveType: 'ALL',
            seriesType: '0',
            seriesValue: '1',
            formKey: 'people_89de8085',
            formValue: 'HRBPHEAD'
          },
          ccGroups: [
            {
              approverType: '6',
              formKey: 'people_cc8299',
              formValue: 'HRBPHEAD'
            }
          ],
          validateMessage: ''
        },
        resourceId: 'sid-A84D2BC2-7974-4FB4-954A-88C6B1E6DBED',
        curNodeBoundsDeepIndex: 5,
        bounds: { upperLeft: { x: 700, y: 0 }, lowerRight: { x: 800, y: 80 } }
      },
      {
        type: 'End',
        option: { curNodeIndex: [3] },
        resourceId: 'sid-A0A08F41-5EE3-446D-ACA2-7C2AD916DA38',
        curNodeBoundsDeepIndex: 6,
        bounds: { upperLeft: { x: 876, y: 26 }, lowerRight: { x: 904, y: 54 } }
      }
    ];
  };

  describe('test findNodesByPropertyCodes', () => {
    beforeEach(() => {
      process = initProcess();
    });

    test('当 process 是空时(边界判断)', () => {
      expect(findNodesByPropertyCodes('select_7cc996a2', null).length).toBe(0);
      expect(findNodesByPropertyCodes('不存在的属性', process).length).toBe(0);
    });

    test('当 property 在 condition 节点时,找出 condition 节点', () => {
      expect(findNodesByPropertyCodes('select_7cc996a2', process).length).toBe(
        1
      );
    });

    test('当 property 在 task 节点时，准确找出 task 节点', () => {
      expect(findNodesByPropertyCodes('people_89de8085', process).length).toBe(
        3
      );
    });

    test('当 task 节点有抄送组时', () => {
      expect(findNodesByPropertyCodes('people_cc8299', process).length).toBe(1);
    });
  });

  describe('test getFormComponentList', () => {
    test('获得条件表单列表', () => {
      const allComponent = [
        {
          id: 'people_138bd2ce',
          componentName: 'People',
          props: {
            label: '联系人',
            layout: 'VERTICAL',
            showLabel: true,
            placeholder: '输入人员名称/mis',
            validation: [
              {
                type: 'required',
                value: true,
                message: '',
                param: '',
                text: '必填'
              }
            ],
            fieldId: 'people_138bd2ce',
            highlight: false,
            styleMaxWidth: { value: 450 },
            required: true
          },
          children: [],
          parentInstanceKey: 'jimuroot_d95c7e0a'
        }
      ];

      const componentList = [
        {
          id: 'people_138bd2ce',
          componentName: 'People',
          props: {
            label: '联系人',
            layout: 'VERTICAL',
            showLabel: true,
            placeholder: '输入人员名称/mis',
            validation: [
              {
                type: 'required',
                value: true,
                message: '',
                param: '',
                text: '必填'
              }
            ],
            fieldId: 'people_138bd2ce',
            highlight: false,
            styleMaxWidth: { value: 450 },
            required: true
          },
          children: [],
          parentInstanceKey: 'jimuroot_d95c7e0a'
        }
      ];
      const conditionComponentList = [
        {
          id: 'people_138bd2ce',
          label: '联系人',
          type: 'people',
          required: true,
          componentName: 'People'
        }
      ];
      expect(getFormComponentList(allComponent)).toMatchObject({
        componentList,
        conditionComponentList
      });
    });
  });

  describe('test removeProperties', () => {
    beforeEach(() => {
      process = initProcess();
    });

    test('边界 removeProperties输入为空', () => {
      expect(removeProperties([], [])).not.toBeDefined();
    });

    test('当需要移除 condition 节点的属性时，只删除 condition 节点', () => {
      const removeKey = 'select_7cc996a2';

      expect(JSON.stringify(process).indexOf('people_89de8085')).not.toBe(-1);
      expect(JSON.stringify(process).indexOf(removeKey)).toBeGreaterThanOrEqual(
        0
      );
      removeProperties(removeKey, process);
      expect(JSON.stringify(process).indexOf(removeKey)).toBe(-1);
      expect(JSON.stringify(process).indexOf('people_89de8085')).not.toBe(-1);
    });

    test('当删除 condition 里的节点属性时，不影响 condition 节点里其他属性', () => {
      const removeKey = 'select_df3098e4';
      const reserveKey = 'select_7cc996a2';

      expect(JSON.stringify(process).indexOf(reserveKey)).not.toBe(-1);
      expect(JSON.stringify(process).indexOf(removeKey)).toBeGreaterThanOrEqual(
        0
      );
      removeProperties(removeKey, process);
      expect(JSON.stringify(process).indexOf(removeKey)).toBe(-1);
      expect(JSON.stringify(process).indexOf(reserveKey)).not.toBe(-1);
    });

    test('当删除 task 节点时，不影响其他节点', () => {
      const removeKey = 'people_89de8085';
      const reserveKey = 'select_7cc996a2';

      expect(JSON.stringify(process).indexOf(reserveKey)).not.toBe(-1);
      expect(JSON.stringify(process).indexOf(removeKey)).toBeGreaterThanOrEqual(
        0
      );
      removeProperties(removeKey, process);
      expect(JSON.stringify(process).indexOf(removeKey)).toBe(-1);
      expect(JSON.stringify(process).indexOf(reserveKey)).not.toBe(-1);
    });
  });

  describe('test buildTaskDescription', () => {
    test('发起人的 CEO - N', () => {
      const approvalGroup = {
        approverType: '0',
        seriesType: '5',
        seriesValue: '-2'
      };
      expect(buildTaskDescription(approvalGroup)).toBe(
        `发起人的第 CEO${approvalGroup.seriesValue}`
      );
    });
    test('发起人的 CEO - N', () => {
      const approvalGroup = {
        approverType: '0',
        seriesType: '0',
        seriesValue: '-2'
      };
      expect(buildTaskDescription(approvalGroup)).toBe(
        `发起人的第 ${approvalGroup.seriesValue} 级主管`
      );
    });
    test('发起人部门', () => {
      const approvalGroup = {
        approverType: '1',
        seriesValue: 'X3A'
      };

      expect(buildTaskDescription(approvalGroup)).toBe(
        `发起人所在的 ${approvalGroup.seriesValue} 级部门负责人`
      );

      expect(
        buildTaskDescription({
          approverType: '1',
          seriesValue: '-2'
        })
      ).toBe(`发起人所在的 美团-2级部门负责人`);
    });

    test('指定成员', () => {
      const approvalGroup = {
        approverType: '2'
      };
      expect(buildTaskDescription(approvalGroup)).toBe(`指定成员`);
    });

    test('HRBP', () => {
      const approvalGroup = {
        approverType: '4'
      };
      expect(buildTaskDescription(approvalGroup)).toBe(`发起人的 HRBP`);
    });

    test('请选择审批人', () => {
      const approvalGroup = {};
      expect(buildTaskDescription(approvalGroup)).toBe(`请选择审批人`);
    });

    test('表单联系人', () => {
      const approvalGroup = {
        approverType: '6',
        formValue: 'FAWU',
        formKey: 'people_73bb3972'
      };

      expect(buildTaskDescription(approvalGroup)).toBe(
        `表单内控件 对应的 ${FORM_PEOPLE_ROLES[approvalGroup.formValue]}`
      );

      expect(
        buildTaskDescription(approvalGroup, [
          {
            label: '测试组件',
            id: 'people_73bb3972'
          }
        ])
      ).toBe(`测试组件 对应的 ${FORM_PEOPLE_ROLES[approvalGroup.formValue]}`);
    });

    describe('逐级审批', () => {
      test('逐级审批至主管', () => {
        const approvalGroup = {
          approverType: '3',
          seriesType: '0',
          seriesValue: '3'
        };
        expect(buildTaskDescription(approvalGroup)).toBe(
          `逐级审批到发起人的第 ${approvalGroup.seriesValue} 级主管`
        );
      });

      test('逐级审批至部门负责人', () => {
        const approvalGroup = {
          approverType: '3',
          seriesValue: 'X2'
        };
        expect(buildTaskDescription(approvalGroup)).toBe(
          `逐级审批到发起人所在的 ${approvalGroup.seriesValue} 级部门负责人`
        );
      });
    });
  });

  describe('test buildConditionDescription', () => {
    test('condition', () => {
      const item = {
        conditions: [
          {
            businessType: 1,
            data: { id: '6286906', value: 'zzz', label: 'xxx' },
            leaf: true,
            operationCode: 'eq',
            operationDisplay: '等于',
            operationName: '==',
            propertyCode: 'SYS_CRT_USERID',
            propertyName: '制单人',
            value: '6286906'
          }
        ],
        logical: 1,
        leaf: false,
        curNodeIndex: [1, 0, 0],
        priority: 0
      };
      expect(buildConditionDescription(item)).toBe('制单人等于xxx');
    });

    test('嵌套结构', () => {
      const item = {
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
                data: {
                  label: '选项1',
                  value: '选项1',
                  id: '选项1'
                },
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
              }
            ],
            leaf: false,
            logical: 1
          }
        ],
        logical: 2,
        leaf: false,
        curNodeIndex: [1, 2, 0],
        priority: 2
      };

      expect(buildConditionDescription(item)).toBe(
        '制单人等于管秉昌 且 数字输入框等于2222 或 单选框等于选项1 或 制单人部门不等于美团/到店事业群/充电宝业务部/线上合作商根结点/fengqiyi个人企业认证'
      );
    });
  });

  describe('test validateNode', () => {
    test('请选择条件节点', () => {
      const type = 'Condition';
      const option = {
        title: '条件',
        background: '#fff',
        curNodeIndex: [1, 0, 0],
        priority: 0
      };
      expect(validateNode(type, option)).toBe('请选择条件节点');
    });

    test('请设置审批节点', () => {
      const type = 'Task';
      const option = {
        title: '审批任务',
        background: '#5b91fe',
        overrideid: 'bpm0ra6wyudqnn9',
        curNodeIndex: [1, 0, 1],
        priority: 0
      };
      expect(validateNode(type, option)).toBe('请设置审批节点');
    });
  });

  describe('test validateForm', () => {
    test('请选择至少配置一个表单控件', () => {
      const nodes = [
        {
          id: 'jimuroot_d95c7e0a',
          componentName: 'JimuRoot',
          curValidationStatus: true,
          props: { fieldId: 'jimuroot_d95c7e0a' }
        }
      ];
      expect(validateForm(nodes)).toMatchObject([
        { type: 'form', validateMessage: '请选择至少配置一个表单控件' }
      ]);
    });
  });

  describe('test validateProcess', () => {
    test('validateProcess', () => {
      const nodes = [
        {
          type: 'Start',
          option: { curNodeIndex: [0] },
          resourceId: 'sid-8F69A428-0958-495C-B23C-F044109CFE51',
          curNodeBoundsDeepIndex: 0,
          bounds: { upperLeft: { x: 35, y: 25 }, lowerRight: { x: 65, y: 55 } }
        },
        {
          type: 'Task',
          option: {
            overrideid: 'bpm0cra5vwzkbgq',
            title: '审批任务',
            background: '#5b91fe',
            curNodeIndex: [1]
          },
          resourceId: 'sid-342E664F-7ACA-4D54-8E2B-FB66B54269CE'
        },
        {
          type: 'End',
          option: { curNodeIndex: [2] },
          resourceId: 'sid-5066779E-0A55-4BB4-8E12-F7ABE773294F',
          curNodeBoundsDeepIndex: 1,
          bounds: {
            upperLeft: { x: 176, y: 26 },
            lowerRight: { x: 204, y: 54 }
          }
        }
      ];
      expect(validateProcess(nodes)).toMatchObject([
        { validateMessage: '请设置审批节点', type: 'process' }
      ]);
      expect(validateProcess([])).toMatchObject([
        { validateMessage: '请选择审批节点', type: 'process' }
      ]);
    });
  });

  describe('test isReachableNode', () => {
    test('审批节点更短时', () => {
      expect(isReachableNode([1, 2, 1], [1, 1, 1, 0, 0])).toBe(false);
      expect(isReachableNode([1, 2, 1], [1, 1, 1, 1, 0])).toBe(false);
      expect(isReachableNode([2, 1, 2], [2, 1, 3, 0, 0])).toBe(false);

      expect(isReachableNode([2], [1, 0, 0])).toBe(true);
      expect(isReachableNode([2], [1, 1, 0])).toBe(true);
      expect(isReachableNode([2], [1, 0, 1, 1, 0])).toBe(true);
    });
    test('同层级判断', () => {
      expect(isReachableNode([1, 1, 1, 0, 1], [1, 1, 1, 0, 0])).toBe(true);
      expect(isReachableNode([1, 0], [2, 0])).toBe(false);
      expect(isReachableNode([1, 2, 1], [1, 1, 0])).toBe(false);
      expect(isReachableNode([1, 1, 0], [2, 1, 1])).toBe(false);
      expect(isReachableNode([2, 1, 0], [1, 1, 1])).toBe(true);
    });
    test('条件节点更短', () => {
      expect(isReachableNode([2, 1, 3, 0, 1], [2, 0, 0])).toBe(false);
      expect(isReachableNode([2, 1, 3, 0, 1], [])).toBe(false);
      expect(isReachableNode([1, 1, 1, 0, 1], [1, 1, 0])).toBe(true);
      expect(isReachableNode([2, 1, 0], [1, 1, 1, 0, 1])).toBe(true);
      expect(isReachableNode([2, 0, 1, 0, 1], [2, 0, 1, 0, 0])).toBe(true);
    });
  });
});

describe('表单方法测试', () => {
  let form;
  const initForm = () => {
    return JSON.parse(
      '{"schemaVersion":"2.0.0","schemaType":"积木低代码schema协议","pages":[{"id":"FORM-F1866AD13MZIV0J81FX0F72MEQWJ2SNNBHMEKA","layout":{"id":"jimuroot_5e64e8a5","componentName":"JimuRoot","props":{"fieldId":"jimuroot_5e64e8a5"},"children":[{"id":"card_59ddc103","componentName":"Card","props":{"title":"分组卡片","layoutPC":"VERTICAL","layoutMOBILE":"HORIZONTAL","fieldId":"card_59ddc103"},"children":[{"id":"card_dfaec987","componentName":"Card","props":{"title":"分组卡片","layoutPC":"VERTICAL","layoutMOBILE":"HORIZONTAL","fieldId":"card_dfaec987"},"children":[{"id":"people_c28090ff","componentName":"People","props":{"label":"联系人","layout":"VERTICAL","showLabel":true,"placeholder":"输入人员名称/mis","validation":[{"type":"required","value":true,"message":"","param":"","text":"必填"}],"fieldId":"people_c28090ff","highlight":false,"styleMaxWidth":{"value":450},"required":true},"children":[],"parentInstanceKey":"card_dfaec987"},{"id":"card_ac7b6d9a","componentName":"Card","props":{"title":"分组卡片","layoutPC":"VERTICAL","layoutMOBILE":"HORIZONTAL","fieldId":"card_ac7b6d9a"},"children":[{"id":"card_84d1cc74","componentName":"Card","props":{"title":"分组卡片","layoutPC":"VERTICAL","layoutMOBILE":"HORIZONTAL","fieldId":"card_84d1cc74"},"children":[{"id":"card_4c86852f","componentName":"Card","props":{"title":"分组卡片","layoutPC":"VERTICAL","layoutMOBILE":"HORIZONTAL","fieldId":"card_4c86852f"},"children":[{"id":"people_1ed6b33a","componentName":"People","props":{"label":"联系人222","layout":"VERTICAL","showLabel":true,"placeholder":"输入人员名称/mis","validation":[{"type":"required","value":true,"message":"","param":"","text":"必填"}],"fieldId":"people_1ed6b33a","highlight":false,"styleMaxWidth":{"value":450},"required":true},"children":[],"parentInstanceKey":"card_4c86852f"}],"parentInstanceKey":"card_84d1cc74"}],"parentInstanceKey":"card_ac7b6d9a"}],"parentInstanceKey":"card_dfaec987"}],"parentInstanceKey":"card_59ddc103"}],"parentInstanceKey":"jimuroot_5e64e8a5"}],"parentInstanceKey":null},"dataSource":{"online":[]}}],"action":{"source":"\\n/**\\n  * 私有的，可复用的函数\\n  * 函数面板帮助文档: \\n  * @see \\n  */\\nexport function helloWorld(obj) {\\n  console.info(obj);\\n}","type":"FUNCTION","list":[]}}'
    );
  };

  describe('test findAllChildrenByInstanceKey', () => {
    beforeEach(() => {
      form = initForm();
    });

    test('当查找一个叶子节点，返回空', () => {
      expect(findAllChildrenByInstanceKey(form, 'people_1ed6b33a').length).toBe(
        0
      );
    });

    test('当随便输入一个节点，返回空数组', () => {
      expect(findAllChildrenByInstanceKey(form, '不存在的节点').length).toBe(0);
    });

    test('当 form 为空对象时', () => {
      expect(findAllChildrenByInstanceKey(null, 'card_59ddc103')).toBeDefined();
    });

    test('当 form 为空对象时1', () => {
      expect(
        findAllChildrenByInstanceKey(
          {
            schemaVersion: '2.0.0',
            schemaType: '积木低代码schema协议',
            pages: [
              {
                id: 'FORM-F1866AD13MZIV0J81FX0F72MEQWJ2SNNBHMEKA',
                layout: {
                  children: ['', '']
                }
              }
            ]
          },
          'card_59ddc103'
        )
      ).toMatchObject([]);
    });

    test('通过 instanceKey 找到 form 的节点', () => {
      expect(findAllChildrenByInstanceKey(form, 'card_84d1cc74')).toBeDefined();
    });

    test('当 People 组件嵌套在 Card 组件里, 可以被找出', () => {
      const expectedArray = ['people_c28090ff', 'people_1ed6b33a'];
      const parentKey = 'card_59ddc103';

      expect(findAllChildrenByInstanceKey(form, parentKey)).toEqual(
        expect.arrayContaining(expectedArray)
      );
    });
  });

  describe('test convertApprovalGroupToForm', () => {
    test('HRBP', () => {
      const approvalGroup = {
        inputType: 'DYNAMIC',
        groupType: 'DEPARTMENT_CHAIN',
        outputType: 'DEPARTMENT_HRBP',
        filterField: 'DEPARTMENT_LEVEL',
        filterValue: '0',
        inputKey: 'people_123123'
      };
      const { formValue, entityType } = convertApprovalToForm(approvalGroup);
      expect(formValue).toBe(APPROVEFORMROLE.HRBP);
      expect(entityType).toBe(EntityTypeEnum.USER);
    });

    test('HRBPHEAD', () => {
      const approvalGroup = {
        inputType: 'DYNAMIC',
        groupType: 'DEPARTMENT_CHAIN',
        outputType: 'DEPARTMENT_HRBP',
        filterField: 'DEPARTMENT_GRADE',
        filterValue: 'X4',
        inputKey: 'department_123123'
      };
      const { formValue, entityType } = convertApprovalToForm(approvalGroup);
      expect(formValue).toBe(APPROVEFORMROLE.HRBPHEAD);
      expect(entityType).toBe(EntityTypeEnum.DEPARTMENT);
    });

    test('LEADER', () => {
      const approvalGroup = {
        inputType: 'DYNAMIC',
        groupType: 'REPORT_CHAIN',
        choiceType: 'FIRST',
        filterField: 'REPORT_CHAIN_LEVEL',
        filterValue: '1'
      };
      expect(convertApprovalToForm(approvalGroup).formValue).toBe(
        APPROVEFORMROLE.LEADER
      );
    });

    test('FAWU', () => {
      const approvalGroup = {
        inputType: 'DYNAMIC',
        groupType: 'FAWU',
        inputKey: ''
      };
      const { formValue, entityType } = convertApprovalToForm(approvalGroup);

      expect(formValue).toBe(APPROVEFORMROLE.FAWU);
      expect(entityType).toBe(EntityTypeEnum.UNKNOW);
    });

    test('ER', () => {
      const approvalGroup = {
        inputType: 'DYNAMIC',
        groupType: 'ER',
        inputKey: '333'
      };

      const { formValue, entityType } = convertApprovalToForm(approvalGroup);

      expect(formValue).toBe(APPROVEFORMROLE.ER);
      expect(entityType).toBe(EntityTypeEnum.UNKNOW);
    });

    test('CEOMinusTwo', () => {
      const approvalGroup = {
        inputType: 'DYNAMIC',
        groupType: 'REPORT_CHAIN',
        choiceType: 'FIRST',
        filterField: 'OA_GRADE',
        filterValue: 'CEO',
        levelOffset: '-2'
      };
      expect(convertApprovalToForm(approvalGroup).formValue).toBe(
        APPROVEFORMROLE.CEOMinusTwo
      );
    });

    test('CEOMinusOne', () => {
      const approvalGroup = {
        inputType: 'DYNAMIC',
        groupType: 'REPORT_CHAIN',
        choiceType: 'FIRST',
        filterField: 'OA_GRADE',
        filterValue: 'CEO',
        levelOffset: '-1'
      };
      expect(convertApprovalToForm(approvalGroup).formValue).toBe(
        APPROVEFORMROLE.CEOMinusOne
      );
    });

    test('RECRUITER_LEADER', () => {
      const approvalGroup = {
        inputType: 'DYNAMIC',
        groupType: 'RECRUITER_LEADER'
      };
      expect(convertApprovalToForm(approvalGroup).formValue).toBe(
        APPROVEFORMROLE.RECRUITER_LEADER
      );
    });
  });

  describe('test getFormRoles', () => {
    test('getFormRoles-RECRUITER_LEADER', () => {
      const approvalGroup = {
        formKey: 'department_b6624c5c',
        formValue: 'RECRUITER_LEADER'
      };
      expect(getFormRoles(approvalGroup)).toBe('招聘Leader');
    });
  });

  describe('test convertApprovalToData', () => {
    test('task === undefined', () => {
      expect(convertApprovalToData({})).toMatchObject({});
    });
    test('STEPBYSTEP REPORT_CHAIN_LEVEL', () => {
      const task = {
        approverType: APPROVERTYPE.STEPBYSTEP,
        seriesType: APPROVERTYPE.LEADER
      };
      expect(convertApprovalToData(task).filterField).toBe(
        'REPORT_CHAIN_LEVEL'
      );
    });

    test('SPECIFY', () => {
      const task = {
        approverType: APPROVERTYPE.SPECIFY,
        selectedUsers: [{ id: '6286906', label: 'xxx', value: 'zzz' }]
      };

      const params = {
        inputType: 'STATIC',
        groupType: 'EMPLOYEE',
        users: [6286906]
      };
      expect(convertApprovalToData(task)).toMatchObject(params);
    });
    test('回传 ER', () => {
      const task = {
        approverType: APPROVERTYPE.FORM_MEMBER,
        formValue: APPROVEFORMROLE.ER
      };
      expect(convertApprovalToData(task).groupType).toBe(GroupTypeEnum.ER);
    });

    test('回传 LEADER', () => {
      const task = {
        approverType: APPROVERTYPE.FORM_MEMBER,
        formValue: APPROVEFORMROLE.LEADER
      };

      const params = {
        groupType: GroupTypeEnum.REPORT_CHAIN,
        filterField: ReportChainTypeEnum.REPORT_CHAIN_LEVEL,
        filterValue: '1',
        choiceType: ChoiceTypeEnum.FIRST
      };
      expect(convertApprovalToData(task)).toMatchObject(params);
    });

    test('回传 HRBP', () => {
      const task = {
        approverType: APPROVERTYPE.FORM_MEMBER,
        formValue: APPROVEFORMROLE.HRBP
      };

      const params = {
        groupType: GroupTypeEnum.DEPARTMENT_CHAIN,
        outputType: OutputTypeEnum.DEPARTMENT_HRBP,
        filterField: ReportChainTypeEnum.DEPARTMENT_LEVEL,
        filterValue: '0'
      };
      expect(convertApprovalToData(task)).toMatchObject(params);
    });

    test('回传 CEOMinusTwo', () => {
      const task = {
        approverType: APPROVERTYPE.FORM_MEMBER,
        formValue: APPROVEFORMROLE.CEOMinusTwo
      };

      const params = {
        groupType: GroupTypeEnum.REPORT_CHAIN,
        filterField: ReportChainTypeEnum.OA_GRADE,
        filterValue: 'CEO',
        choiceType: ChoiceTypeEnum.FIRST,
        levelOffset: '-2'
      };
      expect(convertApprovalToData(task)).toMatchObject(params);
    });

    test('回传 RECRUITER_LEADER', () => {
      const task = {
        approverType: APPROVERTYPE.FORM_MEMBER,
        formValue: APPROVEFORMROLE.RECRUITER_LEADER
      };
      expect(convertApprovalToData(task).groupType).toBe(
        GroupTypeEnum.RECRUITER_LEADER
      );
    });
  });

  describe('test convertConditionToForm', () => {
    test('conditions为空', () => {
      expect(convertConditionToForm([])).not.toBeDefined();
    });
    test('针对 1 发起人类型，处理data', () => {
      const conditions = [
        {
          businessType: 1,
          data: [{ code: 'zzz', dataId: '6286906', name: 'xxx' }],
          leaf: true,
          operationCode: 'eq',
          operationDisplay: '等于',
          operationName: '==',
          propertyCode: 'SYS_CRT_USERID',
          propertyName: '制单人',
          value: '6286906'
        }
      ];

      convertConditionToForm(conditions);
      expect(conditions[0].data).toMatchObject({
        id: '6286906',
        value: 'zzz',
        label: 'xxx'
      });
    });

    test('针对 2 发起人部门，处理data', () => {
      const conditions = [
        {
          businessType: 2,
          data: [
            {
              dataId: '20061053',
              seriesName: '美团/优选事业部/零售代理商/ymtest'
            }
          ],
          leaf: true
        }
      ];

      convertConditionToForm(conditions);
      expect(conditions[0].data).toMatchObject({
        id: '20061053',
        label: '美团/优选事业部/零售代理商/ymtest',
        value: '20061053'
      });
    });

    test('select', () => {
      const condition = [
        {
          businessType: 0,
          data: [],
          leaf: true,
          operationCode: 'eq',
          operationDisplay: '等于',
          operationName: '==',
          propertyCode: 'select_00e6a3f9',
          propertyName: '单选框',
          value: '选项1'
        }
      ];
      convertConditionToForm(condition);
      expect(condition[0].data).toMatchObject({
        id: '选项1',
        label: '选项1',
        value: '选项1'
      });
    });

    test('condition 有子节点时', () => {
      const conditions = [
        {
          businessType: 1,
          data: [{ code: 'guanbingchang', dataId: '6011957', name: '管秉昌' }],
          leaf: true,
          operationCode: 'ne',
          operationDisplay: '不等于',
          operationName: '!=',
          propertyCode: 'SYS_CRT_USERID',
          propertyName: '制单人',
          value: '6011957'
        },
        {
          conditions: [
            {
              businessType: 2,
              data: [
                {
                  dataId: '20042378',
                  seriesName:
                    '美团/优选事业部/零售代理商/合规与综合支持部/商品品质管理中心/空/品质检控组/全国RDC仓/太原仓（没有RDC太原'
                }
              ],
              leaf: true,
              operationCode: 'eq',
              operationDisplay: '等于',
              operationName: '==',
              propertyCode: 'SYS_CRT_DEPTID',
              propertyName: '制单人部门',
              value: '20042378'
            },
            {
              businessType: 1,
              data: [
                { code: 'yxw_tuanzifen', dataId: '800012346', name: '团子奋' }
              ],
              leaf: true,
              operationCode: 'eq',
              operationDisplay: '等于',
              operationName: '==',
              propertyCode: 'SYS_CRT_USERID',
              propertyName: '制单人',
              value: '800012346'
            }
          ],
          leaf: false,
          logical: 1
        }
      ];
      convertConditionToForm(conditions);

      expect(conditions).toMatchObject([
        {
          businessType: 1,
          data: { id: '6011957', value: 'guanbingchang', label: '管秉昌' },
          leaf: true,
          operationCode: 'ne',
          operationDisplay: '不等于',
          operationName: '!=',
          propertyCode: 'SYS_CRT_USERID',
          propertyName: '发起人',
          value: '6011957'
        },
        {
          conditions: [
            {
              businessType: 2,
              data: {
                id: '20042378',
                value: '20042378',
                label:
                  '美团/优选事业部/零售代理商/合规与综合支持部/商品品质管理中心/空/品质检控组/全国RDC仓/太原仓（没有RDC太原'
              },
              leaf: true,
              operationCode: 'eq',
              operationDisplay: '等于',
              operationName: '==',
              propertyCode: 'SYS_CRT_DEPTID',
              propertyName: '发起人部门',
              value: '20042378'
            },
            {
              businessType: 1,
              data: {
                id: '800012346',
                value: 'yxw_tuanzifen',
                label: '团子奋'
              },
              leaf: true,
              operationCode: 'eq',
              operationDisplay: '等于',
              operationName: '==',
              propertyCode: 'SYS_CRT_USERID',
              propertyName: '发起人',
              value: '800012346'
            }
          ],
          leaf: false,
          logical: 1
        }
      ]);
    });
  });

  describe('[snapshot]test convertFormToData', () => {
    test('快照测试', () => {
      form = JSON.parse(
        '{"approvalInfo":{"approvalAppId":"", "approvalName":"", "summary":"", "iconUrl":"https://p1.meituan.net/travelcube/d490e0fa4a9bd4f2a346393291d3b97c1933.png","cid":"1","visible":1,"category": "", "responseDept": {"id": "", "name": ""}, "responsePerson": {"id": "", "name": ""}, "coverage":"", "businessDesc":"", "purpose":"", "showInSubmitList":3, "processStarters":{"all": true, "userDeptForm":[]}, "processManagers":[{"value":"6011957", "label": "xxx", "avatar":"https://s3plus-img.meituan.net/v1/mss_491cda809310478f898d7e10a9bb68ec/profile9/89ce36a0-f0b6-4810-8fcb-4009210aef0d", "type": "user"}]},"approvalMoreSetting":{"messageSetting":{"PENDING":{"fields":[],"fastApprove":true},"APPROVED":{"fields":[],"fastApprove":false},"REJECTED":{"fields":[],"fastApprove":false},"WITHDREW":{"fields":[],"fastApprove":false},"CC":{"fields":[],"fastApprove":false}}},"form":"{\\"schemaVersion\\":\\"2.0.0\\",\\"schemaType\\":\\"积木低代码schema协议\\",\\"pages\\":[{\\"id\\":\\"FORM-F1866AD13MZIV0J81FX0F72MEQWJ2SNNBHMEKA\\",\\"layout\\":{\\"id\\":\\"jimuroot_a84525b4\\",\\"componentName\\":\\"JimuRoot\\",\\"props\\":{\\"fieldId\\":\\"jimuroot_a84525b4\\"},\\"children\\":[{\\"id\\":\\"input_a9c0090b\\",\\"componentName\\":\\"Input\\",\\"props\\":{\\"label\\":\\"单行文本输入\\",\\"layout\\":\\"VERTICAL\\",\\"showLabel\\":true,\\"placeholder\\":\\"输入文本\\",\\"validation\\":[{\\"type\\":\\"required\\",\\"value\\":true,\\"message\\":\\"\\",\\"param\\":\\"\\",\\"text\\":\\"必填\\"}],\\"fieldId\\":\\"input_a9c0090b\\",\\"highlight\\":false,\\"styleMaxWidth\\":{\\"value\\":450},\\"required\\":true},\\"children\\":[],\\"parentInstanceKey\\":\\"jimuroot_a84525b4\\"},{\\"id\\":\\"number_0879090a\\",\\"componentName\\":\\"Number\\",\\"props\\":{\\"label\\":\\"数字输入框\\",\\"layout\\":\\"VERTICAL\\",\\"showLabel\\":true,\\"placeholder\\":\\"输入数字\\",\\"validation\\":[{\\"type\\":\\"required\\",\\"value\\":true,\\"message\\":\\"\\",\\"param\\":\\"\\",\\"text\\":\\"必填\\"}],\\"fieldId\\":\\"number_0879090a\\",\\"highlight\\":false,\\"styleMaxWidth\\":{\\"value\\":450},\\"required\\":true},\\"children\\":[],\\"parentInstanceKey\\":\\"jimuroot_a84525b4\\"},{\\"id\\":\\"select_f05e70e6\\",\\"componentName\\":\\"Select\\",\\"props\\":{\\"label\\":\\"单选框\\",\\"layout\\":\\"VERTICAL\\",\\"showLabel\\":true,\\"placeholder\\":\\"请选择\\",\\"options\\":[{\\"value\\":\\"选项1\\",\\"label\\":\\"选项1\\"}],\\"validation\\":[{\\"type\\":\\"required\\",\\"value\\":true,\\"message\\":\\"\\",\\"param\\":\\"\\",\\"text\\":\\"必填\\"}],\\"fieldId\\":\\"select_f05e70e6\\",\\"styleMaxWidth\\":{\\"value\\":450},\\"required\\":true},\\"children\\":[],\\"parentInstanceKey\\":\\"jimuroot_a84525b4\\"},{\\"id\\":\\"money_d9c9b848\\",\\"componentName\\":\\"Money\\",\\"props\\":{\\"label\\":\\"金额\\",\\"layout\\":\\"VERTICAL\\",\\"showLabel\\":true,\\"placeholder\\":\\"输入金额\\",\\"validation\\":[{\\"type\\":\\"required\\",\\"value\\":true,\\"message\\":\\"\\",\\"param\\":\\"\\",\\"text\\":\\"必填\\"}],\\"fieldId\\":\\"money_d9c9b848\\",\\"highlight\\":false,\\"styleMaxWidth\\":{\\"value\\":450},\\"required\\":true},\\"children\\":[],\\"parentInstanceKey\\":\\"jimuroot_a84525b4\\"},{\\"id\\":\\"textarea_9ab71399\\",\\"componentName\\":\\"TextArea\\",\\"props\\":{\\"label\\":\\"多行文本输入\\",\\"layout\\":\\"VERTICAL\\",\\"showLabel\\":true,\\"placeholder\\":\\"请输入文本\\",\\"validation\\":[{\\"type\\":\\"required\\",\\"value\\":true,\\"message\\":\\"\\",\\"param\\":\\"\\",\\"text\\":\\"必填\\"}],\\"fieldId\\":\\"textarea_9ab71399\\",\\"highlight\\":false,\\"styleMaxWidth\\":{\\"value\\":\\"100%\\"},\\"required\\":true},\\"children\\":[],\\"parentInstanceKey\\":\\"jimuroot_a84525b4\\"},{\\"id\\":\\"card_57653305\\",\\"componentName\\":\\"Card\\",\\"props\\":{\\"title\\":\\"分组卡片\\",\\"layoutPC\\":\\"VERTICAL\\",\\"layoutMOBILE\\":\\"HORIZONTAL\\",\\"fieldId\\":\\"card_57653305\\"},\\"children\\":[{\\"id\\":\\"file_e6719727\\",\\"componentName\\":\\"File\\",\\"props\\":{\\"label\\":\\"附件\\",\\"layout\\":\\"VERTICAL\\",\\"showLabel\\":true,\\"validation\\":[{\\"type\\":\\"required\\",\\"value\\":true,\\"message\\":\\"\\",\\"param\\":\\"\\",\\"text\\":\\"必填\\"}],\\"fieldId\\":\\"file_e6719727\\",\\"styleMaxWidth\\":{\\"value\\":\\"100%\\"},\\"required\\":true},\\"children\\":[],\\"parentInstanceKey\\":\\"card_57653305\\"},{\\"id\\":\\"image_15b5b95b\\",\\"componentName\\":\\"Image\\",\\"props\\":{\\"label\\":\\"图片\\",\\"layout\\":\\"VERTICAL\\",\\"showLabel\\":true,\\"validation\\":[{\\"type\\":\\"required\\",\\"value\\":true,\\"message\\":\\"\\",\\"param\\":\\"\\",\\"text\\":\\"必填\\"}],\\"fieldId\\":\\"image_15b5b95b\\",\\"styleMaxWidth\\":{\\"value\\":\\"100%\\"},\\"required\\":true},\\"children\\":[],\\"parentInstanceKey\\":\\"card_57653305\\"}],\\"parentInstanceKey\\":\\"jimuroot_a84525b4\\"},{\\"id\\":\\"people_e209712a\\",\\"componentName\\":\\"People\\",\\"props\\":{\\"label\\":\\"联系人\\",\\"layout\\":\\"VERTICAL\\",\\"showLabel\\":true,\\"placeholder\\":\\"输入人员名称/mis\\",\\"validation\\":[{\\"type\\":\\"required\\",\\"value\\":true,\\"message\\":\\"\\",\\"param\\":\\"\\",\\"text\\":\\"必填\\"}],\\"fieldId\\":\\"people_e209712a\\",\\"highlight\\":false,\\"styleMaxWidth\\":{\\"value\\":450},\\"required\\":true},\\"children\\":[],\\"parentInstanceKey\\":\\"jimuroot_a84525b4\\"}],\\"parentInstanceKey\\":null},\\"dataSource\\":{\\"online\\":[]}}],\\"action\\":{\\"source\\":\\"\\\\n/**\\\\n  * 私有的，可复用的函数\\\\n  * 函数面板帮助文档: \\\\n  * @see \\\\n  */\\\\nexport function helloWorld(obj) {\\\\n  console.info(obj);\\\\n}\\",\\"type\\":\\"FUNCTION\\",\\"list\\":[{\\"id\\":\\"helloWorld\\",\\"title\\":\\"helloWorld\\"}]}}","process":[{"type":"Start","option":{"curNodeIndex":[0]},"resourceId":"sid-E61FAC20-A276-43B2-8959-5ACFADA5BDCC","curNodeBoundsDeepIndex":0,"bounds":{"upperLeft":{"x":35,"y":25},"lowerRight":{"x":65,"y":55}}},{"type":"Gateway","option":{"curNodeIndex":[1]},"resourceId":"sid-E475C585-1026-4AA8-9E65-12D5BB16EFD9","child":[{"type":"Branch","child":[{"type":"Condition","option":{"title":"条件","background":"#fff","curNodeIndex":[1,0,0],"priority":0,"conditions":[{"key":"bpm0ufq8kno93dn","value":"1111","propertyCode":"number_0879090a","propertyName":"数字输入框","businessType":0,"subPropertyCode":"","subPropertyName":"","operationCode":"eq","operationName":"==","operationDisplay":"等于","data":"1111","showSub":true,"editOperation":true,"leaf":true,"componentType":"number","componentName":"Number","label":""},{"logical":1,"leaf":false,"conditions":[{"key":"bpm0ne9fsl7rkhj","value":"129263","propertyCode":"SYS_CRT_DEPTID","propertyName":"发起人部门","businessType":2,"subPropertyCode":"","subPropertyName":"","operationCode":"eq","operationName":"==","operationDisplay":"等于","data":{"id":"129263","label":"公司-美团-虚拟组织-公共服务平台-技术公共服务-研发运维工具中心-Cargo服务error","value":"129263"},"showSub":true,"editOperation":true,"leaf":true,"subProperties":[],"label":""},{"key":"bpm0c7g3kra9u4d","value":"8","propertyCode":"SYS_CRT_USERID","propertyName":"发起人","businessType":1,"subPropertyCode":"","subPropertyName":"","operationCode":"eq","operationName":"==","operationDisplay":"等于","data":{"id":"8","label":"郭万怀 / guowanhuai","value":"8"},"showSub":true,"editOperation":true,"leaf":true,"subProperties":[],"label":""},{"key":"bpm03jk3sbs48v3","value":"选项1","propertyCode":"select_f05e70e6","propertyName":"单选框","businessType":0,"subPropertyCode":"","subPropertyName":"","operationCode":"eq","operationName":"==","operationDisplay":"等于","data":{"value":"选项1","label":"选项1"},"showSub":true,"editOperation":true,"leaf":true,"options":[{"value":"选项1","label":"选项1"}],"componentType":"string","componentName":"Select","label":""}]}],"logical":1,"exchangePriority":0,"validateMessage":""},"resourceId":"sid-7DE6F74E-5A83-4703-BB12-FD00B08AAE86","nodesCount":3},{"type":"Task","option":{"title":"审批任务","background":"#5b91fe","overrideid":"bpm0i1jzcuw0xu","curNodeIndex":[1,0,1],"priority":0,"approvalGroup":{"approverType":"0","selectedUsers":[],"approveType":"ALL","seriesType":"0","seriesValue":"1"},"validateMessage":""},"resourceId":"sid-32C461CE-5A95-419B-8A65-3B298FD9958D","nodesCount":3,"next":{"resourceId":"sid-379F7A61-DBBE-47D6-B0AA-C579F8871C94"},"curNodeBoundsDeepIndex":2,"bounds":{"upperLeft":{"x":280,"y":0},"lowerRight":{"x":380,"y":80}}}]},{"type":"Branch","child":[{"type":"Condition","option":{"title":"条件","background":"#fff","curNodeIndex":[1,1,0],"priority":1,"conditions":[{"key":"bpm06xlmsgxkdsm","value":"选项1","propertyCode":"select_f05e70e6","propertyName":"单选框","businessType":0,"subPropertyCode":"","subPropertyName":"","operationCode":"eq","operationName":"==","operationDisplay":"等于","data":{"value":"选项1","label":"选项1"},"showSub":true,"editOperation":true,"leaf":true,"options":[{"value":"选项1","label":"选项1"}],"componentType":"string","componentName":"Select","label":""}],"logical":1,"exchangePriority":1,"validateMessage":""},"resourceId":"sid-8BAEDF45-EDCD-4ABE-AB1D-DB9C6698049B","nodesCount":3},{"type":"Gateway","option":{"curNodeIndex":[1,1,1],"priority":1},"resourceId":"sid-E4F212D1-7A85-40F2-AE89-6CB672F9CB2C","child":[{"type":"Branch","child":[{"type":"Condition","option":{"title":"条件","background":"#fff","curNodeIndex":[1,1,1,0,0],"priority":0,"conditions":[{"key":"bpm0b4giap7mlek","value":"选项1","propertyCode":"select_f05e70e6","propertyName":"单选框","businessType":0,"subPropertyCode":"","subPropertyName":"","operationCode":"eq","operationName":"==","operationDisplay":"等于","data":{"value":"选项1","label":"选项1"},"showSub":true,"editOperation":true,"leaf":true,"options":[{"value":"选项1","label":"选项1"}],"componentType":"string","componentName":"Select","label":""},{"key":"bpm08msm2yngl2g","value":"选项1","propertyCode":"select_f05e70e6","propertyName":"单选框","businessType":0,"subPropertyCode":"","subPropertyName":"","operationCode":"in","operationName":"in","operationDisplay":"属于","data":[{"value":"选项1","label":"选项1"}],"showSub":true,"editOperation":true,"leaf":true,"options":[{"value":"选项1","label":"选项1"}],"componentType":"string","componentName":"Select","label":""}],"logical":1,"exchangePriority":0,"validateMessage":""},"resourceId":"sid-7BC9FC07-DD31-44D0-9A2B-64675FBBDD05","nodesCount":2},{"type":"Task","option":{"title":"审批任务","background":"#5b91fe","overrideid":"bpm0anjenjwmch","curNodeIndex":[1,1,1,0,1],"priority":0,"approvalGroup":{"approverType":"1","selectedUsers":[],"approveType":"ALL","seriesType":"DEPARTMENT_LEVEL","seriesValue":"1","formKey":"","formValue":""},"validateMessage":""},"resourceId":"sid-4E0EE5A2-8DEA-4D79-ACA8-4C9C882C7FBD","nodesCount":2,"next":{"resourceId":"sid-2EE65B22-7B3B-42CF-920F-5BD312A26C27"},"curNodeBoundsDeepIndex":3,"bounds":{"upperLeft":{"x":420,"y":0},"lowerRight":{"x":520,"y":80}}}]},{"type":"Branch","child":[{"type":"Condition","option":{"title":"默认","background":"#fff","default":true,"curNodeIndex":[1,1,1,1,0],"priority":1,"validateMessage":""},"resourceId":"sid-53AA5B58-B72A-46BB-A962-827C33D60198","nodesCount":2},{"type":"Task","option":{"title":"审批任务","background":"#5b91fe","overrideid":"bpm0kyiot26iz3l","curNodeIndex":[1,1,1,1,1],"priority":1,"approvalGroup":{"approverType":"6","selectedUsers":[],"approveType":"ALL","seriesType":"0","seriesValue":"1","formKey":"people_e209712a","formValue":"FAWU"},"validateMessage":""},"resourceId":"sid-AEBA0A5B-7437-40EB-B83D-19BCABE2320D","nodesCount":2,"next":{"resourceId":"sid-2EE65B22-7B3B-42CF-920F-5BD312A26C27"},"curNodeBoundsDeepIndex":3,"bounds":{"upperLeft":{"x":420,"y":100},"lowerRight":{"x":520,"y":180}}}]}],"nodesCount":3,"curNodeBoundsDeepIndex":2,"next":{"resourceId":"sid-2EE65B22-7B3B-42CF-920F-5BD312A26C27"},"curFlowableIndex":7,"bounds":{"upperLeft":{"x":310,"y":120},"lowerRight":{"x":350,"y":160}}},{"type":"Task","option":{"overrideid":"bpm0mpbl0db90u","title":"审批任务","background":"#5b91fe","curNodeIndex":[1,1,2],"priority":1,"approvalGroup":{"approverType":"0","selectedUsers":[],"approveType":"ALL","seriesType":"5","seriesValue":"2"},"validateMessage":""},"resourceId":"sid-2EE65B22-7B3B-42CF-920F-5BD312A26C27","nodesCount":3,"next":{"resourceId":"sid-379F7A61-DBBE-47D6-B0AA-C579F8871C94"},"curNodeBoundsDeepIndex":4,"bounds":{"upperLeft":{"x":560,"y":0},"lowerRight":{"x":660,"y":80}}}]},{"type":"Branch","child":[{"type":"Condition","option":{"title":"默认","background":"#fff","default":true,"curNodeIndex":[1,2,0],"priority":2,"validateMessage":""},"resourceId":"sid-335745EE-C08D-44D3-A689-E208E73748E8","nodesCount":3},{"type":"Task","option":{"title":"审批任务","background":"#5b91fe","overrideid":"bpm00mx4zarig77k","curNodeIndex":[1,2,1],"priority":2,"approvalGroup":{"approverType":"4","selectedUsers":[],"approveType":"ALL","seriesType":"0","seriesValue":"1","formKey":"","formValue":""},"validateMessage":""},"resourceId":"sid-26CA3EAE-8A16-4E5E-B945-AC68C0886D14","nodesCount":3,"next":{"resourceId":"sid-379F7A61-DBBE-47D6-B0AA-C579F8871C94"},"curNodeBoundsDeepIndex":2,"bounds":{"upperLeft":{"x":280,"y":200},"lowerRight":{"x":380,"y":280}}}]}],"curNodeBoundsDeepIndex":1,"next":{"resourceId":"sid-379F7A61-DBBE-47D6-B0AA-C579F8871C94"},"curFlowableIndex":2,"bounds":{"upperLeft":{"x":170,"y":20},"lowerRight":{"x":210,"y":60}}},{"type":"Task","option":{"overrideid":"bpm0dw2hl6u9yuk","title":"审批任务","background":"#5b91fe","curNodeIndex":[2],"approvalGroup":{"approverType":"6","selectedUsers":[],"approveType":"ALL","seriesType":"0","seriesValue":"1","formKey":"people_e209712a","formValue":"HRBPHEAD"},"validateMessage":""},"resourceId":"sid-379F7A61-DBBE-47D6-B0AA-C579F8871C94","curNodeBoundsDeepIndex":5,"bounds":{"upperLeft":{"x":700,"y":0},"lowerRight":{"x":800,"y":80}}},{"type":"Task","option":{"overrideid":"bpm09szeazud7tj","title":"审批任务","background":"#5b91fe","curNodeIndex":[3],"approvalGroup":{"approverType":"3","selectedUsers":[],"approveType":"SERIES","seriesType":"1","seriesValue":"X3A","formKey":"","formValue":""},"validateMessage":""},"resourceId":"sid-3ACB3991-A6C2-472F-BBC5-48727A6A1219","curNodeBoundsDeepIndex":6,"bounds":{"upperLeft":{"x":840,"y":0},"lowerRight":{"x":940,"y":80}}},{"type":"Task","option":{"overrideid":"bpm0djegyjjnxak","title":"审批任务","background":"#5b91fe","curNodeIndex":[4],"approvalGroup":{"approverType":"4","selectedUsers":[],"approveType":"ALL","seriesType":"0","seriesValue":"1","formKey":"","formValue":""},"validateMessage":""},"resourceId":"sid-640A49CE-0C59-4667-BC24-A3C055B9A484","curNodeBoundsDeepIndex":7,"bounds":{"upperLeft":{"x":980,"y":0},"lowerRight":{"x":1080,"y":80}}},{"type":"Task","option":{"title":"审批任务","background":"#5b91fe","overrideid":"bpm0suiv6x2zyb","curNodeIndex":[5],"approvalGroup":{"approverType":"0","selectedUsers":[],"approveType":"ALL","seriesType":"0","seriesValue":"1"},"validateMessage":""},"resourceId":"sid-2F89AF8F-3BE4-4B29-86F3-ED863F2F6F38","curNodeBoundsDeepIndex":8,"bounds":{"upperLeft":{"x":1120,"y":0},"lowerRight":{"x":1220,"y":80}}},{"type":"End","option":{"curNodeIndex":[6]},"resourceId":"sid-83747A20-586A-4E7C-8D9F-BA7074D9B367","curNodeBoundsDeepIndex":9,"bounds":{"upperLeft":{"x":1296,"y":26},"lowerRight":{"x":1324,"y":54}}}],"conditionComponentList":[{"id":"number_0879090a","label":"数字输入框","type":"number","required":true,"componentName":"Number"},{"id":"select_f05e70e6","label":"单选框","options":[{"value":"选项1","label":"选项1"}],"type":"string","required":true,"componentName":"Select"},{"id":"money_d9c9b848","label":"金额","type":"number","required":true,"componentName":"Money"},{"id":"people_e209712a","label":"联系人","type":"people","required":true,"componentName":"People"}]}'
      );

      expect(convertFormToData(form)).toMatchSnapshot();
    });
  });

  describe('test getUsedPropertyCodes', () => {
    test('获取在流程里使用的属性', () => {
      const conditionComponentList = [
        {
          id: 'people_138bd2ce',
          label: '联系人',
          type: 'people',
          required: true,
          componentName: 'People'
        }
      ];
      const process = [
        {
          type: 'Start',
          option: {},
          resourceId: 'sid-8F69A428-0958-495C-B23C-F044109CFE51',
          curNodeBoundsDeepIndex: 0,
          bounds: { upperLeft: { x: 35, y: 25 }, lowerRight: { x: 65, y: 55 } }
        },
        {
          type: 'Task',
          option: {
            overrideid: 'bpm0nohz3py127j',
            approvalGroup: {
              approverType: '6',
              formKey: 'people_138bd2ce',
              formValue: 'FAWU',
              approveType: 'ALL'
            },
            title: '审批任务',
            ccGroups: []
          },
          resourceId: 'sid-05BAF0CB-99FB-4F00-A778-A0BF5798AA8A',
          id: 144792,
          curNodeBoundsDeepIndex: 3,
          bounds: { upperLeft: { x: 420, y: 0 }, lowerRight: { x: 520, y: 80 } }
        },
        {
          type: 'End',
          option: {},
          resourceId: 'sid-5066779E-0A55-4BB4-8E12-F7ABE773294F',
          curNodeBoundsDeepIndex: 4,
          bounds: {
            upperLeft: { x: 596, y: 26 },
            lowerRight: { x: 624, y: 54 }
          }
        }
      ];
      const result = [
        {
          id: 'people_138bd2ce',
          label: '联系人',
          type: 'people',
          required: true,
          componentName: 'People'
        }
      ];

      expect(
        getUsedPropertyCodes(conditionComponentList, process)
      ).toMatchObject(result);
    });
  });
  describe('test convertDataToForm', () => {
    test('边界 process为空', () => {
      const form = { info: '', process: false, form: '' };

      expect(convertDataToForm(form)).toMatchObject({});
    });
  });

  describe('[snapshot]test convertDataToForm', () => {
    test('快照测试', () => {
      expect(convertDataToForm(data)).toMatchSnapshot();
    });
    test('快照测试', () => {
      form = { info: '', process: false, form: '' };

      expect(convertDataToForm(form)).toMatchSnapshot();
    });
  });
});
