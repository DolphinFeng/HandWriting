import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Form, Select, Tooltip, Icon, Input } from '@ss/mtd-react';
import { debounce } from 'lodash';
import classNames from 'classnames';
import { getEmployee, getDept } from '@/services/user';
import ChooseIcon from '@/components/ChooseIcon';
import { IApprovalTriInfo, IValid } from '@/store/approvalTripartite';
import './index.less';

const { Option } = Select;

interface IProps {
  isActive: boolean;
  approvalTriInfo: IApprovalTriInfo;
  setApprovalTriInfo: (key: string, value: any) => void;
  approvalTriInfoValidation: IValid;
}
interface IGroup {
  id: string;
  label: string;
}
interface IState {
  responseDeptGroup: IGroup[];
  responsePersonGroup: IGroup[];
}

@inject(({ approvalTripartite }) => ({
  approvalTriInfo: approvalTripartite.approvalTriInfo,
  setApprovalTriInfo: approvalTripartite.setApprovalTriInfo,
  approvalTriInfoValidation: approvalTripartite.approvalTriInfoValidation
}))
@observer
export default class BaseInfo extends Component<IProps, IState> {
  approvalTriInfoRef: React.RefObject<unknown>;

  constructor(props: IProps | Readonly<IProps>) {
    super(props);

    this.state = {
      responseDeptGroup: [], // 归属部门
      responsePersonGroup: [] // 流程负责人
    };

    this.approvalTriInfoRef = React.createRef();
  }

  componentDidMount() {
    this.approvalTriInfoRef.current.setAllFieldsValue(
      this.props.approvalTriInfo
    );
  }

