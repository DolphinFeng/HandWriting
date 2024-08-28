import _ from 'lodash';
import { inject, observer } from 'mobx-react';
// import '@ss/mtd-react/lib/style/index.css';
import React, { Component } from 'react';
import { Input, Card, Select, Loading } from '@ss/mtd-react';

import { withRouter, history } from 'onejs/router';
import ajax from '@/services/ajax';

import './index.less';

const { Option } = Select;

@inject(({ global }) => {
  return {
    setCurrentPd: global.setCurrentPd,
    currentPd: global.currentPd
  };
})
@observer
@withRouter
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      allList: [],
      sysList: [],
      allSysList: [],
      apploading: false,
      pdloading: false
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  async handleClickItem(pd) {
    this.props.setCurrentPd(pd);
    history.push(`/jimu/editor?appCode=${pd.appCode}&pdCode=${pd.pdCode}`);
  }

  async fetchData(val) {
    this.setState({
      apploading: true
    });
    const sysData = await ajax.post(
      `/jimu/api/bpm/service/bpm/dac/dataset/app-list`,
      {
        tenantId: '1',
        filter: val || ''
      }
    );

    const sysList = sysData.pageList;
    const allSysList = _.cloneDeep(sysList);
    this.setState({
      allSysList,
      sysList,
      apploading: false
    });

    this.getpdList(sysList?.[0]?.appId);
  }

  async getpdList(id) {
    if (!id) return;
    this.setState({
      pdloading: true
    });
    const resData = await ajax.post(
      `/jimu/api/bpm/service/bpm/gp/bpm_tran/data`,
      {
        fkMtBpmAppId: id,
        istat: 3,
        page: { pageNo: 1, pageSize: 300 },
        tenantId: '1'
      }
    );
    this.setState({
      list: resData.pageList,
      allList: _.cloneDeep(resData.pageList),
      pdloading: false
    });
  }

  handleChange(option) {
    this.getpdList(option && option.value);
  }

  handleFilterSys = (val = '') => {
    const curList = this.state.allSysList.filter((option) => {
      return option.appCode.includes(val) || option.appName.includes(val);
    });
    this.setState({
      sysList: curList
    });
  };

  handleFilterList = (ele) => {
    const val = ele.target.value;
    const curList = this.state.allList.filter((option) => {
      return option.pdCode.includes(val) || option.pdName.includes(val);
    });
    this.setState({
      list: curList
    });
  };

  render() {
    const { list, allList, sysList } = this.state;
    return (
      <div className='jimu-page-list'>
        <div className='select-wrp'>
          <div className='form-item'>
            <span>我的系统：</span>
            <Select
              filterable
              onFilter={this.handleFilterSys}
              style={{ width: 200 }}
              onChange={this.handleChange.bind(this)}
            >
              {sysList &&
                sysList.map((option, index) => (
                  <Option
                    key={index}
                    value={option.appId}
                    name={option.appName}
                  >
                    <span>
                      <span style={{ float: 'left' }}>{option.appName}</span>
                    </span>
                  </Option>
                ))}
            </Select>
          </div>
          {allList && allList.length > 0 && (
            <div className='form-item'>
              流程过滤： <Input onChange={this.handleFilterList} />
            </div>
          )}
        </div>
        <Loading loading={this.state.pdloading || this.state.apploading}>
          {list &&
            list.map((item) => {
              return (
                <Card
                  key={item.pdCode}
                  header={item.pdName}
                  style={{ width: '400px' }}
                  bodyStyle={{ lineHeight: '30px' }}
                  onClick={this.handleClickItem.bind(this, item)}
                >
                  <p>{`系统名称：${item.appName}`}</p>
                </Card>
              );
            })}
        </Loading>
      </div>
    );
  }
}
