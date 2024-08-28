// import '@ss/mtd-react/lib/style/index.css';
import React, { Component } from 'react';
import { Radio, Popover, Icon } from '@ss/mtd-react';
import Styles from './index.less';
import {
  MessageType,
  IMessageSetting,
  MessageTemplate
} from './MessageSetting.type';
import FieldsList from './FieldsList';
import CardPreview from './CardPreview';
import { IComponent } from '@/utils/form.type';

interface IState {
  messageType: MessageType;
}

interface IProps {
  messageSetting: IMessageSetting;
  componentList: IComponent[];
  onChange: Function;
}

export default class MessageSetting extends Component<IProps, IState> {
  constructor(props) {
    super(props);
    // 配置默认值
    this.state = {
      messageType: MessageType.PENDING
    };
  }

  handleFastApproveChange = (setting, val) => {
    const { onChange, messageSetting } = this.props;

    setting.fastApprove = val;

    onChange({
      messageSetting: { ...messageSetting }
    });
  };

  handleMessageTypeChange = (messageType, setting) => {
    const { onChange, messageSetting } = this.props;

    if (setting.isEdit) {
      // 正在编辑，不允许跳
      setting.validateMessage = '请先保存所选的控件信息';
      onChange({
        messageSetting: { ...messageSetting }
      });
      return;
    }

    this.setState({
      messageType
    });
  };

  render() {
    const { messageSetting, onChange, componentList } = this.props;
    const setting = messageSetting[this.state.messageType];

    if (!setting) {
      return null;
    }

    return (
      <>
        <div className={Styles['setting-panel']}>
          {/* 通知内容 */}
          <div className={Styles['setting-item']}>
            <div className={Styles['setting-item-title']}>通知设置</div>
            <div className={Styles['setting-item-desc']}>
              通知内容
              <Popover
                content='请选择在审批通知中对审批决策最有帮助的表单字段，最多支持3个，可拖拽排序'
                placement='bottomRight'
              >
                <Icon type='info-circle-o'></Icon>
              </Popover>
            </div>

            <div className={Styles['setting-item-desc-detail']}>
              待审批消息通知中配置表单字段会作为审批关键信息展示
            </div>

            <div className={Styles['setting-item-content']}>
              <Radio.Group
                value={this.state.messageType}
                onChange={(messageType) => {
                  this.handleMessageTypeChange(messageType, setting);
                }}
                className={Styles['setting-bar']}
              >
                {Object.keys(MessageTemplate).map((key, index) => {
                  return (
                    <Radio.Button key={index} value={key}>
                      {MessageTemplate[key].tabName}
                    </Radio.Button>
                  );
                })}
              </Radio.Group>
              <FieldsList
                setting={setting}
                componentList={componentList}
                onChange={(settingValue) => {
                  messageSetting[this.state.messageType] = settingValue;

                  onChange({
                    messageSetting: { ...messageSetting }
                  });
                }}
              ></FieldsList>
            </div>
          </div>

          {/* 快捷审批：只有待审批通知才有 */}

          {this.state.messageType === MessageType.PENDING ? (
            <div className={Styles['setting-item']}>
              <div className={Styles['setting-item-desc']}>
                是否在待审批卡片上展示通过和驳回按钮
                <Popover content='若审批管理员对节点审批人设置了任一控件的编辑权限，则该节点的审批卡片上不展示通过和驳回按钮'>
                  <Icon
                    type='info-circle-o'
                    className={Styles['setting-item-tip']}
                  />
                </Popover>
              </div>
              <div className={Styles['setting-item-content']}>
                <Radio.Group
                  onChange={(val) => {
                    this.handleFastApproveChange(setting, val);
                  }}
                  value={setting.fastApprove}
                >
                  <Radio value>是</Radio>
                  <Radio value={false}>否</Radio>
                </Radio.Group>
              </div>
            </div>
          ) : null}

          {/* 卡片预览 */}
          <div className={Styles['setting-item']}>
            <CardPreview
              messageType={this.state.messageType}
              setting={setting}
            ></CardPreview>
          </div>
        </div>
      </>
    );
  }
}
