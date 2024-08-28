/* eslint-disable react/require-default-props */
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Button,
  Select,
  Icon,
  Radio,
  Tooltip,
  Loading
} from '@ss/mtd-react';
import cls from 'classnames';
import { IStandardRole } from '@/utils/form.type';
import { getStandardRoles } from '@/services/standardRoles';
import { APPROVETYPE_TITLE } from '../const';
import { APPROVETYPE } from '../task.type';

import './index.less';

const ROLETYPE_TIP = {
  STANDARD_ROLE_FINANCIAL: (
    <div>
      <div>财务BP：BP在业务线/职能线的一线财务同学； </div>
      <div>CFO：美团财务平台的负责人</div>
      <a href='https://km.sankuai.com/collabpage/2174310712' target='_blank'>
        了解更多
      </a>
    </div>
  ),
  STANDARD_ROLE_HR: (
    <div>
      <div>HRBP：BP在业务线/职能线的一线HR同学； </div>
      <div>
        HRBP Leader：一线HRBP汇报链上的直属主管，通常为人力资源负责人的-2；
      </div>
      <div>
        HRBP Head：一线HRBP汇报链上的直属主管，通常为人力资源负责人的-1；
      </div>
      <div>人力资源负责人：美团/人力资源组织的负责人</div>
      <a href='https://km.sankuai.com/collabpage/2174310712' target='_blank'>
        了解更多
      </a>
    </div>
  ),
  STANDARD_ROLE_LEGAL: (
    <div>
      <div>法务BP：BP在业务线/职能线的一线法务同学； </div>
      <div>法务负责人：美团/公司事务平台/法律合规组织的负责人</div>
      <a href='https://km.sankuai.com/collabpage/2174310712' target='_blank'>
        了解更多
      </a>
    </div>
  ),
  STANDARD_ROLE_CONTROL: (
    <div>
      <div>内控BP：BP在业务线/职能线的一线内控同学； </div>
      <div>内控负责人：美团/财务平台/内部控制组织的负责人</div>
      <a href='https://km.sankuai.com/collabpage/2174310712' target='_blank'>
        了解更多
      </a>
    </div>
  )
};

const DATATYPE_MATCH_COMPONENT = {
  String: ['Input', 'Select'],
  Number: ['Number', 'Select'],
  Employee: ['People', 'STARTER'],
  Organization: ['Department'],
  Amount: ['Money']
};

interface Props {
  onChange: (standardRoleConfig, type) => void;
  onClose: () => void;
  roleType: string;
  approveType: string;
  standardRoleConfig?: IStandardRole;
  componentList?: any[];
  systemComponentList?: any[];
}

