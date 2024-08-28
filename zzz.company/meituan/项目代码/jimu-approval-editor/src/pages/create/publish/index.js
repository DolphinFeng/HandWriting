import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { debounce } from 'lodash';
import classNames from 'classnames';
import { withRouter } from 'onejs/router';
import {
  Form,
  TreeSelect,
  Icon,
  Input,
  Tooltip,
  Select,
  Announcement
} from '@ss/mtd-react';
import './index.less';
import { getEmployee, getDept, getBusiness } from '@/services/user';

const { Option } = Select;

@inject(({ approval }) => ({
  setDeployInfo: approval.setDeployInfo,
  deployInfo: approval.deployInfo,
  deployInfoValidation: approval.deployInfoValidation,
  approvalResult: approval.approvalResult,
  version: approval.version
}))
@observer
@withRouter
export default class DeployInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      responseDeptGroup: [],
      responsePersonGroup: [],
      authMatterLoading: false,
      authMatterGroup: [],
      currentGroup: [],
      filter: ''
    };
    this.deployInfoRef = React.createRef();
  }

  onFieldValueChangeHandle(key, value) {
    const { setDeployInfo } = this.props;
    setDeployInfo(key, value);
  }

  handleDeptSearch = debounce((val) => {
    getDept(val).then((data) => {
      this.setState({ responseDeptGroup: data.pageList });
    });
  }, 300);

  handlePersonSearch = debounce((val) => {
    getEmployee(val).then((data) => {
      if (data) {
        this.setState({ responsePersonGroup: data.pageList });
      }
    });
  }, 300);

  authMatterSolve(data, depth = 0, path = '') {
    const newData = [];
    data.forEach((item) => {
      const newItem = item;
      if (depth < 2) newItem.disabled = true;
      newItem.path = path ? `${path}/${item.name}` : item.name;
      if (item?.children && item?.children.length > 0) {
        newItem.children = this.authMatterSolve(
          item.children,
          depth + 1,
          newItem.path
        );
      }
      newData.push(newItem);
    });
    return newData;
  }

  handleValueChange = (option, id) => {
    this.props.setDeployInfo('authMatterId', id);
    this.props.setDeployInfo('authMatterName', option?.path);
  };

  handleVisibleChange = (visible) => {
    if (visible) {
      this.setState({ authMatterLoading: true, filter: '' });
      getBusiness()
        .then((data) => {
          const newData = this.authMatterSolve(data);
          this.setState({
            currentGroup: newData,
            authMatterGroup: newData,
            authMatterLoading: false
          });
        })
        .catch(() => {
          this.setState({
            currentGroup: [],
            authMatterGroup: [],
            authMatterLoading: false
          });
        });
    }
  };

  // 对正则特殊字符进行转义，用于用户输入内容作为正则表达式变量
  regEscape = (keyword) => {
    const newKeyword = (keyword || '').replace(/([.*+?^${}()|[\]\\])/g, '\\$&');
    try {
      return new RegExp(`(${newKeyword})`, 'g');
    } catch {
      return new RegExp(`()`, 'g');
    }
  };

  getHighlight = (label, keyword) => {
    const reg = this.regEscape(keyword);
    const labelArr = (label || '')
      .replace(reg, '*$1*')
      .split('*')
      .filter((item) => item !== '');
    return labelArr.map((item, index) => {
      if (item === keyword) {
        // 处理label
        return (
          <span key={label + index} style={{ color: '#0A70F5' }}>
            {item}
          </span>
        );
      }
      return (
        <span key={label + index} style={{ color: 'rgba(0,0,0,.6)' }}>
          {item}
        </span>
      );
    });
  };

  authMatteFilter = (data, filter, newData) => {
    data.forEach((item) => {
      if (item.path.includes(filter) && !item?.disabled) {
        newData.push({ id: item.id, name: item.name, path: item.path });
      }
      if (item?.children && item?.children.length > 0) {
        this.authMatteFilter(item.children, filter, newData);
      }
    });
    return newData;
  };

  onFilter = (filter) => {
    if (!filter) {
      this.setState({ currentGroup: this.state.authMatterGroup });
      return;
    }
    this.setState({ authMatterLoading: true });
    const newData = this.authMatteFilter(
      this.state.authMatterGroup,
      filter,
      []
    );
    this.setState({
      filter,
      currentGroup: newData,
      authMatterLoading: false
    });
  };

  renderNodeContent = (node) => {
    if (node?.disabled) {
      return <span style={{ color: 'rgba(0,0,0,.6)' }}>{node.name}</span>;
    }

    return (
      <span>
        {this.state.filter
          ? this.getHighlight(node.path, this.state.filter)
          : node.name}
      </span>
    );
  };

  componentDidMount() {
    this.deployInfoRef.current.setAllFieldsValue(this.props.deployInfo);
  }

  componentDidUpdate() {
    this.deployInfoRef.current &&
      this.deployInfoRef.current.setAllFieldsValue(this.props.deployInfo);
  }

  render() {
    const {
      responseDeptGroup,
      responsePersonGroup,
      authMatterLoading,
      currentGroup
    } = this.state;

    const { setDeployInfo, deployInfo, deployInfoValidation } = this.props;

    const {
      authMatterName,
      authMatterId,
      changeAuthMatter,
      approvalStatus,
      approvalStatusName,
      approvalUrl,
      responseDept,
      responsePerson,
      coverage,
      businessDesc,
      purpose
    } = deployInfo;

    const statusColor = {
      NONE: '#000000',
      PENDING: '#E2B010',
      APPROVED: '#00b365'
    };

    const hasBusinessError =
      deployInfoValidation.authMatterValid &&
      deployInfoValidation.authMatterValid.length > 0;

    const hasPersonError =
      deployInfoValidation.personValid &&
      deployInfoValidation.personValid.length > 0;

    return (
      <div className='approval-publish'>
        <Form
          ref={this.deployInfoRef}
          labelPosition='top'
          className='approval-publish-panel'
          labelWidth='400px'
          onFieldValueChange={this.onFieldValueChangeHandle.bind(this)}
        >
          <Form.Item>
            <Announcement
              title={
                <div>
                  <p>根据公司规定，审批流程发布前须选择所属授权事项。</p>
                  <p>
                    重点授权事项的审批发布前须通过内控审核，非重点授权事项的审批可直接发布上线。
                  </p>
                </div>
              }
              showIcon
              type='info'
            ></Announcement>
          </Form.Item>
          <Form.Item
            formItemKey='businessScene'
            required
            label={
              <span
                className={classNames(
                  {
                    'has-base-error': hasBusinessError
                  },
                  'publish-subtitle'
                )}
              >
                所属授权事项
              </span>
            }
            labelPosition='top'
          >
            {changeAuthMatter && (
              <div>
                <div className='authMatterName-text'>
                  <span>
                    请选择流程归属的授权事项（至少选到第三级事项），有疑问可参考
                  </span>
                  <a
                    href='https://km.sankuai.com/collabpage/1821726509'
                    target='_blank'
                  >
                    帮助文档
                  </a>
                </div>
                <TreeSelect
                  data={currentGroup}
                  value={{ path: authMatterName, id: authMatterId }}
                  onChange={this.handleValueChange}
                  onVisibleChange={this.handleVisibleChange}
                  onFilter={this.onFilter}
                  notFoundMessage='无数据，请联系公众号：流程肖邦'
                  loading={authMatterLoading}
                  treeProps={{
                    keyField: 'id',
                    labelField: 'name',
                    renderNodeContent: this.renderNodeContent
                  }}
                  renderInputLabel={(node) => node.path || node.name}
                />
              </div>
            )}
            {!changeAuthMatter && (
              <div className='authMatterName-scene'>
                <div className='authMatterName-text'>
                  所属授权事项审核通过后不可修改，如特殊原因需要修改请联系公众号：流程肖邦。
                </div>
                <span>{authMatterName}</span>
              </div>
            )}
          </Form.Item>
          <Form.Item
            label={
              <div className='approval-status'>
                <span className='publish-subtitle'>流程审核状态</span>
                <Tooltip
                  className='tooltip-text'
                  message='关联重点事项的审批需内控审核通过才能正式发布，详询公众号：流程肖邦'
                >
                  <Icon type='info-circle-o' className='approval-status-icon' />
                </Tooltip>
                <span
                  style={{ color: statusColor[approvalStatus] }}
                  className='approval-status-text'
                >
                  {approvalStatusName || '-'}
                </span>
                {approvalUrl && (
                  <a href={approvalUrl} target='_blank'>
                    查看详情
                  </a>
                )}
              </div>
            }
          >
            <div>
              <span style={{ color: 'gray' }}>
                针对重要业务场景下的流程，发布后将由公司流程管理员审核流程方案的合理性，如有疑问，
              </span>
              <a
                href='https://km.sankuai.com/collabpage/1821942095'
                target='_blank'
              >
                请联系各业务线的流程管理员
              </a>
            </div>
          </Form.Item>
          <Form.Item style={{ paddingTop: '20px' }}>
            <span className='publish-subtitle'>审批说明</span>
            <Tooltip
              className='tooltip-text'
              message='以下信息将展示在审批单据详情页，请详细填写，便于用户了解流程内容及注意事项，或反馈流程建议。'
            >
              <Icon type='info-circle-o' className='approval-status-icon' />
            </Tooltip>
          </Form.Item>
          <Form.Item formItemKey='responseDept' label='归属部门'>
            <Select
              value={responseDept.name}
              onChange={(item) => {
                setDeployInfo('responseDept', {
                  id: item?.value || '',
                  name: item?.label || ''
                });
              }}
              onFilter={(val) => {
                this.handleDeptSearch(val);
              }}
            >
              {responseDeptGroup.map((option, index) => (
                <Option key={index} value={option.id}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            required
            formItemKey='responsePerson'
            label={
              <span
                className={classNames({
                  'has-base-error': hasPersonError
                })}
              >
                流程负责人
              </span>
            }
          >
            <Select
              value={responsePerson.name}
              onChange={(item) => {
                setDeployInfo('responsePerson', {
                  id: item?.value || '',
                  name: item?.label || ''
                });
              }}
              onFilter={(val) => {
                this.handlePersonSearch(val);
              }}
            >
              {responsePersonGroup.map((option, index) => (
                <Option key={index} value={option.id}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            formItemKey='coverage'
            label={
              <div>
                <span>适用范围 </span>
                <Tooltip
                  className='tooltip-text'
                  message='示例：适用于HR员工申请HR相关数据，不适用于非HR员工申请HR数据。'
                >
                  <Icon type='info-circle-o' />
                </Tooltip>
              </div>
            }
          >
            <Input.TextArea
              value={coverage}
              placeholder='最多输入200字'
              autosize={{ maxRows: 5 }}
              maxLength={200}
              showCount
              toFormItem
            />
          </Form.Item>
          <Form.Item
            formItemKey='businessDesc'
            label={
              <div>
                <span>流程概述 </span>
                <Tooltip
                  className='tooltip-text'
                  message='简单概述这个流程的要点，包括审批设置依据及最高审批节点。示例：HR同学申请HR相关数据时，根据数据密级设置审批流程，C2由直接主管审批，C3由直接主管审批，抄送隔级主管，C4由直接主管+隔级主管审批。'
                >
                  <Icon type='info-circle-o' />
                </Tooltip>
              </div>
            }
          >
            <Input.TextArea
              value={businessDesc}
              placeholder='最多输入500字'
              autosize={{ maxRows: 5 }}
              maxLength={500}
              showCount
              toFormItem
            />
          </Form.Item>
          <Form.Item
            formItemKey='purpose'
            label={
              <div>
                <span>流程目的 </span>
                <Tooltip
                  className='tooltip-text'
                  message='示例：1.把控数据申请的必要性和合理性；2.评估数据泄密的风险。'
                >
                  <Icon type='info-circle-o' />
                </Tooltip>
              </div>
            }
          >
            <Input.TextArea
              value={purpose}
              placeholder='最多输入200字'
              autosize={{ maxRows: 5 }}
              maxLength={200}
              showCount
              toFormItem
            />
          </Form.Item>
        </Form>
      </div>
    );
  }
}
