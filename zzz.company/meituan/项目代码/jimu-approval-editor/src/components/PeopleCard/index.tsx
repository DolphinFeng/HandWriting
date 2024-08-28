import React from 'react';
import { Popover } from '@ss/mtd-react';
import './index.less';
import NameCard from '@onejs/people-vcard';

enum EJobStatus {
  INJOB = 15,
  OUTJOB = 16
}

interface PopNameCardProps {
  userInfo?: {
    avatar: string;
    orgNamePath: string;
    name: string;
    account: string;
    jobStatusId: EJobStatus;
    uid: number;
  };
  mis?: string;
  tenantId?: string;
  children?: any;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

export type PopNameCardState = {
  visible: boolean;
};

export default class PopNameCard extends React.Component<
  PopNameCardProps,
  PopNameCardState
> {
  state = {
    visible: false
  };

  visibleChange = (visible) => {
    if (this.props.onVisibleChange) {
      this.props.onVisibleChange(visible);
    }
    this.setState({
      visible
    });
  };

  render() {
    const { children, ...rest } = this.props;
    const { visible } = this.state;
    return (
      <Popover
        {...rest}
        visible={visible}
        onVisibleChange={this.visibleChange}
        content={visible ? <NameCard {...this.props} /> : null}
        className='pop-name-card'
        delayShow={300}
      >
        {children}
      </Popover>
    );
  }
}

PopNameCard.defaultProps = {
  userInfo: null,
  mis: '',
  tenantId: '1',
  children: null,
  visible: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onVisibleChange: () => {}
};