  componentDidUpdate() {
    this.approvalTriInfoRef.current &&
      this.approvalTriInfoRef.current.setAllFieldsValue(
        this.props.approvalTriInfo
      );
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  onFieldValueChangeHandle(key: string, value: string) {
    const { setApprovalTriInfo } = this.props;
    setApprovalTriInfo(key, value);
  }

  // 搜索流程负责人
  handlePersonSearch = debounce((val) => {
    getEmployee(val).then((data) => {
      if (data) {
        this.setState({ responsePersonGroup: data.pageList });
      }
    });
  }, 300);

  // 搜索归属部门
  handleDeptSearch = debounce((val) => {
    getDept(val).then((data) => {
      this.setState({ responseDeptGroup: data.pageList });
    });
  }, 300);

  render(): React.ReactNode {
    const { responseDeptGroup, responsePersonGroup } = this.state;
    const {
      isActive,
      approvalTriInfo,
      setApprovalTriInfo,
      approvalTriInfoValidation
    } = this.props;
    const {
      name,
      icon,
      belongDept,
      responsibleUser,
      applicationScope,
      description,
      purpose,
      callbackUrl,
      accessKey,
      accessSecret,
      businessDetailUrl,
      requesterDetailUrl
    } = approvalTriInfo;

    const hasNameError =
      approvalTriInfoValidation.nameValid &&
      approvalTriInfoValidation.nameValid.length > 0;
    const hasCallBackUrlError =
      approvalTriInfoValidation.callbackUrlValid &&
      approvalTriInfoValidation.callbackUrlValid.length > 0;
    const hasKeyError =
      approvalTriInfoValidation.accessKeyValid &&
      approvalTriInfoValidation.accessKeyValid.length > 0;
    const hasSecretError =
      approvalTriInfoValidation.accessSecretValid &&
      approvalTriInfoValidation.accessSecretValid.length > 0;
    const hasDetailUrlError =
      approvalTriInfoValidation.businessDetailUrlValid &&
      approvalTriInfoValidation.businessDetailUrlValid.length > 0;

    const hasRequesterDetailUrlError =
      approvalTriInfoValidation.requesterDetailUrlValid &&
      approvalTriInfoValidation.requesterDetailUrlValid.length > 0;

    return (
      <div className={`tripartite-base-info ${isActive ? 'active' : ''}`}>
        <Form
          ref={this.approvalTriInfoRef}
          labelPosition='top'
          className='base-info-panel'
          labelWidth='400px'
          onFieldValueChange={this.onFieldValueChangeHandle.bind(this)}
        >
          <Form.Item>
            <div className='subtitle'>基础信息</div>
          </Form.Item>
          <Form.Item formItemKey='icon' required label='图标'>
            <ChooseIcon icon={icon} setInfo={setApprovalTriInfo} />
          </Form.Item>
          <Form.Item
            formItemKey='name'
            label={
              <span
                className={classNames({
                  'has-base-error': hasNameError
                })}
              >
                名称
              </span>
            }
            required
            rules={[
              {
                message: '名称不能为空且不超过20个字',
                required: true,
                max: 20
              }
            ]}
          >
            <Input value={name} toFormItem />
          </Form.Item>
          <Form.Item formItemKey='belongDept' label='归属部门'>
            <Select
              value={belongDept?.name}
              onChange={(item) => {
                setApprovalTriInfo('belongDept', {
                  id: item?.value || '',
                  name: item?.label || ''
                });
              }}
              onFilter={(val) => {
                this.handleDeptSearch(val);
              }}
            >
              {responseDeptGroup.map((option) => (
                <Option key={option.id} value={option.id}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item formItemKey='responsibleUser' label='流程负责人'>
            <Select
              value={responsibleUser?.name}
              onChange={(item) => {
                setApprovalTriInfo('responsibleUser', {
                  id: item?.value || '',
                  name: item?.label || ''
                });
              }}
              onFilter={(val) => {
                this.handlePersonSearch(val);
              }}
            >
              {responsePersonGroup.map((option) => (
                <Option key={option.id} value={option.id}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            formItemKey='applicationScope'
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
              value={applicationScope}
              placeholder='最多输入200字'
              autosize={{ minRows: 1, maxRows: 5 }}
              maxLength={200}
              showCount
              toFormItem
            />
          </Form.Item>
          <Form.Item
            formItemKey='description'
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
              value={description}
              placeholder='最多输入500字'
              autosize={{ minRows: 1, maxRows: 5 }}
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
              autosize={{ minRows: 1, maxRows: 5 }}
              maxLength={200}
              showCount
              toFormItem
            />
          </Form.Item>
          <Form.Item>
            <div className='subtitle'>开发接入设置</div>
          </Form.Item>
          <Form.Item
            formItemKey='callbackUrl'
            label={
              <span>
                <span
                  className={classNames({
                    'has-base-error': hasCallBackUrlError
                  })}
                  style={{ marginRight: 4 }}
                >
                  审批操作按钮接口链接地址
                </span>
                <a
                  href='https://km.sankuai.com/page/1300877614'
                  target='_blank'
                >
                  帮助文档
                </a>
              </span>
            }
            required
            rules={[
              {
                message: '请符合http或者https格式且不超过1000字',
                pattern: /(http|https):\/\/([\w.]+\/?)\S*/
              }
            ]}
          >
            <Input value={callbackUrl} toFormItem />
          </Form.Item>
          <Form.Item
            formItemKey='accessKey'
            label={
              <span
                className={classNames({
                  'has-base-error': hasKeyError
                })}
              >
                AccessKey
              </span>
            }
            required
            rules={[
              {
                message: 'AccessKey填写错误，请检查。5-20位数字或字母组成',
                pattern: /^[0-9A-Za-z]{5,20}$/,
                max: 20
              }
            ]}
          >
            <Input value={accessKey} toFormItem />
          </Form.Item>
          <Form.Item
            formItemKey='accessSecret'
            label={
              <span
                className={classNames({
                  'has-base-error': hasSecretError
                })}
              >
                AccessSecret
              </span>
            }
            required
            rules={[
              {
                message: 'AccessSecret填写错误，请检查。5-20位数字或字母组成',
                pattern: /^[0-9A-Za-z]{5,20}$/,
                max: 20
              }
            ]}
          >
            <Input value={accessSecret} toFormItem />
          </Form.Item>
          <Form.Item
            formItemKey='businessDetailUrl'
            label={
              <span
                className={classNames({
                  'has-base-error': hasDetailUrlError
                })}
              >
                业务系统审批表单详情页链接
              </span>
            }
            rules={[
              {
                message: '请符合http或者https格式且不超过1000字',
                pattern: /(http|https):\/\/([\w.]+\/?)\S*/,
                max: 1000
              }
            ]}
          >
            <Input value={businessDetailUrl} toFormItem />
          </Form.Item>

          <Form.Item
            formItemKey='requesterDetailUrl'
            required
            label={
              <span
                className={classNames({
                  'has-base-error': hasRequesterDetailUrlError
                })}
              >
                已发起单据链接
                <Tooltip
                  className='tooltip-text'
                  message='用于建群沟通时，群公告链接取值，申请人点击群公告链接跳转至审批发起页'
                >
                  <Icon type='info-circle-o' />
                </Tooltip>
              </span>
            }
            rules={[
              {
                message: '请符合http或者https格式且不超过1000字',
                pattern: /(http|https):\/\/([\w.]+\/?)\S*/,
                max: 1000
              }
            ]}
          >
            <Input value={requesterDetailUrl} toFormItem />
          </Form.Item>
        </Form>
      </div>
    );
  }
}
