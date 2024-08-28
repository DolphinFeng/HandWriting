import React from 'react';
import { TreeSelect, Loading } from '@ss/mtd-react';
import { debounce } from 'lodash';

import { ICondition } from '../Condition/condition.type';

export interface ISearch {
  remote?: Function;
  dataMap?: IDataMap;
}

export interface IItemMap {
  labelKey: string;
  valueKey: string;
}

export interface IDataMap extends IItemMap {
  itemKey?: string;
  itemMap?: IItemMap;
}

export interface ISearchTreeSelectProps {
  onChange?: Function;
  value?: ICondition;
  componentProperty?: any;
  style?: React.CSSProperties;
  data?: Array<any>;
  search?: ISearch;
  className?: string;
  allowParentNodeTransToLeafNode?: boolean;
}

export default class SearchTreeSelect extends React.Component<
  ISearchTreeSelectProps,
  any
> {
  state = {
    dataSource: this.props.data,
    loading: false
  };

  filterRemote = debounce(
    (filter) => {
      this.setState({ loading: true, dataSource: [] });
      const { remote } = this.props.search || {};
      if (!remote) {
        return;
      }
      remote(filter).then(
        (res) => {
          const { pageList = [] } = res;
          this.setState({
            dataSource: pageList,
            loading: false
          });
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

  handleFilter = (filter) => {
    const { remote } = this.props.search || {};
    // 远程模式
    if (remote) {
      this.filterRemote(filter);
    } else {
      // 本地模式
      // TODO
    }
  };

  handleChange = (result: any) => {
    const {
      onChange,
      search = {} as ISearch,
      componentProperty: { multiple } = {}
    } = this.props;

    const { dataMap = {} as IDataMap } = search;
    const {
      labelKey = 'label',
      valueKey = 'value',
      itemMap = { labelKey: 'label', valueKey: 'value' }
    } = dataMap;
    // 处理清空的逻辑
    if (!result) {
      onChange &&
        onChange({
          [labelKey]: '',
          [valueKey]: '',
          [itemMap.labelKey]: '',
          [itemMap.valueKey]: ''
        });
      return;
    }
    if (multiple) {
      result = result.map((select) => {
        return select.value;
      });
    } else {
      result = result.value;
    }
    onChange && onChange(result);
  };

  // 数据源转换
  mapData(dataSource) {
    const { search = {}, allowParentNodeTransToLeafNode } = this.props;
    const { dataMap = {} as IDataMap } = search;
    const {
      labelKey = 'label',
      valueKey = 'value',
      itemKey,
      itemMap = { labelKey: 'label', valueKey: 'value' }
    } = dataMap;
    const mapedResults = [];
    const dataSourceLen = (dataSource && dataSource.length) || 0;

    for (let i = 0; i < dataSourceLen; i++) {
      const ds = dataSource[i];
      const childItem = ds[itemKey];
      const childItemLen = (childItem && childItem.length) || 0;
      // 无子节点的节点，如果不允许转换成子节点，就跳过
      if (!allowParentNodeTransToLeafNode && childItemLen === 0) {
        continue;
      }
      const result = {
        id: ds[valueKey],
        name: ds[labelKey],
        leaf: false,
        value: { ...ds, ...{ [itemMap.valueKey]: '', [itemMap.labelKey]: '' } }
      };
      if (childItemLen > 0) {
        result.children = childItem.map((child) => {
          const childResult = {};
          childResult.value = { ...ds, ...child };
          childResult.id = result.id + child[itemMap.valueKey];
          childResult.name = child[itemMap.labelKey];
          return childResult;
        });
      } else if (allowParentNodeTransToLeafNode) {
        // 允许没有子节点的节点变成可选择的子节点
        result.leaf = true;
      }
      mapedResults.push(result);
    }
    return mapedResults;
  }

  // 回显值转换
  mapValue = (value) => {
    const { search = {}, componentProperty: { multiple } = {} } = this.props;
    const { dataMap = {} as IDataMap } = search;
    const {
      valueKey = 'value',
      labelKey = 'label',
      itemKey,
      itemMap = { labelKey: 'label', valueKey: 'value' }
    } = dataMap;
    if (!value || value.length === 0) {
      return multiple ? [] : {};
    }
    if (multiple) {
      return value.map((v) => {
        delete v[itemKey];
        return {
          id: v[valueKey] + (v[itemMap.valueKey] || ''),
          name: v[itemMap.labelKey] ? v[itemMap.labelKey] : v[labelKey],
          value: v
        };
      });
    }
    delete value[itemKey];
    return {
      id: value[valueKey] + (value[itemMap.valueKey] || ''),
      name: value[itemMap.labelKey] ? value[itemMap.labelKey] : value[labelKey]
      // value // 保留业务数据
    };
  };

  render() {
    const { dataSource = [], loading } = this.state;
    const mapResult = this.mapData(dataSource);

    const { value, componentProperty } = this.props;
    const mapValue = this.mapValue(value);

    return (
      <TreeSelect
        onFilter={this.handleFilter}
        data={mapResult}
        onChange={this.handleChange}
        loadingMessage={() => <Loading />}
        loading={loading}
        value={mapValue}
        {...componentProperty}
        treeProps={{
          keyField: 'id',
          labelField: 'name',
          nodeSelection: { parentSelectable: false },
          nodeExpansion: {
            defaultExpandAll: true
          }
        }}
      />
    );
  }
}
