import { i18nClient } from '@sailor/i18n-web';
import React from 'react';
import { Select, Loading, Tooltip } from '@ss/mtd-react';
import { getAttanceAccount } from '@/services/apis';
import { getEnname, getStorageUsers } from '@/utils';
import defaultImg from '@/asserts/images/default.png';
import { StorageService } from '@/services/storage';
import styles from './index.less';

interface IPersonSelectItem {
  empId: string;
  name: string;
  mis?: string;
  disabled?: boolean;
  avatar?: string;
  enName?: string;
}

interface IPersonSelectState {
  dataSource: IPersonSelectItem[];
  loading: boolean;
  storeUserList: IPersonSelectItem[];
  filterSave: string;
  visibleAfterSelect: boolean;
  message: string;
}

// 参数
interface IPersonSelectProps {
  orgnizerId?: string; // 传入的组织者id
  defaultValue?: IPersonSelectItem[]; // 选中人员
  initValue?: IPersonSelectItem[]; // 默认的人员
  onChange: (string: []) => void; // 传出编辑人的id数组
  popLayer?: any;
  width?: any;
  fromModal?: boolean;
}

const { Option } = Select;

const getGroupList = () => {
  return StorageService.getItemSession('groupUserList');
};

export default class UserSelect extends React.Component<
IPersonSelectProps,
IPersonSelectState
> {
  selectRef = null;

  needAutoHidden = true;

  constructor(props) {
    super(props);

    this.state = {
      dataSource: [],
      loading: true,
      filterSave: null,
      storeUserList: getStorageUsers(),
      visibleAfterSelect: true,
      message: i18nClient.t(
        'user_select_no_history_please_input',
        '暂无历史记录，请输入「mis号」或「姓名」搜索'
      )
    };
  }

  getDisabledList = (list) => {
    const { orgnizerId, initValue } = this.props;
    if (orgnizerId) {
      const res = list.map((item) => {
        return {
          ...item,
          value: item.empId,
          disabled: +item.empId === +orgnizerId
        };
      });
      return res;
    }
    const disableItemList = initValue
      ? initValue.map(item => item.empId)
      : [];
    const res = list.map((item) => {
      return {
        ...item,
        value: item.empId,
        disabled: disableItemList.includes(item.empId)
      };
    });
    return res;
  };

  defaultValueToSelect = () => {
    const { defaultValue } = this.props;
    if (defaultValue) {
      return this.getDisabledList(defaultValue);
    }
    return [];
  };

  handleChange = (value) => {
    const { onChange } = this.props;
    const result = value.map((item) => {
      if (item.empId) {
        return item;
      }
      return this.getItemFromDataSource(item.value);
    });
    if (onChange) {
      onChange(result);
    }
  };

  handleFilter = async (filter) => {
    const { storeUserList } = this.state;
    if (!filter) {
      const groupUserList = getGroupList();
      let dataSource = [];
      if (groupUserList) {
        dataSource = this.getDisabledList(groupUserList);
      } else if (storeUserList) {
        dataSource = this.getDisabledList(storeUserList);
      }
      this.setState({
        dataSource,
        loading: false,
        visibleAfterSelect: true,
        message: i18nClient.t(
          'user_select_no_history_please_input',
          '暂无历史记录，请输入「mis号」或「姓名」搜索'
        )
      });
    } else {
      this.setState({
        loading: true,
        filterSave: filter,
        dataSource: [],
        visibleAfterSelect: false,
        message: i18nClient.t('user_select_no_matching_results', '无匹配的结果')
      });
      (async (filterGets) => {
        const data = await getAttanceAccount({ filter });
        const { filterSave } = this.state;
        if (filterSave === filterGets) {
          this.setState({
            dataSource: Array.isArray(data) ? this.getDisabledList(data) : [],
            loading: false
          });
        }
      })(filter);
    }
  };

  getNameById = (id: string) => {
    const { dataSource } = this.state;
    const { defaultValue } = this.props;
    let selItem = dataSource.find(item => item.empId === id);
    if (selItem) {
      return selItem.name + getEnname(selItem?.enName);
    }
    selItem = defaultValue.find(item => item.empId === id);
    if (selItem) {
      return selItem.name + getEnname(selItem?.enName);
    }
    return '';
  };

  getItemFromDataSource = (id: string) => {
    const { dataSource } = this.state;
    const { defaultValue } = this.props;
    let selItem = dataSource.find(item => item.empId === id);
    if (selItem) {
      return selItem;
    }
    selItem = defaultValue.find(item => item.empId === id);
    if (selItem) {
      return selItem;
    }
    return null;
  };

  focus = () => {
    this.selectRef && this.selectRef.focus();
  };

  render() {
    const { dataSource, loading, message } = this.state;
    const { fromModal } = this.props;
    const popStyle = { ...this.props.popLayer, visibleAfterSelect: true };
    if (fromModal) {
      popStyle.width = '400px';
    }
    const value = this.defaultValueToSelect();
    return (
      <Select
        ref={(ref: any) => {
          this.selectRef = ref;
        }}
        className={styles.useSelect}
        style={{ width: this.props.width || 552, margin: '0 auto' }}
        popLayer={{
          ...popStyle,
          className: this.needAutoHidden ? '' : styles.hiddenDatePicker
        }}
        multiple
        notFoundMessage={message}
        icon={false}
        value={value}
        loading={loading}
        loadingMessage={() => <Loading />}
        onFilter={this.handleFilter}
        onChange={this.handleChange}
        placeholder={i18nClient.t(
          'user_select_please_input_name',
          '请输入姓名或 mis 号查询'
        )}
        renderTagLabel={(option) => {
          return (<Tooltip message={this.getNameById(option.value || option.empId)} autoDestory>
            {this.getNameById(option.value || option.empId)}
          </Tooltip>);
        }}
      >
        {dataSource.map((option, index) => (
          <Option key={index} value={option.empId} disabled={option.disabled}>
            <div className={styles.flexC}>
              <img
                className={styles.img}
                src={option.avatar || defaultImg}
                alt={i18nClient.t('user_select_avatar', '头像')}
              />
              <div className={styles.label}>{option.name}{getEnname(option.enName)}
              {option.mis ? `/${option.mis}` : null}</div>
            </div>
          </Option>
        ))}
      </Select>
    );
  }
}
