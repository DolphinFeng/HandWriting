import React, { Component } from 'react';
import {
  Icon,
  Select,
  Radio,
  Modal,
  Input,
  Tooltip,
  Popover
} from '@ss/mtd-react';
import cls from 'classnames';
import ChooseUser from '@/components/choose-user';
import StandardRolesModal from './StandardRolesModal/Index';
import {
  InputTypeEnum,
  OutputTypeEnum,
  ReportChainTypeEnum,
  STANDARD_APPROVERTYPE_TITLE
} from '@/utils/form.type';

import {
  APPROVERTYPE_TITLE,
  CC_APPROVERTYPE_TITLE,
  APPROVETYPE_TITLE,
  DEPARTMENT,
  FILTER_CEILINGS,
  STANDARD_APPROVERTYPE_KEY,
  STANDARD_ROLETYPE_TIP,
  SYSTEM_COMPONENTS
} from './const';
import './index.less';
import {
  ISelectedItem,
  APPROVETYPE,
  APPROVERTYPE,
  IApprovalGroupProps,
  IApprovalGroupState,
  OptionTypeEnum,
  Env
} from './task.type';
import { isNewApprovalGroup, getEnv } from './util';

import FormMember from './FormMember';
import InputType from './InputType';

const { Option } = Select;

export default class ApprovalGroup extends Component<
  IApprovalGroupProps,
  {
    chooseUserModalVisibe: boolean;
    updateStandardRolesVisibe: boolean;
  }
