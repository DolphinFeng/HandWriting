import { inject } from 'mobx-react';
import { withRouter } from 'onejs/router';
import React, { Component } from 'react';
import BaseInfo from './base/index';
import { getFlowById } from '@/services/tripartite';
import './view.less';

interface IProps {
  curStep: number;
  initApprovalData: Function;
  developInfo: any;
  baseInfo: any;
  history: any;
  form: string;
  backFn: any;
}

interface IState {}

@withRouter
@inject(({ approvalTripartite }) => {
  return {
    curStep: approvalTripartite.curStep,
    initApprovalData: approvalTripartite.initApprovalData,
    baseInfo: approvalTripartite.baseInfo,
    form: approvalTripartite.form,
    developInfo: approvalTripartite.developInfo,
    backFn: approvalTripartite.backFn
  };
})
export default class Create extends Component<IProps, IState> {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    const { backFn } = this.props;
    window.removeEventListener('beforeunload', backFn); // 离开页面时，清除监听
    window.removeEventListener('pagehide', backFn); // 离开页面时，清除监听
    window.removeEventListener('unload', backFn); // 离开页面时，清除监听
  }

  componentDidMount() {
    const { backFn } = this.props;
    window.addEventListener('beforeunload', backFn, false);
    window.addEventListener('pagehide', backFn, false);
    window.addEventListener('unload', backFn, false);

    const { id } = this.props.history.location.query;

    if (!id) {
      this.props.initApprovalData({}, 'create');
      return;
    }

    this.fetchData(id);
  }

  fetchData = async (id) => {
    const result = await getFlowById({
      id
    });
    await this.props.initApprovalData(result, 'update');
  };

  render() {
    const { curStep } = this.props;

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      >
        <BaseInfo isActive={curStep === 0}></BaseInfo>
        {/* <FormInfo isActive={curStep === 1}></FormInfo> */}
      </div>
    );
  }
}
