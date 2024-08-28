import React from 'react';
import { Menu } from '@ss/mtd-react';
import './index.less';

const MenuItem = Menu.Item;

export default class Aside extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { curMenu, setMenu, uacPermissionInfo } = this.props;
    return (
      <div className='admin-aside'>
        <Menu
          className='menu-basic-group'
          selectedKeys={[curMenu]}
          onSelectChange={(e) => {
            setMenu(e);
          }}
        >
          {uacPermissionInfo.includes('ApprovalList') && (
            <MenuItem className='MenuItem' key='ApprovalList'>
              审批管理
            </MenuItem>
          )}
          {uacPermissionInfo.includes('TripartiteList') && (
            <MenuItem className='MenuItem' key='TripartiteList'>
              三方审批模板管理
            </MenuItem>
          )}
          {uacPermissionInfo.includes('ApprovalList') && (
            <MenuItem className='MenuItem' key='Export'>
              数据导出
            </MenuItem>
          )}
        </Menu>
      </div>
    );
  }
}
