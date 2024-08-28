import React from 'react';
import {
  Button,
  List,
  Icon,
  Input,
  Loading,
  Tooltip,
  Pagination
} from '@ss/mtd-react';
import './index.less';
import _ from 'lodash';
import { history } from 'onejs/router';
import { getFlowListPage } from '@/services/bpmn';

export default class Aside extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      showData: [],
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
      fuzzy: ''
    };
  }

  jumpApproval(item) {
    history.push(`/approval/admin/create?id=${item.id}`);
  }

  componentDidMount = async () => {
    await this.getFlowListPageInfo();
  };

  getFlowListPageInfo = async (pageInfo, fuzzyInfo) => {
    this.setState({
      loading: true
    });
    const page = pageInfo || this.state.page;
    const fuzzy = fuzzyInfo !== undefined ? fuzzyInfo : this.state.fuzzy;
    try {
      const data = await getFlowListPage({
        fuzzy,
        page
      });
      this.setState({
        data,
        loading: false,
        showData: data.pageList,
        curPageInfo: data.page,
        fuzzy
      });
    } finally {
      this.setState({
        data: [],
        loading: false
      });
    }
  };

  handleChange = (pageNo, pageSize) => {
    // console.log(current, pageSize);
    this.getFlowListPageInfo({
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

  handleChangeInput = _.debounce((value) => {
    const { page } = this.state;
    page.pageNo = 1;
    this.getFlowListPageInfo(page, value);
  }, 300);

  render() {
    const { showData: approvalList, loading, curPageInfo } = this.state;

    const statusColor = {
      NONE: '#000000',
      PENDING: '#E2B010',
      APPROVED: '#00b365'
    };

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
                history.push('/approval/admin/create');
              }}
            >
              创建审批
            </Button>
          </div>
        </div>
        <Loading loading={loading}>
          <div className='ApprovalList_groups'>
            {/* {AllData.map((ele) => ( */}
            <div className='ApprovalGroup'>
              {/* <div className='ApprovalGroup_header'>
                <div className='ApprovalGroup_header_title'>{ele.name}</div>
              </div> */}
              <div className='ApprovalGroup_body'>
                {Array.isArray(approvalList) && approvalList.length > 0 ? (
                  <List className='ApprovalGroup_list'>
                    {approvalList.map((item) => {
                      const { processStarters } = item;

                      const whoCanSee = this.renderProcessStarts(
                        processStarters
                      );

                      return (
                        <List.Item key={item.id}>
                          <div className='item-content'>
                            <img
                              alt='Icon'
                              src={item.iconUrl || null}
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
                            <div className='item-who-see'>
                              <Tooltip message={whoCanSee}>
                                {whoCanSee}可以发起
                              </Tooltip>
                            </div>
                            <div
                              style={{
                                color: statusColor[item?.approvalStatus]
                              }}
                              className='item-approval-status'
                            >
                              {item.approvalStatusName || '-'}
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
                ) : null}

                {!loading &&
                  Array.isArray(approvalList) &&
                  approvalList.length === 0 && (
                    <div>暂无数据。创建你的第一个审批吧~</div>
                  )}
              </div>
            </div>
            <Pagination
              current={curPageInfo.pageNo}
              pageSize={curPageInfo.pageSize}
              // pageSizeOptions={[10, 20, 30, 40]}
              showTotal
              total={curPageInfo.totalCount}
              folderCount={3}
              showSizeChanger
              onChange={this.handleChange}
            />
            {/* ))} */}
          </div>
        </Loading>
      </div>
    );
  }
}
