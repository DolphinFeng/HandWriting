import React from 'react';
import { Button, List, Icon, Input, Loading, Pagination } from '@ss/mtd-react';
import './index.less';
import { history } from 'onejs/router';
import _ from 'lodash';
import { getTripartiteSubmitList } from '@/services/tripartite';

const DEFAULT_ICON =
  'https://p1.meituan.net/travelcube/d490e0fa4a9bd4f2a346393291d3b97c1933.png';
export default class Aside extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      page: {
        pageNo: 1,
        pageSize: 20
      },
      curPageInfo: {
        pageNo: 1,
        pageSize: 20,
        totalCount: 0,
        totalPageCount: 1
      },
      fuzzy: '',
      showData: []
    };
  }

  jumpApproval(item) {
    history.push(`/approval/admin/create-tripartite?id=${item.id}`);
  }

  componentDidMount = async () => {
    await this.getList();
  };

  getList = async (pageInfo, fuzzyInfo) => {
    this.setState({
      loading: true
    });
    const page = pageInfo || this.state.page;
    const fuzzy = fuzzyInfo || this.state.fuzzy;
    const data = await getTripartiteSubmitList({
      fuzzy,
      page
    });
    this.setState({
      data,
      loading: false,
      showData: data.thirdApprovals,
      curPageInfo: data.page
    });
  };

  filterApp(val) {
    if (!val.trim()) {
      this.setState({
        showData: this.state.data
      });
    }
    const newData = this.state.data.filter((item) => {
      return item.name.includes(val);
    });

    this.setState({
      showData: newData
    });
  }

  renderProcessStarts = (processStarters) => {
    const isAll = !processStarters || processStarters.all;
    if (isAll) {
      return '全员';
    }

    const { users = [], depts = [] } = processStarters;

    return users
      .concat(depts)
      .map((item) => {
        return item.name;
      })
      .join(';');
  };

  handleChange = (pageNo, pageSize) => {
    // console.log(current, pageSize);
    this.getList({
      pageNo,
      pageSize
    });
    this.setState({
      page: {
        pageNo,
        pageSize
      }
    });
  };

  handleChangeInput = _.debounce((value) => {
    const { page } = this.state;
    this.getList(page, value);
  }, 500);

  // handleTotal = (e) => {
  //   console.log(e)
  // };

  render() {
    const { showData: approvalList, loading, curPageInfo } = this.state;
    // const AllData = [{ name: 'HR 应用' }];
    return (
      <div className='approvalList'>
        <div className='approvalList_operations'>
          <div>
            {/* <Button>新建分组</Button>
            <Button>分组排序</Button> */}
            <Input
              clearable={false}
              placeholder='请输入搜索内容'
              suffix={
                <Icon
                  type='search'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    // console.log('handle search', e);
                  }}
                />
              }
              onChange={(e) => {
                const { value } = e.target;
                this.handleChangeInput(value);
              }}
            />
          </div>
          <div>
            <Button
              type='primary'
              onClick={() => {
                history.push('/approval/admin/create-tripartite');
              }}
            >
              创建三方审批模板
            </Button>
          </div>
        </div>
        <Loading loading={loading}>
          <div className='ApprovalList_groups'>
            <div className='ApprovalGroup'>
              <div className='ApprovalGroup_body'>
                <List className='ApprovalGroup_list'>
                  {Array.isArray(approvalList) &&
                    approvalList.map((item) => {
                      return (
                        <List.Item key={item.id}>
                          <div className='item-content'>
                            <img
                              alt='Icon'
                              src={item.icon || DEFAULT_ICON}
                              className='item-content-avatar'
                            />
                            <div className='item-content-main'>
                              <div className='item-content-title'>
                                {item.name}
                              </div>
                              <div className='item-content-description'>
                                {item.description || ''}
                              </div>
                            </div>
                            <div className='item-operation'>
                              <Icon
                                type='edit-o'
                                onClick={() => this.jumpApproval(item)}
                              ></Icon>
                            </div>
                          </div>
                        </List.Item>
                      );
                    })}
                </List>
              </div>
            </div>
            {/* ))} */}
          </div>
          <Pagination
            current={curPageInfo.pageNo}
            pageSize={curPageInfo.pageSize}
            // pageSizeOptions={[10, 20, 30, 40]}
            total={curPageInfo.totalCount}
            folderCount={3}
            showSizeChanger
            onChange={this.handleChange}
          />
        </Loading>
      </div>
    );
  }
}
