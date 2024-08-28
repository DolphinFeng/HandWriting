import React from 'react';
import { Select, Loading } from '@ss/mtd-react';

import { debounce } from 'lodash';
import { splitJointKey } from '@/utils';
import { ICondition } from '../Condition/condition.types';

const { Option } = Select;

export interface ISearch {
  remote: Function;
  dataMap?: IDataMap;
  remoteType?: string; // 表示远程请求类型，once表示只请求一次
}
export interface IDataMap {
  labelKey: string;
  valueKey: string;
}

export interface ISearchSelectProps {
  onChange?: Function;
  value?: ICondition;
  componentProperty?: any;
  style?: React.CSSProperties;
  data?: Array<string>;
  search: ISearch;
  className?: string;
}

export interface IDataSourceData {
  value: string;
  label: string;
}

interface ISearchSelectState {
  dataSource: IDataSourceData[];
  loading: boolean;
  dataSourceType?: string;
  onceFlag: boolean;
  initialDataSource: IDataSourceData[];
}

export default class SearchSelect extends React.Component<
  ISearchSelectProps,
  ISearchSelectState
> {
  state = {
    dataSource: this.props.data,
    loading: false,
    dataSourceType: undefined,
    onceFlag: true,
    initialDataSource: []
  };

  lastFilter = null;

  componentWillMount() {
    const { value } = this.props;
    let { dataSource } = this.state;
    const len = (dataSource && dataSource.length) || 0;

    if (value && !len) {
      dataSource = Array.isArray(value) ? value : [value];
    }

    this.setState({
      dataSource
    });
  }

  // 对于选项数据源需要特殊处理：subPropertyCode用于后端流程判断，从billData里取值
  handleChange = (value: any) => {
    const { dataSourceType } = this.state;
    // console.log('------handleChange', dataSourceType);
    if (value) {
      if (Array.isArray(value)) {
        value = value.map((v) => {
          if (dataSourceType) {
            return { ...v.optionOrigin, subPropertyCode: 'value' };
          }
          // 不存在dataSourceType时需要将subPropertyCode清空
          return { ...v.optionOrigin, subPropertyCode: '' };
        });
      } else {
        // eslint-disable-next-line no-lonely-if
        if (dataSourceType) {
          value = { ...value.optionOrigin, subPropertyCode: 'value' };
        } else {
          value = { ...value.optionOrigin, subPropertyCode: '' };
        }
      }
    }
    // 通知表单
    this.props.onChange && this.props.onChange(value);
  };

  filterRemote = debounce(
    (filter) => {
      this.lastFilter = filter;
      this.setState({ loading: true, dataSource: [] });
      const { remote } = this.props.search || {};
      remote(filter).then(
        (res: any) => {
          // console.log('-----res', res)
          if (res) {
            const { pageList = [], dataSourceType } = res;
            this.setState({
              dataSource: pageList,
              loading: false,
              dataSourceType
            });
          }
        },
        () => {
          this.setState({
            dataSource: [],
            loading: false
          });
        }
      );
    },
    1000,
    {
      leading: true
    }
  );

  filterLocal = debounce(
    (filter) => {
      const { dataMap = {} } = this.props.search || {};
      const { labelKey = 'label', valueKey = 'value' } = dataMap;
      if (!filter) {
        this.setState({
          dataSource: this.props.data
        });
      } else {
        const filteredDatasource = this.props.data?.filter((item) => {
          return (
            String(item[valueKey]).indexOf(filter) >= 0 ||
            String(item[labelKey]).indexOf(filter) >= 0
          );
        });
        this.setState({
          dataSource: filteredDatasource
        });
      }
    },
    1000,
    {
      leading: true
    }
  );

  filterRemoteOnce = debounce(
    (filter) => {
      // console.log('-----dataSource', this.state.dataSource)
      // console.log('-------filterRemoteOnce', this.state.onceFlag);
      // 只请求一次
      if (this.state.onceFlag) {
        this.lastFilter = filter;
        this.setState({ loading: true, dataSource: [] });
        const { remote } = this.props.search || {};
        remote(filter).then(
          (res: any) => {
            // console.log('-----res', res)
            if (res) {
              const { pageList = [], dataSourceType } = res;
              this.setState({
                dataSource: pageList,
                loading: false,
                dataSourceType,
                onceFlag: false,
                initialDataSource: pageList
              });
            }
          },
          () => {
            this.setState({
              dataSource: [],
              loading: false,
              onceFlag: true
            });
          }
        );
        // 做本地筛选
      } else if (!filter || filter.length === 0) {
        this.setState({ dataSource: this.state.initialDataSource });
      } else {
        const newDataSource =
          Array.isArray(this.state.initialDataSource) &&
          this.state.initialDataSource.filter((item) => {
            return item?.label && item?.label?.indexOf(filter) > -1;
          });
        this.setState({ dataSource: newDataSource });
      }
    },
    1000,
    {
      leading: true
    }
  );

  handleFilter = (filter: any) => {
    const { remote, remoteType } = this.props.search || {};
    // console.log('------handleFilter', { remote, remoteType });
    // 远程模式
    if (remote && remoteType === 'once') {
      this.filterRemoteOnce(filter);
    } else if (remote) {
      this.filterRemote(filter);
    } else {
      this.filterLocal(filter);
      // 本地模式
    }
  };

  // 这里需要的 value 有两种形态, {} 和 [] , 但 data
  // parseDataToValue = () => {};

  render() {
    const { dataMap = {} as IDataMap } = this.props.search || {};
    const { dataSource = [], loading } = this.state;
    const { labelKey = 'label', valueKey = 'value' } = dataMap;
    const { componentProperty = {}, value } = this.props;
    let bindValue = null;

    if (value) {
      // 外面统一设置的 data 为对象，如果是多选，将data 设为 [];
      if (componentProperty.multiple) {
        if (Array.isArray(value)) {
          bindValue = value.map((v) => {
            return {
              label: splitJointKey(v, labelKey),
              value: v[valueKey],
              optionOrigin: v
            };
          });
        } else {
          bindValue = [];
        }
      } else {
        bindValue = {
          label: splitJointKey(value, labelKey),
          value: value[valueKey],
          optionOrigin: value
        };
      }
    }

    return (
      <Select
        className={this.props.className}
        value={bindValue}
        {...componentProperty}
        // style={style}
        loading={loading}
        loadingMessage={() => <Loading />}
        onFilter={this.handleFilter}
        onChange={this.handleChange}
      >
        {dataSource.map((option, index) => (
          <Option optionOrigin={option} key={index} value={option[valueKey]}>
            {splitJointKey(option, labelKey)}
          </Option>
        ))}
      </Select>
    );
  }
}
