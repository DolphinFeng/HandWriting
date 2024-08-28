import { inject, observer } from 'mobx-react';
// import '@ss/mtd-react/lib/style/index.css';
import React, { ReactNode, Component } from 'react';
import {
  Icon,
  Drawer,
  Input,
  Form,
  Button,
  Card,
  Radio,
  Popover,
  Tooltip
} from '@ss/mtd-react';

import { cloneDeep } from 'lodash';
import {
  handleCCGroupsValidate,
  handleApprovalValidate,
  handleAdvanceValidate
} from './util';
import {
  approvalMoreSetting,
  APPROVERTYPE,
  ICCGroup,
  APPROVETYPE,
  IApprovalGroupState,
  ApprovalDeDuplicateType,
  IFormRole,
  ExpireAutoEnum,
  AdvancedType
} from './task.type';
import { formTaskComponentList } from '@/utils/form';
import NodeBox from '../NodeBox';
import AddNode from '../AddNode';
import Styles from './index.less';
import { IFormProperty, NODETYPE } from '../../flow.type';
import { INodeBoxOption } from '../node-box.type';
import ApprovalGroup from './ApprovalGroup';
import FormRole from './FormRole';
import AddCC, { ICCGroupState } from './AddCC';
import AdvancedSetting, { RegexpId } from './AdvancedSetting';
import { IComponent } from '@/utils/form.type';

export interface ITaskProps {
  approval: any;
  formProperties: IFormProperty[];
  componentList: IComponent[];
  option: INodeBoxOption;
  approvalMoreSetting: approvalMoreSetting;
}

export interface ITaskState {
  isTitleEditValidation: boolean;
  drawerVisible: boolean;
  // 审批 title 状态
  isTitleEdit: boolean;
  // 审批 title 值
  editTitle: string;
  // 审批人类型
  settingTab:
    | 'approvalSetting'
    | 'formRoleSetting'
    | 'ccSetting'
    | 'advancedSetting';
  approvalGroup: IApprovalGroupState;
  ccGroups: ICCGroupState[];
  formRoles: IFormRole[];
  starterDeduplicate: ApprovalDeDuplicateType;
  approverDeduplicate: ApprovalDeDuplicateType;
  advanced: AdvancedType;
  overrideid: string;
  allOverrideid: string[];
  errorMsg: ReactNode;
}

const TITLE_REG = /^[\s\S]{2,20}$/;
const SPECIAL_REG = /s\s*v\s*p|v\s*p|总\s*监|b\s*g\s*m|x\s*\d\s*[a-z]?/i;

@inject(({ approval }) => ({
  approval,
  componentList: approval.componentList,
  approvalMoreSetting: approval.approvalMoreSetting,
  /**
   * 筛选 componentList 里 required 和 名字在 formComponentList 里的
   */
  formProperties:
    approval.conditionComponentList
      ?.filter((item) => {
        return formTaskComponentList.indexOf(item.componentName) !== -1;
      })
      .map((item) => {
        return {
          propertyCode: item.id,
          propertyName: item.label,
          componentType: item.type,
          componentName: item.componentName
        };
      }) || []
}))
@observer
export default class Task extends Component<ITaskProps, ITaskState> {
  inputRef: React.RefObject<Input>;

  formRef: React.RefObject<Form>;

  constructor(props: ITaskProps) {
    super(props);
    this.state = {
      drawerVisible: false,
      isTitleEditValidation: true,
      // 审批 title 状态
      isTitleEdit: false,
      // 审批 title 值
      editTitle: '',
      settingTab: 'approvalSetting',
      ccGroups: [],
      approvalGroup: {
        // 审批人类型
        approverType: APPROVERTYPE.LEADER,
        // 多人审批时采用的审批类型
        approveType: APPROVETYPE.ALL,
        // 指定审批人时选中的对象
        selectedUsers: [],
        // 逐级审批类型
        seriesType: APPROVERTYPE.LEADER,
        // 逐级审批时的值
        seriesValue: '1',
        /**
         * 找人组件时的 modal
         */
        hasError: false,
        formKey: '',
        formValue: ''
      },
      formRoles: [],
      starterDeduplicate: ApprovalDeDuplicateType.Yes,
      approverDeduplicate: ApprovalDeDuplicateType.Yes,
      advanced: {
        enable: false,
        handleLimit: 4,
        expireAuto: ExpireAutoEnum.NOTHING
      },
      overrideid: '',
      allOverrideid: [],
      errorMsg: ''
    };
    this.inputRef = React.createRef();
    this.formRef = React.createRef();
  }

