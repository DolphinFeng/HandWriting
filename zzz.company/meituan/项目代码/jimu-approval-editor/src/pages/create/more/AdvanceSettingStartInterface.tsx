import { Loading, Select } from '@ss/mtd-react';
import React, { useState, useEffect } from 'react';
import Styles from './index.less';
import { ClientAppKeys, IClientAppkeys } from './index.type';
import { getAppKeyList } from '@/services/bpmn';

const { Option } = Select;

export interface IProps {
  onChange: Function;
  clientAppKeys: IClientAppkeys;
}

// const data = ['com.sankuai.it.ape'];

export default function AdvanceSettingStartInterface(props: IProps) {
  const { onChange, clientAppKeys } = props;

  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const curVal = [...clientAppKeys].map((item) => ({
    value: item,
    label: item
  }));
  const [value, setValue] = useState(curVal);
  const [filter, setFilter] = useState('');
  useEffect(() => {
    getAppKeyList({ fuzzy: '' }).then((data) => {
      // console.log('getAppKeyList', data)
      const curData = data?.slice && data?.slice(0, 20);
      setDataSource(curData);
    });
  }, []);
  // const timer = useRef();

  const handleChange = (value: Array<{ value: string; label: string }>) => {
    // console.log(value);
    setValue(value);
    const clientId: IClientAppkeys = (value || []).map((item) => item.value);
    onChange(clientId, ClientAppKeys);
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleFilter = (filter: string) => {
    if (!filter) {
      setFilter('');
      return;
    }
    // if (loading) return;
    setLoading(true);
    setDataSource([]);
    // let data = await getAppKeyList({ fuzzy: filter });
    getAppKeyList({ fuzzy: filter }).then((data) => {
      const curData = data?.slice && data?.slice(0, 20);
      setDataSource(curData);
      setFilter(filter);
      setLoading(false);
    });
  };

  return (
    <>
      <div className={Styles['setting-item-desc']}>开放接口授权</div>
      <div className={Styles['setting-item-desc-detail']}>
        选择一个应用系统调用当前审批流程开放接口。
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
        <span style={{ marginRight: '10px' }}>请选择AppKey</span>
        <Select
          style={{ width: '430px' }}
          value={value}
          loading={loading}
          loadingMessage={() => <Loading />}
          notFoundMessage={
            filter ? '不存在该Appkey选项' : '请输入关键字搜索appKey'
          }
          placeholder='请选择或搜索'
          multiple
          maxTagCount={2}
          onFilter={handleFilter}
          onChange={handleChange}
        >
          {dataSource.map((value, index) => (
            <Option key={index} value={value}>
              {value}
            </Option>
          ))}
        </Select>
      </div>
    </>
  );
}
