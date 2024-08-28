import React, { Component } from 'react';
import { message } from '@ss/mtd-react';
import { UserDeptSelector } from '@onejs/user-dept-selector';
import { getDeptData, getUserData, getSearchData } from '@/services/bpmn';
import {
  IProps,
  IState,
  OrgData,
  SearchGroup,
  UserDept,
  SelectorType
} from './type';

export default class UserDeptWrapper extends Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      recentContactData: [],
      orgData: [],
      searchLoading: false
    };
  }

  async componentDidMount() {
    const { userDeptType } = this.props;

    if (
      userDeptType === SelectorType.Both ||
      userDeptType === SelectorType.Department
    ) {
      const data = await getDeptData();
      const orgData = this.convertDataToDeptForm(data.depts);
      this.setState({ orgData });
    }

    if (
      userDeptType === SelectorType.Both ||
      userDeptType === SelectorType.User
    ) {
      const userData = await getUserData();
      const recentContactData = this.convertDataToUserForm(userData.users);
      this.setState({ recentContactData });
    }
  }

  async fetchMoreOrg(parentValue) {
    const data = await getDeptData(parentValue);
    return data.depts.map((item) => {
      return {
        value: item.deptId.toString(),
        label: item.name,
        type: 'department',
        avatar:
          'https://p0.meituan.net/travelcube/0322c6885031df80d1d2cc07487ff82a2049.png',
        seriesName: item.seriesName,
        leaf: !item.children || item.children.length === 0,
        parentValue
      };
    });
  }

  convertDataToUserForm = (users): UserDept[] | [] => {
    if (!users || users.length === 0) return [];

    return users.map((item) => {
      return {
        value: item.userId?.toString(),
        label: `${item.name}/${item.mis}`,
        avatar:
          item.avatar ||
          'https://p0.meituan.net/travelcube/d0efd64014b0b4804535be22ab821fcf3638.png',
        type: SelectorType.User
      };
    });
  };

  convertDataToDeptForm = (
    depts,
    parentValue = '',
    leaf = false
  ): OrgData[] | [] => {
    if (!depts || depts.length === 0) return [];

    return depts.map((item) => {
      return {
        value: item.deptId?.toString(),
        label: item.name,
        type: SelectorType.Department,
        avatar:
          'https://p0.meituan.net/travelcube/0322c6885031df80d1d2cc07487ff82a2049.png',
        seriesName: item.seriesName,
        leaf,
        parentValue
      };
    });
  };

  fetchSearchData = async (val) => {
    const { userDeptType } = this.props;

    try {
      this.setState({ searchLoading: true });
      const data = await getSearchData({
        keyword: val,
        isActiveOnly: true,
        includingAvatar: true,
        fuzzy: false,
        includingDxUid: true,
        searchDept: userDeptType !== SelectorType.User
      });

      if (data) {
        const userForm = this.convertDataToUserForm(data.users);
        const deptForm = this.convertDataToDeptForm(data.depts);

        const searchForm: SearchGroup[] = [];
        if (deptForm.length > 0) {
          searchForm.push({
            label: '部门',
            options: deptForm
          });
        }
        if (userForm.length > 0) {
          searchForm.push({
            label: '人员',
            options: userForm
          });
        }
        this.setState({ searchLoading: false });
        return searchForm;
      }
    } catch (error) {
      message.error({
        message: '查找失败'
      });
      // eslint-disable-next-line no-console
      console.error('查找失败', error);
      this.setState({ searchLoading: false });
    }
    return [];
  };

  render() {
    const {
      isShowModal,
      handleSave,
      handleClose,
      value,
      userDeptType,
      placeholder,
      title
    } = this.props;

    const { recentContactData, orgData, searchLoading } = this.state;

    return (
      <>
        {isShowModal && (
          <UserDeptSelector
            handleClose={handleClose}
            handleSave={handleSave}
            value={value}
            userDeptType={userDeptType}
            placeholder={placeholder}
            title={title}
            recentContactData={recentContactData}
            orgData={orgData}
            fetchMoreOrg={this.fetchMoreOrg}
            fetchSearchData={this.fetchSearchData}
            searchLoading={searchLoading}
          />
        )}
      </>
    );
  }
}