  initState = () => {
    const { option } = this.props;

    const ccGroupState = cloneDeep(option.ccGroups || []);
    // console.log(this.props);
    const allOverrideid =
      (option.getAllOverrideid && option.getAllOverrideid(option.overrideid)) ||
      [];
    this.setState({
      editTitle: option.title || '',
      ccGroups: ccGroupState as ICCGroupState[],
      approvalGroup: (option.approvalGroup || {
        approverType: APPROVERTYPE.LEADER,
        approveType: APPROVETYPE.ALL,
        selectedUsers: [],
        seriesType: APPROVERTYPE.LEADER,
        seriesValue: '1',
        hasError: false,
        formKey: '',
        formValue: ''
      }) as IApprovalGroupState,
      formRoles: option.formRoles || [],
      approverDeduplicate:
        option.approverDeduplicate || ApprovalDeDuplicateType.Yes,
      starterDeduplicate:
        option.starterDeduplicate || ApprovalDeDuplicateType.Yes,
      advanced: option.advanced || {
        enable: false,
        handleLimit: 4,
        expireAuto: ExpireAutoEnum.NOTHING
      },
      overrideid: option.overrideid || '',
      allOverrideid
    });
  };

  closeDrawer = () => {
    this.setState({
      drawerVisible: false
    });
  };

  handleValidate = () => {
    /**
     * 校验审批组信息
     */

    const hasError = handleApprovalValidate(this.state.approvalGroup);

    if (hasError) {
      this.state.approvalGroup.hasError = true;
      this.setState({
        approvalGroup: { ...this.state.approvalGroup }
      });
    }

    /**
     * 校验抄送组信息
     */
    const { ccGroups = [] as ICCGroupState[] } = this.state;

    const hasCCError = handleCCGroupsValidate(ccGroups);

    if (hasCCError) {
      this.setState({
        ccGroups: [...ccGroups]
      });
    }

    /**
     * 校验高级设置信息
     */
    const hasAdvError = handleAdvanceValidate(this.state.advanced);
    // if (hasAdvError) {
    //   this.setState({
    //     advanced: { ...this.state.advanced }
    //   });
    // }

    /**
     * 校验overrideid唯一性，不为空，1-30数字字母_
     */
    const hasIdError = handleOverrideidValidate(
      this.state.overrideid,
      this.state.allOverrideid
    );
    function handleOverrideidValidate(value, all) {
      if (value.length < 1) return true;
      if (!new RegExp(RegexpId).test(value)) return true;
      return all.includes(value);
    }

    return hasCCError || hasError || hasAdvError || hasIdError;
  };

  handleSave = () => {
    const hasError = this.handleValidate();

    if (hasError) {
      return;
    }

    const { ccGroups = [] as ICCGroup[] } = this.state;

    const { isTitleEditValidation } = this.state;
    if (!isTitleEditValidation) {
      this.inputRef && this.inputRef.current?.focus?.();
      return;
    }

    const { approvalGroup } = this.state;

    const {
      starterDeduplicate = ApprovalDeDuplicateType.Yes,
      approverDeduplicate = ApprovalDeDuplicateType.Yes
    } = this.state;

    const { option } = this.props;
    const { dealWithNodeFn } = option;

    option.approvalGroup = cloneDeep(approvalGroup);

    option.ccGroups = [...ccGroups];

    option.title = this.state.editTitle;
    option.formRoles = this.state.formRoles;
    option.starterDeduplicate = starterDeduplicate;
    option.approverDeduplicate = approverDeduplicate;
    option.advanced = this.state.advanced;
    option.overrideid = this.state.overrideid;
    // 保存 Node
    dealWithNodeFn && dealWithNodeFn(option, 'saveTask');

    this.closeDrawer();
  };

  changeOverrideid = (value) => {
    this.setState({
      overrideid: value
    });
  };

  handleCancel = () => {
    this.closeDrawer();
  };

  validateTitle = (value: any) => {
    if (!TITLE_REG.test(value)) {
      return <div>只能使用2-20个字符</div>;
    }
    if (SPECIAL_REG.test(value)) {
      return (
        <div>
          名称不合规，请参考
          <a
            href='https://km.sankuai.com/collabpage/1990764335'
            target='_blank'
          >
            标准角色命名规范
          </a>
        </div>
      );
    }
    return '';
  };

