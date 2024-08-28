import { NODETYPE } from '../../pages/create/flow/const';
import {
  isOptionUsedInNodes,
  mappingFormRoleToFormFileds,
  getPropertyConditionMapping,
  findNodesByPropertyCodes,
  convertFormRoleToForm,
  removeOptionFromConditionNodes,
  getDiffedFields,
  mappingFormFiledsToFormRole
} from '../flow';

import { findNode } from '../form';

describe('test /src/utils/flow.ts', () => {
  test('test mappingFormRoleToFormFileds', () => {
    expect(
      mappingFormRoleToFormFileds([
        {
          id: 'select',
          readable: false,
          writable: false
        },
        {
          id: 'selectDD',
          readable: true,
          writable: false
        },
        {
          id: 'text',
          readable: true,
          writable: false
        },
        {
          id: 'captions',
          readable: true,
          writable: true
        },
        {
          id: 'image',
          readable: true,
          writable: false
        }
      ])
    ).toMatchObject([
      { fieldId: 'select', privilege: 0 },
      { fieldId: 'selectDD', privilege: 1 },
      { fieldId: 'text', privilege: 1 },
      { fieldId: 'captions', privilege: 3 },
      { fieldId: 'image', privilege: 1 }
    ]);
  });

  let process = {};

  beforeEach(() => {
    process = [
      {
        type: 'Start',
        option: {
          formRoles: [
            {
              id: 'input_a3d9f9f2',
              readable: true,
              writable: false
            },
            {
              id: 'money_c632c208',
              readable: true,
              writable: false
            },
            {
              id: 'select_47b7a61d',
              readable: true,
              writable: false
            },
            {
              id: 'department_4d08c33e',
              readable: true,
              writable: false
            },
            {
              id: 'textarea_869c9f50',
              readable: true,
              writable: true
            },
            {
              id: 'number_1b56ac54',
              readable: true,
              writable: true
            },
            {
              id: 'selectdd_e2d729e3',
              readable: true,
              writable: true
            },
            {
              id: 'captions_06ae65b0',
              readable: true,
              writable: false
            },
            {
              id: 'daterange_714bb542',
              readable: true,
              writable: true
            },
            {
              id: 'image_fa6b17b5',
              readable: true,
              writable: true
            },
            {
              id: 'file_d97ecbe7',
              readable: true,
              writable: true
            },
            {
              id: 'people_48eb6246',
              readable: true,
              writable: true
            }
          ],
          curNodeIndex: [0]
        },
        resourceId: 'sid-8307C861-FBF0-49EC-A725-006F4CEDD87A',
        curNodeBoundsDeepIndex: 0,
        bounds: {
          upperLeft: {
            x: 35,
            y: 25
          },
          lowerRight: {
            x: 65,
            y: 55
          }
        }
      },
      {
        type: 'Gateway',
        option: {
          curNodeIndex: [1]
        },
        resourceId: 'sid-DA974056-5C86-415E-9560-135CDBC11369',
        child: [
          {
            type: 'Branch',
            child: [
              {
                type: 'Condition',
                option: {
                  conditions: [
                    {
                      businessType: 0,
                      data: [
                        {
                          value: 'select000zh7nmlquzz',
                          label: '11111'
                        }
                      ],
                      leaf: true,
                      operationCode: 'in',
                      operationDisplay: '等于任一',
                      operationName: 'in',
                      propertyCode: 'select_47b7a61d',
                      propertyName: '单选框',
                      value: 'select000zh7nmlquzz',
                      options: [
                        {
                          value: 'select000zh7nmlquzz',
                          label: '11111'
                        }
                      ]
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
                },
                resourceId: 'sid-A8F65988-A11A-4BB3-B31F-361203C1D6B8',
                nodesCount: 2
              },
              {
                type: 'Task',
                option: {
                  overrideid: 'bpm0ob6he14ox6q',
                  approvalGroup: {
                    approverType: '4',
                    approveType: 'ALL'
                  },
                  title: '第一个节点',
                  ccGroups: [],
                  formRoles: [
                    {
                      id: 'input_a3d9f9f2',
                      readable: true,
                      writable: false
                    },
                    {
                      id: 'money_c632c208',
                      readable: true,
                      writable: true
                    },
                    {
                      id: 'select_47b7a61d',
                      readable: true,
                      writable: true
                    },
                    {
                      id: 'textarea_869c9f50',
                      readable: true,
                      writable: false
                    },
                    {
                      id: 'number_1b56ac54',
                      readable: false,
                      writable: false
                    }
                  ],
                  curNodeIndex: [1, 0, 1],
                  priority: 0
                },
                resourceId: 'sid-AC6CD9BB-721F-419A-818F-877A31EE8825',
                nodesCount: 2,
                id: 157331,
                next: {
                  resourceId: 'sid-F8289924-3243-4689-9FD7-DECFEADB606C'
                },
                curNodeBoundsDeepIndex: 2,
                bounds: {
                  upperLeft: {
                    x: 280,
                    y: 0
                  },
                  lowerRight: {
                    x: 380,
                    y: 80
                  }
                }
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
                  default: true,
                  curNodeIndex: [1, 1, 0],
                  priority: 1
                },
                resourceId: 'sid-AA511EF2-64F0-40AC-B961-DDC2C6959A29',
                nodesCount: 2
              },
              {
                type: 'Task',
                option: {
                  overrideid: 'bpm050vb3shb5xu',
                  approvalGroup: {
                    approverType: '0',
                    seriesType: '0',
                    seriesValue: '1',
                    approveType: 'ALL'
                  },
                  title: '第二个节点',
                  ccGroups: [],
                  formRoles: [
                    {
                      id: 'input_a3d9f9f2',
                      readable: true,
                      writable: true
                    },
                    {
                      id: 'money_c632c208',
                      readable: true,
                      writable: true
                    },
                    {
                      id: 'select_47b7a61d',
                      readable: true,
                      writable: true
                    },
                    {
                      id: 'textarea_869c9f50',
                      readable: true,
                      writable: true
                    },
                    {
                      id: 'number_1b56ac54',
                      readable: true,
                      writable: true
                    }
                  ],
                  curNodeIndex: [1, 1, 1],
                  priority: 1
                },
                resourceId: 'sid-DB819609-3DC1-48DA-8B31-4BD09A4AD0AA',
                nodesCount: 2,
                id: 157330,
                next: {
                  resourceId: 'sid-F8289924-3243-4689-9FD7-DECFEADB606C'
                },
                curNodeBoundsDeepIndex: 2,
                bounds: {
                  upperLeft: {
                    x: 280,
                    y: 100
                  },
                  lowerRight: {
                    x: 380,
                    y: 180
                  }
                }
              }
            ],
            option: {}
          }
        ],
        curNodeBoundsDeepIndex: 1,
        next: {
          resourceId: 'sid-F8289924-3243-4689-9FD7-DECFEADB606C'
        },
        curFlowableIndex: 2,
        bounds: {
          upperLeft: {
            x: 170,
            y: 20
          },
          lowerRight: {
            x: 210,
            y: 60
          }
        }
      },
      {
        type: 'Task',
        option: {
          overrideid: 'bpm0hfzz3jt5fdi',
          approvalGroup: {
            approverType: '0',
            seriesType: '0',
            seriesValue: '1',
            approveType: 'ALL'
          },
          title: '第三个节点',
          ccGroups: [],
          formRoles: [
            {
              id: 'input_a3d9f9f2',
              readable: true,
              writable: true
            },
            {
              id: 'money_c632c208',
              readable: true,
              writable: true
            },
            {
              id: 'select_47b7a61d',
              readable: true,
              writable: true
            },
            {
              id: 'textarea_869c9f50',
              readable: true,
              writable: true
            },
            {
              id: 'number_1b56ac54',
              readable: true,
              writable: true
            }
          ],
          curNodeIndex: [2]
        },
        resourceId: 'sid-F8289924-3243-4689-9FD7-DECFEADB606C',
        curNodeBoundsDeepIndex: 3,
        bounds: {
          upperLeft: {
            x: 420,
            y: 0
          },
          lowerRight: {
            x: 520,
            y: 80
          }
        },
        id: 157329
      },
      {
        type: 'End',
        option: {
          curNodeIndex: [3]
        },
        resourceId: 'sid-64476467-8DFD-4E46-91C3-029D17DA3D3C',
        curNodeBoundsDeepIndex: 4,
        bounds: {
          upperLeft: {
            x: 596,
            y: 26
          },
          lowerRight: {
            x: 624,
            y: 54
          }
        }
      }
    ];
  });

  describe('测试 select 的属性删除', () => {
    test('test isOptionUsedInNodes', () => {
      const usedNodes = findNodesByPropertyCodes(['select_47b7a61d'], process);

      expect(isOptionUsedInNodes('select000zh7nmlquzz', usedNodes)).toBe(true);
      expect(isOptionUsedInNodes('select111zh7nmlquzz', usedNodes)).toBe(false);
      expect(isOptionUsedInNodes('select111zh7nmlquzz', [])).toBe(false);
    });

    test('test removeOptionFromCondition', () => {
      const optionKey = 'select000zh7nmlquzz';
      const usedNodes = findNodesByPropertyCodes(['select_47b7a61d'], process);

      removeOptionFromConditionNodes(optionKey, usedNodes);
      expect(usedNodes).toMatchObject([
        {
          type: 'Condition',
          option: {
            conditions: [
              {
                businessType: 0,
                data: [],
                leaf: true,
                operationCode: 'in',
                operationDisplay: '等于任一',
                operationName: 'in',
                propertyCode: 'select_47b7a61d',
                propertyName: '单选框',
                value: ''
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
                value: 'guanbingchang'
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
            leaf: false
          },
          resourceId: 'sid-A8F65988-A11A-4BB3-B31F-361203C1D6B8',
          nodesCount: 2
        }
      ]);
    });

    test('test getPropertyConditionMapping', () => {
      const curNodeIndex = [1, 0, 1];
      const propertyCodes = [
        'input_a3d9f9f2',
        'money_c632c208',
        'select_47b7a61d',
        'department_4d08c33e',
        'textarea_869c9f50',
        'number_1b56ac54',
        'selectdd_e2d729e3',
        'captions_06ae65b0',
        'daterange_714bb542',
        'image_fa6b17b5',
        'file_d97ecbe7',
        'people_48eb6246'
      ];

      expect(
        getPropertyConditionMapping(propertyCodes, process, curNodeIndex)
      ).toMatchObject({ select_47b7a61d: true });
    });
  });

  describe('测试 formRoles 功能', () => {
    let componentList = [];
    beforeEach(() => {
      componentList = [
        {
          id: 'input_a3d9f9f2',
          componentName: 'Input',
          label: '单行文本输入',
          options: []
        },
        {
          id: 'money_c632c208',
          componentName: 'Money',
          label: '金额',
          options: []
        },
        {
          id: 'select_47b7a61d',
          componentName: 'Select',
          label: '单选框',
          options: [{ value: 'select000zh7nmlquzz', label: '11111' }]
        },
        {
          id: 'department_4d08c33e',
          componentName: 'Department',
          label: '部门',
          options: []
        },
        {
          id: 'textarea_869c9f50',
          componentName: 'TextArea',
          label: '多行文本输入',
          options: []
        },
        {
          id: 'number_1b56ac54',
          componentName: 'Number',
          label: '数字输入框',
          options: []
        },
        {
          id: 'selectdd_e2d729e3',
          componentName: 'SelectDD',
          label: '多选框',
          options: [{ value: 'selectdd0rmrdmz4ctaj', label: '3333' }]
        },
        {
          id: 'captions_06ae65b0',
          componentName: 'Captions',
          label: '说明文字1',
          options: []
        },
        {
          id: 'daterange_714bb542',
          componentName: 'DateRange',
          label: '日期区间',
          options: []
        },
        {
          id: 'image_fa6b17b5',
          componentName: 'Image',
          label: '图片',
          options: []
        },
        {
          id: 'file_d97ecbe7',
          componentName: 'File',
          label: '附件',
          options: []
        },
        {
          id: 'people_48eb6246',
          componentName: 'People',
          label: '联系人',
          options: []
        }
      ];
    });

    test('test convertFormRoleToForm 开始节点', () => {
      const formRoles = process[0].option.formRoles;
      const curNodeIndex = [0];
      const propertyCodes = [
        'input_a3d9f9f2',
        'money_c632c208',
        'select_47b7a61d',
        'department_4d08c33e',
        'textarea_869c9f50',
        'number_1b56ac54',
        'selectdd_e2d729e3',
        'captions_06ae65b0',
        'daterange_714bb542',
        'image_fa6b17b5',
        'file_d97ecbe7',
        'people_48eb6246'
      ];
      const mappingComponentDisabled = getPropertyConditionMapping(
        propertyCodes,
        process,
        curNodeIndex
      );

      expect(
        convertFormRoleToForm(
          formRoles,
          componentList,
          mappingComponentDisabled,
          'Start'
        )
      ).toMatchObject([
        {
          id: 'input_a3d9f9f2',
          label: '单行文本输入',
          readable: true,
          writable: false,
          disabled: false
        },
        {
          id: 'money_c632c208',
          label: '金额',
          readable: true,
          writable: false,
          disabled: false
        },
        {
          id: 'select_47b7a61d',
          label: '单选框',
          readable: true,
          writable: false,
          disabled: false
        },
        {
          id: 'department_4d08c33e',
          label: '部门',
          readable: true,
          writable: false,
          disabled: false
        },
        {
          id: 'textarea_869c9f50',
          label: '多行文本输入',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'number_1b56ac54',
          label: '数字输入框',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'selectdd_e2d729e3',
          label: '多选框',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'captions_06ae65b0',
          label: '说明文字1',
          readable: true,
          writable: false,
          disabled: true
        },
        {
          id: 'daterange_714bb542',
          label: '日期区间',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'image_fa6b17b5',
          label: '图片',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'file_d97ecbe7',
          label: '附件',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'people_48eb6246',
          label: '联系人',
          readable: true,
          writable: true,
          disabled: false
        }
      ]);

      expect(
        convertFormRoleToForm(
          [],
          componentList,
          mappingComponentDisabled,
          'Start'
        )
      ).toMatchObject([
        {
          id: 'input_a3d9f9f2',
          label: '单行文本输入',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'money_c632c208',
          label: '金额',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'select_47b7a61d',
          label: '单选框',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'department_4d08c33e',
          label: '部门',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'textarea_869c9f50',
          label: '多行文本输入',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'number_1b56ac54',
          label: '数字输入框',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'selectdd_e2d729e3',
          label: '多选框',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'captions_06ae65b0',
          label: '说明文字1',
          readable: true,
          writable: false,
          disabled: true
        },
        {
          id: 'daterange_714bb542',
          label: '日期区间',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'image_fa6b17b5',
          label: '图片',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'file_d97ecbe7',
          label: '附件',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'people_48eb6246',
          label: '联系人',
          readable: true,
          writable: true,
          disabled: false
        }
      ]);
    });

    test('test convertFormRoleToForm 前置节点用到场景', () => {
      const curNodeIndex = [1, 0, 1];
      const formRoles = findNode(curNodeIndex, process).option.formRoles;
      const propertyCodes = [
        'input_a3d9f9f2',
        'money_c632c208',
        'select_47b7a61d',
        'department_4d08c33e',
        'textarea_869c9f50',
        'number_1b56ac54',
        'selectdd_e2d729e3',
        'captions_06ae65b0',
        'daterange_714bb542',
        'image_fa6b17b5',
        'file_d97ecbe7',
        'people_48eb6246'
      ];
      const mappingComponentDisabled = getPropertyConditionMapping(
        propertyCodes,
        process,
        curNodeIndex
      );

      expect(
        convertFormRoleToForm(
          formRoles,
          componentList,
          mappingComponentDisabled,
          'Start'
        )
      ).toMatchObject([
        {
          id: 'input_a3d9f9f2',
          label: '单行文本输入',
          readable: true,
          writable: false,
          disabled: false
        },
        {
          id: 'money_c632c208',
          label: '金额',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'select_47b7a61d',
          label: '单选框',
          readable: true,
          writable: false,
          disabled: true
        },
        {
          id: 'department_4d08c33e',
          label: '部门',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'textarea_869c9f50',
          label: '多行文本输入',
          readable: true,
          writable: false,
          disabled: false
        },
        {
          id: 'number_1b56ac54',
          label: '数字输入框',
          readable: false,
          writable: false,
          disabled: false
        },
        {
          id: 'selectdd_e2d729e3',
          label: '多选框',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'captions_06ae65b0',
          label: '说明文字1',
          readable: true,
          writable: false,
          disabled: true
        },
        {
          id: 'daterange_714bb542',
          label: '日期区间',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'image_fa6b17b5',
          label: '图片',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'file_d97ecbe7',
          label: '附件',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'people_48eb6246',
          label: '联系人',
          readable: true,
          writable: true,
          disabled: false
        }
      ]);

      expect(
        convertFormRoleToForm(
          formRoles,
          componentList,
          mappingComponentDisabled,
          'Task'
        )
      ).toMatchObject([
        {
          id: 'input_a3d9f9f2',
          label: '单行文本输入',
          readable: true,
          writable: false,
          disabled: false
        },
        {
          id: 'money_c632c208',
          label: '金额',
          readable: true,
          writable: true,
          disabled: false
        },
        {
          id: 'select_47b7a61d',
          label: '单选框',
          readable: true,
          writable: false,
          disabled: true
        },
        {
          id: 'department_4d08c33e',
          label: '部门',
          readable: true,
          writable: false,
          disabled: false
        },
        {
          id: 'textarea_869c9f50',
          label: '多行文本输入',
          readable: true,
          writable: false,
          disabled: false
        },
        {
          id: 'number_1b56ac54',
          label: '数字输入框',
          readable: false,
          writable: false,
          disabled: false
        },
        {
          id: 'selectdd_e2d729e3',
          label: '多选框',
          readable: true,
          writable: false,
          disabled: false
        },
        {
          id: 'captions_06ae65b0',
          label: '说明文字1',
          readable: true,
          writable: false,
          disabled: true
        },
        {
          id: 'daterange_714bb542',
          label: '日期区间',
          readable: true,
          writable: false,
          disabled: false
        },
        {
          id: 'image_fa6b17b5',
          label: '图片',
          readable: true,
          writable: false,
          disabled: false
        },
        {
          id: 'file_d97ecbe7',
          label: '附件',
          readable: true,
          writable: false,
          disabled: false
        },
        {
          id: 'people_48eb6246',
          label: '联系人',
          readable: true,
          writable: false,
          disabled: false
        }
      ]);
    });

    test('test mappingFormFiledsToFormRole', () => {
      const formRoles = mappingFormFiledsToFormRole([
        {
          fieldId: 'input_a3d9f9f2',
          privilege: 3
        },
        {
          fieldId: 'money_c632c208',
          privilege: 3
        },
        {
          fieldId: 'select_47b7a61d',
          privilege: 3
        },
        {
          fieldId: 'textarea_869c9f50',
          privilege: 3
        },
        {
          fieldId: 'number_1b56ac54',
          privilege: 3
        }
      ]);

      expect(formRoles).toMatchObject([
        {
          id: 'input_a3d9f9f2',
          readable: true,
          writable: true
        },
        {
          id: 'money_c632c208',
          readable: true,
          writable: true
        },
        {
          id: 'select_47b7a61d',
          readable: true,
          writable: true
        },
        {
          id: 'textarea_869c9f50',
          readable: true,
          writable: true
        },
        {
          id: 'number_1b56ac54',
          readable: true,
          writable: true
        }
      ]);
    });

    test('test getDiffedFields - 发起节点', () => {
      const curNodeIndex = [1, 0, 1];
      const formRoles = findNode(curNodeIndex, process).option.formRoles;
      const formFields = mappingFormRoleToFormFileds(formRoles);

      formFields.push({
        fieldId: 'gbc',
        privilege: '33'
      });

      const result = getDiffedFields(formFields, componentList, NODETYPE.Start);
      expect(result).toMatchObject([
        { fieldId: 'input_a3d9f9f2', privilege: 1 },
        { fieldId: 'money_c632c208', privilege: 3 },
        { fieldId: 'select_47b7a61d', privilege: 3 },
        { fieldId: 'textarea_869c9f50', privilege: 1 },
        { fieldId: 'number_1b56ac54', privilege: 0 },
        { fieldId: 'department_4d08c33e', privilege: 3 },
        { fieldId: 'selectdd_e2d729e3', privilege: 3 },
        { fieldId: 'captions_06ae65b0', privilege: 3 },
        { fieldId: 'daterange_714bb542', privilege: 3 },
        { fieldId: 'image_fa6b17b5', privilege: 3 },
        { fieldId: 'file_d97ecbe7', privilege: 3 },
        { fieldId: 'people_48eb6246', privilege: 3 }
      ]);

      expect(
        getDiffedFields(formFields, componentList, NODETYPE.Task)
      ).toMatchObject([
        { fieldId: 'input_a3d9f9f2', privilege: 1 },
        { fieldId: 'money_c632c208', privilege: 3 },
        { fieldId: 'select_47b7a61d', privilege: 3 },
        { fieldId: 'textarea_869c9f50', privilege: 1 },
        { fieldId: 'number_1b56ac54', privilege: 0 },
        { fieldId: 'department_4d08c33e', privilege: 1 },
        { fieldId: 'selectdd_e2d729e3', privilege: 1 },
        { fieldId: 'captions_06ae65b0', privilege: 1 },
        { fieldId: 'daterange_714bb542', privilege: 1 },
        { fieldId: 'image_fa6b17b5', privilege: 1 },
        { fieldId: 'file_d97ecbe7', privilege: 1 },
        { fieldId: 'people_48eb6246', privilege: 1 }
      ]);
    });
  });
});
