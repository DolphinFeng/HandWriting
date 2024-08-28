import { inject } from 'mobx-react';
import React from 'react';
import { Dropdown, Menu } from '@ss/mtd-react';
import styles from './index.less';

@inject(({ global }) => {
  return {
    userInfo: global.userInfo
  };
})
export default class ContentWrp extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { avatar } = this.props.userInfo;
    return (
      <div className={styles.contentWrp}>
        <Dropdown
          className='login'
          content={
            <Menu inlineIndent={16}>
              <Menu.Item
                key='MenuItem'
                onClick={() => {
                  window.location.href = '/approval/admin/sso/logout';
                }}
              >
                退出登录
              </Menu.Item>
            </Menu>
          }
          trigger='click'
        >
          <div className='userInfo'>
            <div className='user-avator'>
              <img src={avatar} alt='头像' />
            </div>
          </div>
        </Dropdown>
      </div>
    );
  }
}
