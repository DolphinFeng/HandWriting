import { i18nClient } from '@sailor/i18n-web';
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Select, Loading } from '@ss/mtd-react';
import { getAttanceAccount } from '@/services/apis';
import defaultImg from '@/asserts/images/default.png';
import styles from './index.less';

interface IPersonSelectItem {
  empId: string;
  name: string;
  mis: string;
  disabled?: boolean;
  avatar?: string;
  global?: any;
}

interface IPersonSelectState {
  dataSource: IPersonSelectItem[];
  loading: boolean;
  filterSave: string;
}

// 参数
interface IPersonSelectProps {
  value?: string; // 选中人员
  onChange: Function; // 传出编辑人的id数组
  popLayer?: any;
  width?: any;
  global?: any;
}

const { Option } = Select;

@inject('global')
@observer
export default class UserSelect extends React.Component<
IPersonSelectProps,
IPersonSelectState
> {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: [],
      loading: true,
      filterSave: null
    };
  }

  handleChange = (value) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(value.value);
    }
  };

  handleFilter = async (filter) => {
    const { value, onChange } = this.props;
    if (!filter) {
      this.setState({
        loading: false
      });
      if (!value) {
        // 未选中值且未输入的时候清空
        this.setState({
          dataSource: []
        });
      }
    } else {
      onChange('');
      this.setState({
        loading: true,
        filterSave: filter,
        dataSource: []
      });
      (async (filterGets) => {
        const {
          currentUser: { empId }
        } = this.props.global;
        const data = await getAttanceAccount({ filter });
        const { filterSave } = this.state;
        if (filterSave === filterGets) {
          this.setState({
            dataSource: data.filter(item => empId !== item.empId),
            loading: false
          });
        }
      })(filter);
    }
  };

  getNameById = (id: string) => {
    const { dataSource } = this.state;
    const selItem = dataSource.find(item => item.empId === id);
    if (selItem) {
      return selItem.name;
    }
    return '';
  };

  render() {
    const { dataSource, loading } = this.state;
    const { value } = this.props;
    return (
      <Select
        className={styles.useSelect}
        style={{ width: this.props.width || 200, margin: '0 auto' }}
        popLayer={{ ...this.props.popLayer }}
        icon={false}
        value={value}
        loading={loading}
        loadingMessage={() => <Loading />}
        onFilter={this.handleFilter}
        onChange={this.handleChange}
        clearable={false}
        placeholder={i18nClient.t('single_user_select_please_input_name', '请输入姓名或 mis 号查询')}
        notFoundMessage={i18nClient.t('single_user_select_no_data', '无数据')}
        renderInputLabel={() => {
          const otherItem = dataSource.find(
            shareItem => +shareItem.empId === +value
          );
          if (otherItem) {
            return otherItem.name;
          }
          return null;
        }}
      >
        {dataSource.map((option, index) => (
          <Option key={index} value={option.empId}>
            <div className={styles.flexC}>
              <img
                className={styles.img}
                src={option.avatar || defaultImg}
                alt={i18nClient.t('single_user_select_avatar', '头像')}
              />
              {option.name}/{option.mis}
            </div>
          </Option>
        ))}
      </Select>
    );
  }
}
