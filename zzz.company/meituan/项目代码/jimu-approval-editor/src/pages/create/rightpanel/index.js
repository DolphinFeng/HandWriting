import { inject, observer } from 'mobx-react';
// import '@ss/mtd-react/lib/style/index.css';
import React, { Component } from 'react';

import { withRouter } from 'onejs/router';
import './index.less';

@inject(({ approval }) => ({
  setApprovalInfo: approval.setApprovalInfo,
  approvalInfo: approval.approvalInfo
}))
@observer
@withRouter
export default class BaseInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // ...this.props.approvalInfo
    };

    this.baseInfoRef = React.createRef();
  }

  componentDidMount() {}

  componentDidUpdate() {}

  onFieldValueChangeHandle() {}

  render() {
    return (
      <div className='right-panel' style={{ width: '100%', height: '100%' }}>
        <span></span>
      </div>
    );
  }
}