export default function StandardRolesModal(props: Props): JSX.Element {
  const {
    onChange,
    onClose,
    roleType,
    standardRoleConfig = {},
    componentList = [],
    systemComponentList = [],
    approveType
  } = props;
  const { roleId, properties = [] } = standardRoleConfig as IStandardRole;
  const [roleList, setRoleList] = useState<any[]>([]);
  const [selRole, setSelRole] = useState<IStandardRole>();
  const [nextProperties, setNextProperties] = useState<any[]>([]);
  const [nextApproveType, setNextApprovetype] = useState('');
  const [roleError, setRoleError] = useState<string | JSX.Element>('');
  const [propertiesError, setPropertiesError] = useState('');
  const [loading, setLoading] = useState(true);

  const SystemAndFormComponentList = componentList.concat(systemComponentList);

  useEffect(() => {
    getStandardRoles(roleType)
      .then((roles) => {
        setRoleList(roles);
        // 已经保存过的情况下，初使化处理
        if (roleId) {
          const realRole = roles.find((role) => {
            return role.roleId === roleId;
          });
          if (realRole) {
            setSelRole(realRole);
            const { approvalTypes = [] } = realRole;

            // 初使化approveType
            if (approvalTypes.includes(approveType)) {
              setNextApprovetype(approveType);
            }

            // 初使化properties 过滤到已经失效的属性
            const realProperties = realRole.properties || [];
            const tempProperties: any[] = [];
            properties.forEach((pro) => {
              const realPro = realProperties.find((item) => {
                return item.code === pro.code;
              });
              realPro &&
                tempProperties.push({
                  ...pro,
                  ...realPro
                });
            });
            if (tempProperties.length === 0 && realProperties.length > 0) {
              tempProperties.push({
                ...realProperties[0]
              });
            }
            setNextProperties(tempProperties);
          } else {
            setRoleError('标准角色失效，请重新选择标准审批角色');
          }
        }
      })
      .catch(() => {
        setRoleError(
          <>
            <span>标准角色获取失败，请联系 </span>
            <a
              target='_blank'
              href='https://x.sankuai.com/bridge/chat?pubid=138065147385'
            >
              流程肖邦
            </a>
          </>
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleChangeRole = (obj) => {
    const tempRole = obj.originOption;
    setSelRole(tempRole);
    setRoleError('');
    setPropertiesError('');
    if (tempRole?.approvalTypes?.length) {
      if (!tempRole?.approvalTypes?.includes(nextApproveType)) {
        setNextApprovetype(tempRole?.approvalTypes[0]);
      }
    } else {
      setNextApprovetype(APPROVETYPE.ALL);
    }
    if (tempRole?.properties?.length) {
      setNextProperties([{ ...tempRole.properties[0] }]);
    } else {
      setNextProperties([]);
    }
  };

  const handleChangeProp = (obj, index) => {
    nextProperties[index] = {
      name: obj.label,
      code: obj.value,
      dataType: obj.originOption?.dataType
    };
    setNextProperties([...nextProperties]);
  };

  const handleChangePropVal = (obj, index) => {
    const tempProp = {} as any;
    tempProp.inputType = obj.originOption.category || 'DYNAMIC';
    tempProp.inputKey = obj.value;
    if (obj.originOption?.type === 'Select') {
      tempProp.dataPath = 'value';
    }
    nextProperties[index] = {
      name: nextProperties[index].name,
      code: nextProperties[index].code,
      dataType: nextProperties[index].dataType,
      ...tempProp
    };

    setNextProperties([...nextProperties]);
  };

  const handleChange = () => {
    if (loading) return;
    if (!selRole) {
      setRoleError('请选择具体审批角色');
      return;
    }
    let propError = '';
    if (selRole.properties?.length) {
      nextProperties.forEach((prop) => {
        if (!prop.code || !prop.inputKey) {
          propError = '请设置完整配置项';
        }
      });
    }
    if (propError) {
      setPropertiesError(propError);
      return;
    }

    onChange(
      {
        roleType,
        roleId: selRole?.roleId,
        roleName: selRole?.roleName,
        approvalTypes: selRole?.approvalTypes,
        properties: nextProperties
      },
      nextApproveType
    );
  };

  const addNextProperties = () => {
    nextProperties.push({});
    setNextProperties([...nextProperties]);
  };

  const deleteNextProperties = (index) => {
    if (nextProperties.length > 1) {
      nextProperties.splice(index, 1);
      setNextProperties([...nextProperties]);
    }
  };

  const leftProperties = useMemo(() => {
    return (selRole?.properties || []).filter((pro) => {
      return !nextProperties.find((item) => {
        return item.code === pro.code;
      });
    });
  }, [selRole, nextProperties]);

  return (
    <div>
      <Modal
        title={
          <div className='kd-rolesetting-header'>
            <div>标准角色配置</div>
            <div className='kd-rolesetting-header-subtitle'>
              根据标准角色配置规则，请选择审批角色和标准角色属性配置。如有使用问题，请参考
              <a
                target='_blank'
                href='https://km.sankuai.com/collabpage/2174310712'
              >
                配置说明手册
              </a>
              或联系
              <a
                target='_blank'
                href='https://x.sankuai.com/bridge/chat?pubid=138065147385'
              >
                流程肖邦
              </a>
            </div>
          </div>
        }
        onClose={onClose}
        className='kd-rolesetting-modal'
        maskClosable={false}
      >
        <Modal.Body>
          <Loading loading={loading}>
            <div className='rolesetting-body'>
              <div className='sel-role-box'>
                <div className='sel-role'>
                  <span className='lab'>选择具体审批角色</span>
                </div>
                <div className='sel-role'>
                  <Select
                    placeholder='请选择'
                    value={selRole?.roleId}
                    onChange={handleChangeRole}
                    className={cls({
                      selrole: true,
                      'sel-error': !!roleError
                    })}
                    clearable={false}
                  >
                    {roleList.map((role) => {
                      return (
                        <Select.Option
                          key={role.roleId}
                          value={role.roleId}
                          originOption={role}
                        >
                          {role.roleName}
                        </Select.Option>
                      );
                    })}
                  </Select>
                  <Tooltip message={ROLETYPE_TIP[roleType]}>
                    <Icon type='info-circle-o' />
                  </Tooltip>
                </div>
                {roleError && (
                  <div className='role-error-tips'>{roleError}</div>
                )}
              </div>

              {!!selRole?.properties?.length && (
                <div className='config-property-box'>
                  <div className='rolesetting-lab'>角色属性配置</div>
                  <div className='config-property-list'>
                    {nextProperties.map((item, index) => {
                      return (
                        <div className='config-property-fields'>
                          <Select
                            className={cls({
                              'config-property-sel': true,
                              'sel-error': !item.code
                            })}
                            value={{
                              value: item.code,
                              label: item.name
                            }}
                            onChange={(obj) => {
                              handleChangeProp(obj, index);
                            }}
                            clearable={false}
                            placeholder='请选择属性'
                          >
                            {leftProperties.map((lprop) => {
                              return (
                                <Select.Option
                                  key={lprop.code}
                                  value={lprop.code}
                                  originOption={lprop}
                                >
                                  {lprop.name}
                                </Select.Option>
                              );
                            })}
                          </Select>
                          <span className='config-property-label'>设置为</span>
                          <Select
                            className={cls({
                              'config-property-sel': true,
                              'sel-error': !item.inputKey
                            })}
                            value={item.inputKey}
                            optionLabelProp='name'
                            placeholder='请选择系统字段或表单指定控件'
                            onChange={(val) => {
                              handleChangePropVal(val, index);
                            }}
                            clearable={false}
                            disabled={!item.code}
                          >
                            {SystemAndFormComponentList.filter((component) => {
                              if (
                                item.dataType &&
                                DATATYPE_MATCH_COMPONENT[item.dataType]
                              ) {
                                return DATATYPE_MATCH_COMPONENT[
                                  item.dataType
                                ].includes(component.type);
                              }
                              return false;
                            }).map((component) => {
                              return (
                                <Select.Option
                                  key={component.id}
                                  value={component.id}
                                  name={component.label}
                                  originOption={component}
                                >
                                  <div className='kd-select-option'>
                                    <span>{component.label}</span>
                                    {component.category === 'SYSTEM' && (
                                      <span className='system-label'>
                                        系统字段
                                      </span>
                                    )}
                                  </div>
                                </Select.Option>
                              );
                            })}
                          </Select>
                          {nextProperties.length > 1 && (
                            <Icon
                              type='delete-o'
                              onClick={() => {
                                deleteNextProperties(index);
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {nextProperties.length < selRole.properties.length && (
                    <div>
                      <span
                        onClick={() => {
                          addNextProperties();
                        }}
                        className='config-property-add'
                      >
                        + 添加字段
                      </span>
                    </div>
                  )}
                  {propertiesError && (
                    <div className='role-error-tips'>{propertiesError}</div>
                  )}
                </div>
              )}

              {selRole?.approvalTypes?.length > 1 && (
                <div className='rolesetting-box'>
                  <div className='rolesetting-lab'>
                    多人审批时采用的审批方式
                  </div>
                  <Radio.Group
                    onChange={(type) => {
                      setNextApprovetype(type);
                    }}
                    value={nextApproveType}
                    className='rolesetting-grouptype-sel'
                  >
                    {(selRole?.approvalTypes || []).map((val) => {
                      return (
                        <Radio value={val}>
                          {APPROVETYPE_TITLE[val]?.label}：
                          {APPROVETYPE_TITLE[val]?.desc}
                        </Radio>
                      );
                    })}
                  </Radio.Group>
                </div>
              )}
            </div>
          </Loading>
        </Modal.Body>
        <Modal.Footer>
          <Button style={{ marginRight: '12px' }} onClick={onClose}>
            取消
          </Button>
          <Button type='primary' onClick={handleChange}>
            确定
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