> {
  constructor(props: IApprovalGroupProps) {
    super(props);

    this.state = {
      chooseUserModalVisibe: false,
      updateStandardRolesVisibe: false
    };
  }

  handleChooseUserCancel = () => {
    this.setState({
      chooseUserModalVisibe: false
    });
  };

  handleChooseUserSave = (selectedUsers: ISelectedItem[]) => {
    if (selectedUsers.length > 20) {
      Modal.info({
        title: '信息提示',
        message: '指定审批人不能超过 20 人'
      });
      return;
    }

    this.setState({
      chooseUserModalVisibe: false
    });
    this.props.onApprovalChange({
      selectedUsers
    });
  };

  handleChooseUserDelete = (index: number) => {
    const { selectedUsers } = this.props.approvalGroup;

    // 不能直接使用 selectedUsers 操作，会影响外部状态
    const newSelectedUsers = Array.prototype.slice.call(selectedUsers);
    newSelectedUsers.splice(index, 1);

    this.props.onApprovalChange({
      selectedUsers: newSelectedUsers
    });
  };

  handleSaveStandardRolesConfig = (standardRoleConfig, nextApproveType) => {
    const { onApprovalChange } = this.props;
    this.setState({
      updateStandardRolesVisibe: false
    });
    onApprovalChange({
      standardRoleConfig,
      approveType: nextApproveType
    });
  };

  renderSubContent = () => {
    const {
      componentList,
      formProperties,
      approvalGroup,
      onApprovalChange,
      groupType
    } = this.props;

    const isCC = groupType === 'CC';

    const {
      approverType,
      hasError,
      seriesType,
      selectedUsers,
      filterCeiling,
      filterFloor,
      seriesValue,
      standardRoleConfig,
      optionType,
      inputType,
      inputKey
    } = approvalGroup;

    const { chooseUserModalVisibe, updateStandardRolesVisibe } = this.state;

    const departmentGrad = DEPARTMENT.map((item) => {
      return (
        <Option key={item} value={item}>
          {`美团${item}级部门负责人`}
        </Option>
      );
    });

    /**
     * 这是新的 DSL 交互方式，后续都按这一套
     */
    switch (optionType) {
      case OptionTypeEnum.COST_CENTER_OWNER:
        return (
          <InputType
            inputKey={inputKey}
            inputType={inputType}
            hasError={hasError}
            onApprovalChange={onApprovalChange}
            formProperties={formProperties}
          />
        );
      case OptionTypeEnum.STANDARD_ROLES: {
        const hasInvalidProp = (standardRoleConfig?.properties || []).find(
          (p) => !p.inputKey
        );
        return (
          <div className='standard-role-config'>
            <div className='role-config-header'>
              <span className='header-lab'>标准角色设置</span>
              <a
                className='role-edit'
                onClick={() => {
                  this.setState({ updateStandardRolesVisibe: true });
                }}
              >
                点击进行标准角色配置
              </a>
            </div>
            {standardRoleConfig ? (
              <div className='role-config-main'>
                <div className='role-config-col'>
                  <label className='main-lab'>角色类型：</label>
                  <span>{standardRoleConfig.roleName || ''}</span>
                </div>
                {standardRoleConfig?.properties?.length > 0 && (
                  <>
                    <div className='role-config-col'>
                      <label className='main-lab'>角色属性配置</label>
                    </div>
                    <div className='role-config-col'>
                      <div className='role-property-box'>
                        {standardRoleConfig.properties.map((propeyty) => {
                          const componentName = this.getComponentName(
                            propeyty.inputKey
                          );

                          return (
                            <div className='role-property'>
                              <label className='main-lab'>
                                {propeyty.name} ：
                              </label>
                              <span
                                className={cls({
                                  'invalid-control': !propeyty.inputKey
                                })}
                              >
                                {componentName
                                  ? `${componentName}`
                                  : '失效控件'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {hasInvalidProp && hasError && (
                      <div className='error'>
                        属性对应控件已失效，请重新配置
                      </div>
                    )}
                  </>
                )}
                {standardRoleConfig?.approvalTypes?.length > 1 && (
                  <div className='role-config-col'>
                    <label className='main-lab'>多人审批方式：</label>
                    <span>
                      {APPROVETYPE_TITLE[approvalGroup.approveType].label}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              hasError && <div className='error'>请选择审批人</div>
            )}

            {updateStandardRolesVisibe && (
              <StandardRolesModal
                roleType={STANDARD_APPROVERTYPE_KEY[approverType]}
                onChange={this.handleSaveStandardRolesConfig}
                standardRoleConfig={standardRoleConfig}
                approveType={approvalGroup.approveType}
                onClose={() => {
                  this.setState({ updateStandardRolesVisibe: false });
                }}
                componentList={componentList}
                systemComponentList={SYSTEM_COMPONENTS}
              />
            )}
          </div>
        );
      }
      // case OptionTypeEnum.
      default:
        break;
    }

    /**
     * 老的 DSL ，当时第一版小黑屋做的，逻辑很死，这里后续不添加新的审批组了。
     */
    switch (approverType) {
      case APPROVERTYPE.LEADER:
        return (
          <>
            <span className='label'>指定层级</span>

            <div className='approval-select'>
              <Radio.Group
                className='approval-vertical-group'
                value={seriesType}
                onChange={(val) => {
                  onApprovalChange({
                    seriesType: val,
                    seriesValue:
                      val === APPROVERTYPE.LOWER_THAN_CEO ? '-1' : '1'
                  });
                }}
              >
                <Radio value={`${APPROVERTYPE.LEADER}`}>
                  发起人汇报链上的各级主管
                </Radio>
                <Radio value={`${APPROVERTYPE.LOWER_THAN_CEO}`}>
                  按CEO层级向下指定
                </Radio>
              </Radio.Group>

              <Select
                style={{ marginTop: '10px' }}
                onChange={(option) => {
                  onApprovalChange({
                    seriesValue: option?.value
                  });
                }}
                value={seriesValue}
                clearable={false}
              >
                {seriesType === APPROVERTYPE.LEADER
                  ? new Array(10).fill('').map((_item, index) => {
                      const level = index + 1;
                      return (
                        <Option key={level} value={`${level}`}>
                          {`第 ${level} 级上级`}
                        </Option>
                      );
                    })
                  : ['-1', '-2', '-3', '-4', '-5'].map(
                      (item: string, index: number) => {
                        return (
                          <Option key={index} value={item}>
                            {`CEO${item}`}
                          </Option>
                        );
                      }
                    )}
              </Select>
            </div>
          </>
        );
      case APPROVERTYPE.STEPBYSTEP:
        return (
          <>
            <InputType
              inputKey={inputKey}
              inputType={inputType}
              hasError={hasError}
              onApprovalChange={onApprovalChange}
              formProperties={formProperties?.filter((item) => {
                // 逐级审批只要求人员
                return item.componentName === 'People';
              })}
            />

            <span className='label'>审批终点</span>
            <div className='approval-select'>
              <Radio.Group
                className='approval-series-group'
                value={seriesType}
                onChange={(val) => {
                  const seriesDefaultValue =
                    val === APPROVERTYPE.LEADER ? '1' : DEPARTMENT[0];

                  onApprovalChange({
                    seriesType: val,
                    seriesValue: seriesDefaultValue
                  });
                }}
              >
                <Radio value={`${APPROVERTYPE.LEADER}`}>按自下而上</Radio>
                <Radio value={`${APPROVERTYPE.DEPTOWNER}`}>按部门负责人</Radio>
              </Radio.Group>

              <Select
                style={{ marginTop: '10px' }}
                onChange={(option) => {
                  onApprovalChange({
                    seriesValue: option?.value
                  });
                }}
                value={seriesValue}
                clearable={false}
              >
                {seriesType === APPROVERTYPE.LEADER
                  ? new Array(10).fill('').map((_item, index) => {
                      const level = index + 1;
                      return (
                        <Option key={level} value={`${level}`}>
                          {`第 ${level} 级上级`}
                        </Option>
                      );
                    })
                  : departmentGrad}
              </Select>
            </div>

            {seriesType === APPROVERTYPE.LEADER && (
              <div>
                <span className='label'>保底设置</span>
                <div className='approval-select'>
                  <Select
                    onlyKeyValue
                    placeholder='无'
                    value={filterFloor}
                    onChange={(val) => {
                      onApprovalChange({
                        filterFloor: val
                      });
                    }}
                  >
                    {FILTER_CEILINGS.map((key, index) => {
                      return (
                        <Option key={index} value={key}>
                          {key === '-1' || key === '-2'
                            ? `美团${key}级部门负责人`
                            : key}
                        </Option>
                      );
                    })}
                  </Select>
                </div>

                <span className='label'>封顶设置</span>
                <div className='approval-select'>
                  <Select
                    onlyKeyValue
                    placeholder='无'
                    value={filterCeiling}
                    onChange={(val) => {
                      onApprovalChange({
                        filterCeiling: val
                      });
                    }}
                  >
                    {DEPARTMENT.map((item, index) => {
                      return (
                        <Option key={index} value={item}>
                          {`最高审批到美团${item}级部门负责人`}
                        </Option>
                      );
                    })}
                  </Select>
                </div>
              </div>
            )}
          </>
        );
      case APPROVERTYPE.DEPTOWNER:
        return (
          <>
            <span className='label'>指定层级</span>
            <div className='approval-select'>
              <Radio.Group
                className='approval-vertical-group'
                value={seriesType}
                onChange={(val) => {
                  const seriesDefaultValue =
                    val === ReportChainTypeEnum.DEPARTMENT_LEVEL
                      ? '1'
                      : DEPARTMENT[0];
                  onApprovalChange({
                    seriesType: val,
                    seriesValue: seriesDefaultValue
                  });
                }}
              >
                <Radio value={`${ReportChainTypeEnum.DEPARTMENT_LEVEL}`}>
                  按发起人层级向上指定
                </Radio>
                <Radio value={`${ReportChainTypeEnum.DEPARTMENT_DEPTH}`}>
                  按部门层级指定
                  <Popover content='“美团-n”：指一个部门的组织级别以美团为起点向下n级。例如，“美团/基础研发平台”为“美团-1”层级，“美团/基础研发平台/企业平台研发部”为“美团-2”层级。'>
                    <Icon type='info-circle-o' />
                  </Popover>
                </Radio>
              </Radio.Group>

              <Select
                style={{ marginTop: '10px' }}
                onChange={(option) => {
                  onApprovalChange({
                    seriesValue: option?.value
                  });
                }}
                value={seriesValue}
                clearable={false}
              >
                {seriesType === ReportChainTypeEnum.DEPARTMENT_LEVEL
                  ? new Array(10).fill('').map((_item, index) => {
                      const level = index + 1;
                      return (
                        <Option key={level} value={`${level}`}>
                          {`第 ${level} 级部门负责人 ${
                            index === 0 ? '(发起人所在部门负责人)' : ''
                          }`}
                        </Option>
                      );
                    })
                  : departmentGrad}
              </Select>
            </div>
          </>
        );
      case APPROVERTYPE.SPECIFY:
        return (
          <>
            <div className='approval-section'>
              <span className='label'>添加成员</span>
              <div className='add-approver-wrapper'>
                <div
                  className='add-approval-icon'
                  onClick={() => {
                    this.setState({
                      chooseUserModalVisibe: true
                    });
                  }}
                >
                  <Icon type='add'></Icon>
                  {chooseUserModalVisibe && (
                    <>
                      <ChooseUser
                        value={selectedUsers}
                        visible={chooseUserModalVisibe}
                        onClose={this.handleChooseUserCancel}
                        onSave={this.handleChooseUserSave}
                      />
                      {/* {hasError && <div>请选择一个审批人</div>} */}
                    </>
                  )}
                </div>
                {selectedUsers &&
                  selectedUsers.map((item, index) => {
                    return (
                      <div key={index} className='add-approval-item'>
                        <span>{item.label}</span>
                        <Icon
                          type='close'
                          onClick={() => {
                            this.handleChooseUserDelete(index);
                          }}
                        ></Icon>
                      </div>
                    );
                  })}
                {/* 校验信息 */}
              </div>
              {hasError && selectedUsers.length === 0 && (
                <div className='error'>请选择审批人</div>
              )}
            </div>
            {!isCC && (
              <div className='approval-section'>
                <span className='label'>多人审批时采用的审批方式</span>
                <Radio.Group
                  onChange={(approveType) => {
                    onApprovalChange({
                      approveType
                    });
                  }}
                  value={this.props.approvalGroup.approveType}
                  className='approval-type'
                >
                  {Object.keys(APPROVETYPE).map((key, index) => {
                    return (
                      <Radio key={index} value={`${key}`}>
                        {APPROVETYPE_TITLE[key]?.label}：
                        {APPROVETYPE_TITLE[key]?.desc}
                      </Radio>
                    );
                  })}
                </Radio.Group>
              </div>
            )}
          </>
        );
      case APPROVERTYPE.FORM_MEMBER:
        return (
          <FormMember
            formProperties={formProperties}
            formKey={this.props.approvalGroup.formKey}
            formValue={this.props.approvalGroup.formValue}
            hasError={this.props.approvalGroup.hasError}
            isCC={isCC}
            onChange={({ formKey, formValue }) => {
              onApprovalChange({
                formKey,
                formValue
              });
            }}
          ></FormMember>
        );
      case APPROVERTYPE.DESIGNATE_BY_CUSTOMER:
        return (
          <>
            <span className='label'>
              节点标识（key: 自定义ID，value:审批人列表,审批方式）
            </span>
            <a
              href='https://km.sankuai.com/page/1283453667#id-%E5%8F%91%E8%B5%B7%E5%AE%A1%E6%89%B9'
              target='_blank'
              style={{ float: 'right' }}
            >
              接口文档
            </a>
            <Input value={this.props?.overrideid} disabled />
          </>
        );
      default:
        return null;
    }
  };

  handleApproveTypeChange = (val) => {
    const { onApprovalChange } = this.props;

    const approval: IApprovalGroupState = {
      approveType: APPROVETYPE.ALL,
      approverType: val,
      selectedUsers: [],
      seriesType: APPROVERTYPE.LEADER,
      seriesValue: '1',
      formKey: '',
      formValue: '',
      hasError: false,
      standardRoleConfig: undefined
    };
    if (Object.keys(STANDARD_APPROVERTYPE_TITLE).includes(val)) {
      approval.optionType = OptionTypeEnum.STANDARD_ROLES;
    } else if (isNewApprovalGroup(val, 'approvertype')) {
      if (val === APPROVERTYPE.COST_CENTER_OWNEER) {
        approval.optionType = OptionTypeEnum.COST_CENTER_OWNER;
        approval.inputType = InputTypeEnum.STARTER;
        approval.outputType = OutputTypeEnum.COST_CENTER_OWNER;
      }
      if (val === APPROVERTYPE.DESIGNATE_BY_CUSTOMER) {
        approval.optionType = OptionTypeEnum.API_APPROVER;
      }
      if (val === APPROVERTYPE.DESIGNATE_BY_SELF) {
        approval.optionType = OptionTypeEnum.STARTER;
      }
    } else {
      approval.optionType = OptionTypeEnum.UN_KNOWN;
      if (val === APPROVERTYPE.DEPTOWNER) {
        approval.seriesType = ReportChainTypeEnum.DEPARTMENT_LEVEL;
      } else if (val === APPROVERTYPE.STEPBYSTEP) {
        approval.approveType = APPROVETYPE.SERIES;
        approval.inputType = InputTypeEnum.STARTER;
      }
    }

    onApprovalChange({
      ...approval
    });
  };

  renderPopover = (key) => {
    let content: string | React.ReactNode;
    const { groupType } = this.props;
    const isCC = groupType === 'CC';
    const person = isCC ? '抄送人' : '审批人';
    switch (key) {
      case APPROVERTYPE.DESIGNATE_BY_CUSTOMER:
        content =
          '可通过接口动态指定审批人及审批方式（或签、会签、依次审批），适用于业务系统内自定义审批人计算规则的情况。';
        break;
      case APPROVERTYPE.LEADER:
        content =
          '虚拟帐号、代理商等帐号类型没有组织架构，因此没有上级，无法使用此功能。';
        break;
      case APPROVERTYPE.COST_CENTER_OWNEER:
        content = (
          <div className='popover-content-root'>
            <p>
              成本中心负责人是某个成本中心的成本费用预算和执行结果的最终负责人。成本中心负责人需要管理该成本中心的所有成本费用，包括人力成本和非人力成本。
            </p>
            <p>
              若审批流程中涉及预算编制、预算日常管理、预算执行跟踪等情况，需要成本中心负责人审批。
            </p>
          </div>
        );
        break;
      case APPROVERTYPE.DESIGNATE_BY_SELF:
        content =
          '将申请人自己设置为审批人，可用于需要申请人进行信息复核的场景';
        break;
      case APPROVERTYPE.FORM_MEMBER:
        content = (
          <div className='popover-content-root'>
            <p>{`可通过表单设计中的人员、部门控件，指定${person}。注意：暂不支持子表单中的人员、部门控件。`}</p>
            <p>{`配置表单内人员控件：在②表单设计中添加人员控件后，该人员/其上级/部门负责人/HRBP等角色将可以配置为本节点的${person}。`}</p>
            <p>{`配置表单内部门控件：在②表单设计中添加部门控件后，其部门负责人、法务、HRBP等角色将可以配置为本节点的${person}。`}</p>
          </div>
        );
        break;
      default:
        content = '';
    }
    return (
      <Popover content={content}>
        <Icon type='info-circle-o' />
      </Popover>
    );
  };

  renderApproverType = () => {
    const { groupType, approvalMoreSetting } = this.props;
    const { authorizedConfigs = [] } = approvalMoreSetting || {};
    const isCC = groupType === 'CC';
    const RENDER_APPROVERTYPE_TITLE = isCC
      ? CC_APPROVERTYPE_TITLE
      : APPROVERTYPE_TITLE;
    return Object.keys(RENDER_APPROVERTYPE_TITLE)
      .filter((key) => {
        if (!isCC) {
          return true;
        }

        return (
          key === APPROVERTYPE.LEADER ||
          key === APPROVERTYPE.DEPTOWNER ||
          key === APPROVERTYPE.SPECIFY ||
          key === APPROVERTYPE.HRBP ||
          key === APPROVERTYPE.FORM_MEMBER
        );
      })
      .map((key, index) => {
        if (
          key === APPROVERTYPE.DESIGNATE_BY_CUSTOMER &&
          !authorizedConfigs.includes('API_APPROVER')
        ) {
          const { id } = this.props;
          const env = getEnv();
          const url =
            env === Env.production || env === Env.staging
              ? 'https://shenpi.sankuai.com/p/submit?pdId=2511'
              : 'https://shenpi.it.test.sankuai.com/p/submit?pdId=9304';
          const content = id ? (
            <a href={url} target='_blank'>
              请申请权限
            </a>
          ) : (
            '请先在页面右上角发布审批，而后申请权限'
          );
          return (
            <Radio key={index} value={key} disabled>
              <Tooltip message={content} color='light'>
                {RENDER_APPROVERTYPE_TITLE[key]}
              </Tooltip>
              {this.renderPopover(key)}
            </Radio>
          );
        }
        if (!isCC && key === APPROVERTYPE.HRBP) {
          return (
            <Radio key={index} value={key} disabled>
              <Tooltip message='请选择HR类标准角色审批人'>
                {RENDER_APPROVERTYPE_TITLE[key]}
              </Tooltip>
            </Radio>
          );
        }
        if (
          key === APPROVERTYPE.LEADER ||
          key === APPROVERTYPE.COST_CENTER_OWNEER ||
          key === APPROVERTYPE.DESIGNATE_BY_SELF ||
          key === APPROVERTYPE.DESIGNATE_BY_CUSTOMER
        ) {
          return (
            <Radio key={index} value={key}>
              {APPROVERTYPE_TITLE[key]}
              {this.renderPopover(key)}
            </Radio>
          );
        }
        if (key === APPROVERTYPE.FORM_MEMBER) {
          const { formProperties } = this.props;
          const disabled = formProperties.length === 0;
          return (
            <Radio key={index} value={key} disabled={disabled}>
              {disabled ? (
                <Tooltip
                  message='未检测到人员、部门控件，请先在②表单设计中添加对应控件'
                  color='light'
                >
                  {APPROVERTYPE_TITLE[key]}
                </Tooltip>
              ) : (
                APPROVERTYPE_TITLE[key]
              )}
              {this.renderPopover(key)}
            </Radio>
          );
        }

        if (Object.keys(STANDARD_APPROVERTYPE_TITLE).includes(key)) {
          return (
            <Radio key={index} value={key}>
              {RENDER_APPROVERTYPE_TITLE[key]}
              <Popover content={STANDARD_ROLETYPE_TIP[key]}>
                <Icon type='info-circle-o' />
              </Popover>
            </Radio>
          );
        }

        return (
          <Radio key={index} value={key}>
            {RENDER_APPROVERTYPE_TITLE[key]}
          </Radio>
        );
      });
  };

  getComponentName = (id) => {
    const { componentList } = this.props;
    const findComp = (componentList || [])
      .concat(SYSTEM_COMPONENTS)
      .find((component) => {
        return component.id === id;
      });
    return findComp ? findComp.label : '';
  };

  render() {
    return (
      <div>
        <Radio.Group
          value={this.props.approvalGroup.approverType}
          className='approval-group'
          onChange={this.handleApproveTypeChange}
        >
          {this.renderApproverType()}
        </Radio.Group>
        <div className='sub-content'>
          <div className='top-line'></div>

          {this.renderSubContent()}
        </div>
      </div>
    );
  }
}