  renderHeader() {
    const { isTitleEdit, editTitle, isTitleEditValidation } = this.state;

    const onConfirm = () => {
      const { isTitleEditValidation } = this.state;
      if (isTitleEditValidation) {
        this.setState({
          isTitleEdit: false
        });
      }
    };

    return (
      <div className='approval-editor-header'>
        {isTitleEdit ? (
          <div className='header-title'>
            <Input
              ref={this.inputRef}
              value={this.state.editTitle}
              // style={!isTitleEditValidation ? { borderColor: '#f5483b' } : {}}
              onChange={(e: any) => {
                // 只能使用4-20个汉字、字母、下划线和数字的组合，且不含X1\X2\X3等字样
                const { value } = e.target;
                const _errorMsg = this.validateTitle(value);
                this.setState({
                  isTitleEditValidation:
                    TITLE_REG.test(value) && !SPECIAL_REG.test(value),
                  errorMsg: _errorMsg
                });
                this.setState({
                  editTitle: e.target.value
                });
              }}
              onPressEnter={onConfirm}
              onBlur={onConfirm}
            ></Input>
            {!isTitleEditValidation && (
              <div className='approval-editor-title-validation'>
                {/* 只能使用2-20个字符 */}
                {this.state.errorMsg}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex' }}>
              <div className='approval-editor-title'>{editTitle}</div>
              <div className='approval-editor-editIcon'>
                <Icon
                  type='edit'
                  style={{
                    fontSize: 16,
                    color: '#a1a5ad',
                    width: 16,
                    height: 16
                  }}
                  onClick={() => {
                    this.setState({
                      isTitleEdit: true
                    });
                  }}
                ></Icon>
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 'normal', marginTop: 4 }}>
              公司已取消部门层级，请避免在节点名称中出现X1\X2\X3字样，
              <a href='https://km.sankuai.com/page/1289684335' target='_blank'>
                了解更多
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  render() {
    const curInfo = this.props;
    const {
      componentList,
      option,
      formProperties,
      approval,
      approvalMoreSetting
    } = this.props;
    const { overrideid } = this.state;

    return (
      <>
        <div className='flow-node approval'>
          <div
            onClick={() => {
              // 每次打开的时候，使用的是 option
              this.initState();
              this.setState({
                drawerVisible: true
              });
            }}
          >
            <NodeBox
              {...curInfo}
              componentList={componentList?.map(
                (item): IComponent => {
                  return {
                    id: item.id,
                    componentName: item.componentName,
                    label: item.props?.label || '',
                    options: item.props?.options || []
                  } as IComponent;
                }
              )}
            ></NodeBox>
          </div>
          <div className='bottom-v-line'></div>
          <AddNode {...curInfo}></AddNode>
        </div>
        <Drawer
          className='approval-editor'
          width={550}
          onClose={() => {
            this.setState({
              drawerVisible: false
            });
          }}
          closable
          maskClosable={false}
          visible={this.state.drawerVisible}
        >
          {this.renderHeader()}

          <div className='approval-editor-body'>
            <Radio.Group
              className={Styles['radio-solid']}
              value={this.state.settingTab}
              onChange={(value) => {
                this.setState({
                  settingTab: value
                });
              }}
            >
              <Radio.Button key='ApprovalSetting' value='approvalSetting'>
                审批人设置
              </Radio.Button>
              <Radio.Button key='CCSetting' value='ccSetting'>
                抄送人设置
              </Radio.Button>
              <Radio.Button key='FormRoleSetting' value='formRoleSetting'>
                表单权限
                <Popover
                  getContainer={() =>
                    document.querySelector('.approval-editor')
                  }
                  content={
                    <img
                      style={{ width: '400px' }}
                      src='https://p0.meituan.net/travelcube/643fce25c60982c148e05782eb109c5687520.png'
                      alt=''
                    />
                  }
                  placement='bottomRight'
                >
                  <Icon type='info-circle-o'></Icon>
                </Popover>
              </Radio.Button>
              <Radio.Button key='AdvancedSetting' value='advancedSetting'>
                高级设置
              </Radio.Button>
            </Radio.Group>
          </div>

          {this.state.settingTab === 'approvalSetting' && (
            <Form className='approval-editor-body' ref={this.formRef}>
              <Form.Item>
                <Card
                  className={Styles.cardStyles}
                  header={
                    <div className='card-header'>
                      <span>审批人</span>
                      {/* <Icon type="delete-o" ></Icon> */}
                    </div>
                  }
                >
                  <ApprovalGroup
                    groupType='APPROVER'
                    formProperties={formProperties}
                    componentList={componentList
                      .filter((item) => {
                        return item.props?.required;
                      })
                      .map((item) => {
                        return {
                          id: item.id,
                          label: item.props?.label,
                          type: item.componentName
                        };
                      })}
                    approvalGroup={this.state.approvalGroup}
                    option={option}
                    overrideid={overrideid || option?.overrideid || ''}
                    id={approval.id}
                    approvalMoreSetting={approvalMoreSetting}
                    onApprovalChange={(approvalGroup) => {
                      const { approverType } = approvalGroup;
                      let { starterDeduplicate } = this.state;
                      if (approverType === APPROVERTYPE.DESIGNATE_BY_SELF) {
                        starterDeduplicate = ApprovalDeDuplicateType.No;
                      }
                      this.setState({
                        approvalGroup: {
                          ...this.state.approvalGroup,
                          ...approvalGroup
                        },
                        starterDeduplicate
                      });
                    }}
                  ></ApprovalGroup>
                </Card>
              </Form.Item>
              <Form.Item>
                <div className='label'>当审批人在多个节点重复配置时：</div>
                <Radio.Group
                  value={this.state.approverDeduplicate}
                  onChange={(approverDeduplicate: ApprovalDeDuplicateType) => {
                    this.setState({
                      approvalGroup: {
                        ...this.state.approvalGroup
                      },
                      approverDeduplicate
                    });
                  }}
                  className='vertical-radio'
                >
                  <Radio key='no' value={ApprovalDeDuplicateType.Yes}>
                    第一个节点需要审批人处理，后续重复节点则自动跳过
                    <Tooltip
                      autoDestory
                      message={
                        <div>
                          <h4>什么是自动跳过？</h4>
                          <div>
                            如果当前节点还有其他审批人，则交由其他审批人进行审批
                          </div>
                          <div>
                            如果当前节点没有其他审批人，则该节点自动通过
                          </div>
                        </div>
                      }
                    >
                      <Icon type='info-circle-o' style={{ fontSize: 16 }} />
                    </Tooltip>
                  </Radio>
                  <Radio key='yes' value={ApprovalDeDuplicateType.No}>
                    本节点需审批人处理，不自动跳过
                  </Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item>
                <div className='label'>当审批人是发起人自己时：</div>
                <Radio.Group
                  value={this.state.starterDeduplicate}
                  onChange={(starterDeduplicate: ApprovalDeDuplicateType) => {
                    this.setState({
                      approvalGroup: {
                        ...this.state.approvalGroup
                      },
                      starterDeduplicate
                    });
                  }}
                  className='vertical-radio'
                >
                  <Radio key='yes' value={ApprovalDeDuplicateType.Yes}>
                    自动跳过
                    <Tooltip
                      autoDestory
                      message={
                        <div>
                          <h4>什么是自动跳过？</h4>
                          <div>
                            如果当前节点还有其他审批人，则交由其他审批人进行审批
                          </div>
                          <div>
                            如果当前节点没有其他审批人，则该节点自动通过
                          </div>
                        </div>
                      }
                    >
                      <Icon type='info-circle-o' style={{ fontSize: 16 }} />
                    </Tooltip>
                  </Radio>
                  <Radio key='no' value={ApprovalDeDuplicateType.No}>
                    由发起人对自己审批
                  </Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item>
                <span className='label'>提示：</span>
                <div className='more-info'>
                  <p>若审批人离职，会通知其上级处理。</p>
                  <p>若匹配不到审批人，流程自动挂起</p>
                </div>
              </Form.Item>
            </Form>
          )}

          {this.state.settingTab === 'ccSetting' && (
            <Form className='approval-editor-body' ref={this.formRef}>
              <Form.Item>
                <AddCC
                  formProperties={formProperties}
                  option={option}
                  ccGroups={this.state.ccGroups}
                  nodetype={NODETYPE.Task}
                  onCCChange={({ ccGroups }) => {
                    this.setState({
                      ccGroups: [...ccGroups]
                    });
                  }}
                />
              </Form.Item>
            </Form>
          )}

          {this.state.settingTab === 'formRoleSetting' && (
            <FormRole
              componentList={componentList}
              process={approval.process}
              option={option}
              formRoles={this.state.formRoles}
              nodeType={NODETYPE.Task}
              onFormRoleChange={(val) => {
                this.setState({
                  formRoles: [...val]
                });
              }}
            ></FormRole>
          )}

          {this.state.settingTab === 'advancedSetting' && (
            <div className='approval-editor-body'>
              <AdvancedSetting
                overrideid={overrideid}
                allOverrideid={this.state.allOverrideid}
                advanced={this.state.advanced}
                changeOverrideid={this.changeOverrideid}
                onChange={(newData) => {
                  const { advanced } = this.state;
                  const newAdvanced = { ...advanced, ...newData };
                  this.setState({ advanced: newAdvanced });
                }}
              />
            </div>
          )}

          <div className='approval-editor-footer'>
            <div className='btn-group'>
              <Button type='primary' onClick={this.handleSave}>
                保存
              </Button>
              <Button className='btn-cancel' onClick={this.handleCancel}>
                取消
              </Button>
            </div>
          </div>
        </Drawer>
      </>
    );
  }
}
