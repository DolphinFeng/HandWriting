import React, { Component } from 'react';
import classNames from 'classnames';
import { SortableItemType } from './SortableList';
import Styles from './index.less';
import { ISetting, MessageType, MessageTemplate } from './MessageSetting.type';

interface IProps {
  messageType: MessageType;
  setting: ISetting;
}

export default class CardPreview extends Component<IProps, any> {
  constructor(props) {
    super(props);
  }

  renderAction = () => {
    const { setting, messageType } = this.props;

    if (setting.fastApprove) {
      return (
        <div className={Styles['message-card-action']}>
          <div className={Styles['action-reject']}>驳回</div>
          <div className={Styles['action-approve']}>通过</div>
        </div>
      );
    }
    const actionClass = classNames({
      [`${Styles['action-approve']}`]:
        messageType === MessageType.PENDING ||
        messageType === MessageType.CC ||
        messageType === MessageType.APPROVED ||
        messageType === MessageType.REJECTED,
      [`${Styles['action-normal']}`]: messageType === MessageType.WITHDREW
    });

    return (
      <div className={Styles['message-card-action']}>
        <div className={actionClass}>{MessageTemplate[messageType].action}</div>
      </div>
    );
  };

  render() {
    const { setting, messageType } = this.props;
    const template = MessageTemplate[messageType].tpl;
    const fieldsHtml = (
      setting?.fields?.map((item: SortableItemType) => {
        return `${item.name}：审批时候生成`;
      }) || []
    ).join('\n');
    const { title } = MessageTemplate[messageType];

    return (
      <>
        <div className={Styles['setting-item-desc']}>通知卡片效果预览</div>
        <div className={Styles['setting-item-content']}>
          <div className={Styles['message-card']}>
            <div className={Styles['message-card-title']}>{title}</div>
            <div
              className={Styles['message-card-content']}
              dangerouslySetInnerHTML={{
                __html: `${template} \n ${fieldsHtml}`
              }}
            ></div>
            {setting.fastApprove ? (
              <div className={Styles['message-card-detail']}>
                <a>审批详情</a>
              </div>
            ) : null}

            {this.renderAction()}
          </div>
        </div>
      </>
    );
  }
}
