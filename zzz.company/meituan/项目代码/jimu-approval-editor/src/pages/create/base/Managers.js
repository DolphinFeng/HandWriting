import { inject, observer } from 'mobx-react';
// import '@ss/mtd-react/lib/style/index.css';
import React, { Component } from 'react';
import { withRouter } from 'onejs/router';
// import { Icon } from '@ss/mtd-react';
import './managers.less';

@inject(({ approval }) => ({
  setApprovalInfo: approval.setApprovalInfo,
  updateProcessManagers: approval.updateProcessManagers
}))
@observer
@withRouter
export default class Managers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: [
        {
          addProcessManager: 1,
          departmentList: [
            {
              id: '130254',
              type: 3,
              dataType: 'department'
            }
          ],
          exportByDepartment: 1,
          processEdit: 1,
          userId: '2947100'
        }
      ]
    };
  }

  componentDidMount() {}

  componentDidUpdate() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addProcessManager() {}

  render() {
    const { processManagers } = this.props;

    return (
      <div className='manager-list'>
        {processManagers &&
          processManagers.map(
            (item, index) =>
              item && (
                <div className='manager-item' key={item.userId || index}>
                  <div className='manager-item-avatar'>
                    <img src={item.avatar} alt='avatar' />
                  </div>
                  {/* <div className='manager-item-info'>
                    <div className='manager-item-name'>{item.name}</div>
                    <div className='manager-item-bt'>
                      <span>权限</span>
                      <span>删除</span>
                    </div>
                  </div> */}
                </div>
              )
          )}
        {/* <div
          className='manager-item-addbt'
          onClick={() => {
            this.addProcessManager();
          }}
        >
          <Icon type='add'></Icon>
        </div> */}
      </div>
    );
  }
}
