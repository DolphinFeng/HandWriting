import { inject, observer } from 'mobx-react';
// import '@ss/mtd-react/lib/style/index.css';
import React, { Component } from 'react';
import { debounce } from 'lodash';
import classNames from 'classnames';

import {
  Form,
  Input,
  Popover,
  Button,
  Select,
  Radio,
  Icon,
  Tooltip
} from '@ss/mtd-react';
import { withRouter } from 'onejs/router';
import './index.less';
import WhoApply from './WhoApply';
import WhoManage from './WhoManage';
import WhoCanView from './WhoCanView';

import { getCategory } from '@/services/bpmn';
import { getEmployee, getDept } from '@/services/user';

const { Option } = Select;
@inject(({ approval }) => ({
  setApprovalInfo: approval.setApprovalInfo,
  approvalInfo: approval.approvalInfo,
  approvalInfoValidation: approval.approvalInfoValidation
}))
@observer
@withRouter
export default class BaseInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      icons: [
        'https://p0.meituan.net/travelcube/fab0501608ef3c0d491028b1c9f3e3323160.png',
        'https://p0.meituan.net/travelcube/fe7adda4332bcb067114f87e965f62a72562.png',
        'https://p0.meituan.net/travelcube/1632d1b30df57b34cd9fc73e2e0294fb2290.png',
        'https://p1.meituan.net/travelcube/e7e92302f624941de24c57c88615446c2070.png',
        'https://p0.meituan.net/travelcube/90f901ed6c09b1271f1ca9d4f06949f42168.png',
        'https://p0.meituan.net/travelcube/d687514d5b9f5462e7a4f3bc1d7464312046.png',
        'https://p1.meituan.net/travelcube/d490e0fa4a9bd4f2a346393291d3b97c1933.png'
      ],
      defaultIcon:
        'https://p1.meituan.net/travelcube/d490e0fa4a9bd4f2a346393291d3b97c1933.png',
      visibleIcons: false,
      categoryGroup: [],
      responseDeptGroup: [],
      responsePersonGroup: []
    };

    this.baseInfoRef = React.createRef();
  }

  componentDidMount() {
    this.baseInfoRef.current.setAllFieldsValue(this.props.approvalInfo);
  }

  componentDidUpdate() {
    this.baseInfoRef.current &&
      this.baseInfoRef.current.setAllFieldsValue(this.props.approvalInfo);
  }

  onFieldValueChangeHandle(key, value) {
    const { setApprovalInfo } = this.props;
    // const fields = this.baseInfoRef.current.validateFields([key]);
    setApprovalInfo(key, value);
  }

  handlePersonSearch = debounce((val) => {
    getEmployee(val).then((data) => {
      if (data) {
        this.setState({ responsePersonGroup: data.pageList });
      }
    });
  }, 300);

  handleDeptSearch = debounce((val) => {
    getDept(val).then((data) => {
      this.setState({ responseDeptGroup: data.pageList });
    });
  }, 300);

  handleCategory = () => {
    getCategory().then((categoryGroup) => {
      this.setState({
        categoryGroup
      });
    });
  };

  render() {
    const { icons, visibleIcons, categoryGroup } = this.state;
    const {
      approvalInfo,
      setApprovalInfo,
      approvalInfoValidation
    } = this.props;
    const {
      approvalName,
      iconUrl,
      description,
      category,
      showInSubmitList
    } = approvalInfo;

    const IconsList = (
      <div className='icons-list'>
        {icons.map((item, index) => {
          return (
            <div
              className='icon-item'
              key={index}
              onClick={() => {
                setApprovalInfo('iconUrl', item);
                this.setState({
                  visibleIcons: false
                });
              }}
            >
              <img src={item} alt='' />
            </div>
          );
        })}
      </div>
    );

    const hasStartersError =
      approvalInfoValidation.startersValid &&
      approvalInfoValidation.startersValid.length > 0;
    const hasManagersError =
      approvalInfoValidation.managersValid &&
      approvalInfoValidation.managersValid.length > 0;
    const hasCategoryError =
      approvalInfoValidation.categoryValid &&
      approvalInfoValidation.categoryValid.length > 0;
    const hasNameError =
      approvalInfoValidation.nameValid &&
      approvalInfoValidation.nameValid.length > 0;

    const { host } = window.location;
    const isProduction = host === 'shenpi.sankuai.com';
    const isStaging = host === 'shenpi.it.st.sankuai.com';

    return (
      <div className='base-info' style={{ width: '100%', height: '100%' }}>
        <Form
          ref={this.baseInfoRef}
          labelPosition='top'
          className='base-info-panel'
          labelWidth='400px'
          onFieldValueChange={this.onFieldValueChangeHandle.bind(this)}
        >
          <Form.Item>
            <div className='subtitle'>基础信息</div>
          </Form.Item>
          <Form.Item formItemKey='iconUrl' required label='图标'>
            {/* <Input toFormItem /> */}
            <Popover
              placement='bottomLeft'
              trigger='click'
              visible={visibleIcons}
              onDocumentClick={() => {
                this.setState({
                  visibleIcons: false
                });
              }}
              content={IconsList}
            >
              <div className='approval-item-icon'>
                <div className='approval-icon'>
                  <img src={iconUrl} alt='' />
                  <Input
                    style={{ display: 'none' }}
                    value={iconUrl}
                    toFormItem
                  />
                </div>
                <Button
                  onClick={() => {
                    this.setState({
                      visibleIcons: true
                    });
                  }}
                >
                  修改
                </Button>
              </div>
            </Popover>
          </Form.Item>
          <Form.Item
            formItemKey='approvalName'
            labelWidth='100%'
            label={
              <div
                className='approval-name-label'
                style={{ display: 'inline' }}
              >
                <span
                  className={classNames({
                    'has-base-error': hasNameError
                  })}
                >
                  名称
                </span>
                <a
                  target='_blank'
                  href='https://km.sankuai.com/page/1313950591'
                >
                  命名规范
                </a>
              </div>
            }
            // required
            rules={[
              {
                message: '名称不能为空',
                required: true,
                validator: (rules, value) => value.length > 0
              },
              {
                message: '名称只能由 4-20 个汉字,英文字母,下划线,数字组成',
                validator: (rules, value) => {
                  if (value.length > 20 || value.length < 4) {
                    return false;
                  }
                  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/gi.test(value)) {
                    return false;
                  }
                  return true;
                }
              }
            ]}
          >
            <Input
              value={approvalName}
              toFormItem
              placeholder='请参考命名规范，输入审批名称。建议10字以内。'
            />
          </Form.Item>
          <Form.Item
            // formItemKey='category'
            required
            label={
              <span
                className={classNames({
                  'has-base-error': hasCategoryError
                })}
              >
                所属分类
              </span>
            }
          >
            <Select
              value={category}
              filterable={false}
              clearable={false}
              onFocus={this.handleCategory}
              onChange={(val) => {
                setApprovalInfo('category', val.label);
              }}
            >
              {categoryGroup.map((option, index) => (
                <Option key={index} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            formItemKey='summary'
            label='概要（内容将显示在发起审批页面流程名称的下方）'
          >
            <Input value={description} toFormItem />
          </Form.Item>
          <Form.Item
            required
            formItemKey='showInSubmitList'
            label={
              <div className='show-in-submit-list'>
                <span>在发起审批页面展示入口 </span>
                <Tooltip
                  className='tooltip-text'
                  message={
                    <div>
                      <p>
                        若不希望用户在审批中心找到该审批并自行申请，请选择“否”。适用于仅从业务系统发起的审批，或仍在前期配置阶段的审批等。
                      </p>
                      <p>
                        发起审批页：
                        <a
                          href={
                            isProduction || isStaging
                              ? 'https://shenpi.sankuai.com/p/approvallist'
                              : 'https://shenpi.it.test.sankuai.com/p/approvallist'
                          }
                          target='_blank'
                        >
                          前往查看
                        </a>
                      </p>
                    </div>
                  }
                >
                  <Icon type='info-circle-o' />
                </Tooltip>
              </div>
            }
          >
            <Radio.Group value={showInSubmitList} toFormItem>
              <Radio key='yes' value={3}>
                是
              </Radio>
              <Radio key='no' value={-5}>
                否（适用于通过接口发起的审批等）
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            formItemKey='processStarters'
            required
            label={
              <span
                className={classNames({
                  'has-base-error': hasStartersError
                })}
              >
                谁可以发起这个审批
              </span>
            }
          >
            <WhoApply toFormItem />
          </Form.Item>
          <Form.Item
            formItemKey='processManagers'
            required
            label={
              <span
                className={classNames({
                  'has-base-error': hasManagersError
                })}
              >
                谁可以管理这个审批
                <Tooltip
                  className='tooltip-text'
                  message='拥有这个审批的全部权限，可进行审批编辑、设置以及数据管理'
                >
                  <Icon type='info-circle-o' />
                </Tooltip>
              </span>
            }
          >
            <WhoManage toFormItem />
          </Form.Item>
          <Form.Item
            formItemKey='processDataViewers'
            label={
              <span>
                谁可以查看或导出审批数据
                <Tooltip
                  className='tooltip-text'
                  message='可查看这个审批的所有单据，或在快搭管理后台导出这个审批的所有数据。无审批设置、应用管理员、数据管理员设置等权限。'
                >
                  <Icon type='info-circle-o' />
                </Tooltip>
              </span>
            }
          >
            <WhoCanView toFormItem />
          </Form.Item>
        </Form>
      </div>
    );
  }
}
