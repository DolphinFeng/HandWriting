import { Button, DatePicker, Form, Input, Select, Space, Table, message, Tooltip, Modal } from 'antd';
import { DefaultPagination } from '../../../constants';
import { useEffect, useState } from 'react';
import { useEditState, usePageFns, useQuery } from '../../../hooks';
import { cpmService } from '../../../services/cpw-service';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { convertMomentTupleToTimestampTuple, humanizeTime, removeEmptyValue } from '../../../utils';
import { omit } from 'lodash';
import {
  MergeTaskInList,
  MERGE_TASK_STATUS_OPTIONS,
  MergeTaskOutList,
  MERGE_TASK_STATUS_DESCRIPTIONS,
} from '../../../models';
import { CreateModal } from './components/cross-merge-modal';
import { useNavigate } from 'react-router-dom';
import { MergeBusinessType } from '../../merge-business-type';
import { SetNDSModal } from './components/set-NDS-modal';

type SearchParams = MergeTaskInList;

export const CrossMergeCreate = () => {
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<MergeTaskOutList[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const { changeHistory } = usePageFns();
  const [cityName, setCityName] = useState();

  const create_state = useEditState();
  const set_NDS_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>({});

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const createTime = convertMomentTupleToTimestampTuple(values.createTime);
    if (values.businessType) {
      changeHistory({
        ...omit(values, ['createTime']),
        startCreateTime: createTime[0],
        endCreateTime: createTime[1],
        pageNo: 1,
        pageSize: pagination.pageSize,
      });
    } else {
      message.error('请选择产线');
    }
  };

  const handleCloseCreateModel = () => {
    create_state.hide();
  };

  const showNDSModal = (param: any) => {
    set_NDS_state.setItem({
      subtaskId: param.subtaskId,
    });

    set_NDS_state.show();
  };

  const getList = async (params: SearchParams) => {
    try {
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;

      let cityListStr = params['cityList'] + '';
      let cityList = cityListStr.split(',');

      setLoading(true);
      const ret = await cpmService.retrieveMergeSubTaskList({
        ...omit(params, 'pageNo', 'pageSize', 'cityList'),
        cityList: params['cityList'] ? cityList : undefined,
        pageNo,
        pageSize,
      });
      setList(ret.data as MergeTaskOutList[]);
      setPagination({
        ...pagination,
        total: ret.totalCount,
        current: pageNo,
        pageSize,
      });
    } catch (error: any) {
      console.error(error);
      message.error(error.message);

      setList([]);
      setPagination(pagination);
    } finally {
      setLoading(false);
    }
  };

  const triggerMergeTask = async (subtaskId: number) => {
    Modal.confirm({
      title: '提示',
      content: '您确定要提交融合任务吗？',
      onOk: () => {
        handleOK(subtaskId)
      },
      onCancel: () => {
        Modal.destroyAll();
      }
    })
  };

  const handleOK = async (subtaskId: number) => {
    try {
      const ret = await cpmService.triggerMergeTask(subtaskId);
      if (ret.code != 0) {
        message.error(ret.message);
      } else {
        message.info('融合任务已提交成功');
        setTimeout(() => {
          // eslint-disable-next-line no-restricted-globals
          location.reload();
        }, 1000);
      }
    } catch (error) {
      message.error(error + '');
    }
  };

  const columns: ColumnsType<MergeTaskOutList> = [
    {
      title: '融合任务ID',
      dataIndex: 'subtaskId',
      width: 100,
      align: 'center',
      fixed: 'left',
      render: (x, record) => {
        return <span>{x}</span>;
      },
    },
    {
      title: '融合子任务名称',
      dataIndex: 'subtaskName',
      width: 100,
      align: 'center',
      render: (x, record) => {
        return <span>{x}</span>;
      },
    },
    {
      title: '产品库名称',
      dataIndex: 'productName',
      width: 200,
      align: 'center',
      render: (x, record) => {
        return <span>{x}</span>;
      },
    },
    {
      title: '产品库分支',
      dataIndex: 'branchName',
      width: 100,
      align: 'center',
    },
    {
      title: '是否启用推理排序',
      dataIndex: 'useCompare',
      width: 100,
      align: 'center',
    },
    // {
    //   title: '是否启用准出回退替换',
    //   dataIndex: 'crossNum',
    //   width: 150,
    //   align: 'center',
    // },
    {
      title: '融合版本',
      dataIndex: 'mergeTaskType',
      width: 120,
      align: 'center',
    },
    {
      title: '调度方式',
      dataIndex: 'execMode',
      width: 200,
      align: 'center',
    },
    {
      title: '数据规格',
      dataIndex: 'dataSpec',
      width: 100,
      align: 'center',
    },
    {
      title: '路口总量',
      dataIndex: 'crossNum',
      width: 100,
      align: 'center',
    },
    {
      title: '路口类型路口量',
      dataIndex: 'crossTypeStatistics',
      width: 150,
      align: 'center',
    },
    {
      title: '推理算法版本量',
      dataIndex: 'inferAlgVsnStatistics',
      width: 150,
      align: 'center', 
    },
    {
      title: '推理打分算法版本',
      dataIndex: 'evalAlgVsn',
      width: 150,
      align: 'center',
    },
    {
      title: 'TMS任务ID',
      dataIndex: 'tmsTaskId',
      width: 150,
      align: 'center',
    },
    {
      title: '融合状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (x, record) => {
        const { status } = record;
        //@ts-ignore
        return <span>{status ? MERGE_TASK_STATUS_DESCRIPTIONS[status] : '-'}</span>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 150,
      align: 'center',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '创建人',
      dataIndex: 'operator',
      width: 150,
      align: 'center',
    },
    {
      title: 'NDS版本',
      dataIndex: 'ndsVsn',
      width: 150,
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'detail',
      width: 240,
      render: (text, record) => {
        //const {aipTaskUrl, batchMappingTaskId, batchId} = record;
        return (
          <>
            <Button
              type="link"
              onClick={() => {
                const { subtaskId, businessType } = record;
                navigate(`/data-product/cross-merge/detail?subtaskId=${subtaskId}&businessType=${businessType}`);
              }}
            >
              任务详情
            </Button>
            <Button
              type="link"
              onClick={() => {
                const { subtaskId } = record;
                if (subtaskId) {
                  showNDSModal({
                    subtaskId: subtaskId
                  });;
                }
              }}
            >
              追加NDS版本
            </Button>
            <Button
              type="link"
              onClick={() => {
                const { subtaskId } = record;
                if (subtaskId) {
                  triggerMergeTask(subtaskId);
                }
              }}
            >
              触发融合
            </Button>
          </>
        );
      },
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    changeHistory({
      ...serach_params,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  useEffect(() => {
    let params: SearchParams = {};

    query.forEach((value, key) => {
      if (['startCreateTime', 'endCreateTime', 'pageNo', 'pageSize', 'projectId', 'businessType'].includes(key)) {
        // @ts-ignore
        params[key] = value ? Number(value) : undefined;
      } else {
        // @ts-ignore
        params[key] = value;
      }
    });

    params = removeEmptyValue(params);
    if (!params.businessType) {
      params.businessType = 1;
    }
    //const createTime = convertTimestampTupleToDayTuple([params., params.endCreateTime]);

    form.setFieldsValue({
      ...omit(params, ['startCreateTime', 'endCreateTime']),
      //createTime: createTime,
    });

    setSerachParams(params);

    getList(params);
  }, [query.toString()]);

  useEffect(() => {
    //获取城市接口
    handleCityList();
  }, []);

  const handleCityList = async () => {
    try {
      const result: any = await cpmService.retrieveDimCity();

      let city = result.data.filter((obj: any, index: any) => {
        return result.data.findIndex((item: any) => item.cityName === obj.cityName) === index;
      });

      let cityList = city
        .map((obj: { cityOrder: string }) => ({
          ...obj,
          cityOrder: parseInt(obj.cityOrder),
        }))
        .sort((a: any, b: any) => a.cityOrder - b.cityOrder);

      setCityName(
        cityList.map((item: any) => ({
          label: item.cityName + '-' + item.provName,
          value: item.cityName,
        })),
      );
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };

  const filterCityOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? '').includes(input);

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            <MergeBusinessType businessModel={false} city={false}></MergeBusinessType>
            <Form.Item label="城市" name="cityList">
              <Select
                mode="multiple"
                showSearch
                options={cityName}
                placeholder="请选择"
                allowClear
                filterOption={filterCityOption}
                style={{ width: '200px' }}
              ></Select>
            </Form.Item>
            <Form.Item label="批次ID" name="batchId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="融合任务" name="subtaskName">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="产品库分支" name="branchName">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="融合状态" name="status">
              <Select placeholder="请选择" options={MERGE_TASK_STATUS_OPTIONS} style={{ width: '200px' }} allowClear></Select>
            </Form.Item>
            <Form.Item label="融合任务ID" name="subtaskId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
          </Form>
        </div>
        <div className="search-button">
          <Space>
            <Button
              type="primary"
              onClick={() => {
                create_state.show();
              }}
            >
              创建融合任务
            </Button>
            <Button type="primary" onClick={handleSearch}>
              查询
            </Button>
          </Space>
        </div>
      </div>
      <div style={{ width: '1600px' }}>
        <Table
          rowKey="subtaskId"
          className="page-table"
          columns={columns}
          dataSource={list}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        ></Table>
      </div>
      <CreateModal
        title={'创建融合任务'}
        visible={create_state.visible}
        disabled={false}
        onSuccess={() => {
          handleCloseCreateModel();
          handleSearch();
        }}
        onCancel={() => {
          handleCloseCreateModel();
        }}
      ></CreateModal>
      <SetNDSModal
        list={list}
        state={set_NDS_state}
        visible={set_NDS_state.visible}
        onSuccess={() => {
          set_NDS_state.hide();
        }}
        onCancel={() => {
          set_NDS_state.hide();
        }}
      ></SetNDSModal>
    </div>
  );
};
