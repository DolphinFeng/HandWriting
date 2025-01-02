import {Button, DatePicker, Form, Input, Select, Space, Table, message} from 'antd';
import {DefaultPagination} from '../../../constants';
import {useEffect, useState} from 'react';
import {CreateModal} from '../../project/create-modal';
import {MaterialReCollectDlg} from './material-recollect-dlg';
import {useEditState, usePageFns, useQuery} from '../../../hooks';
import {cpmService} from '../../../services/cpw-service';
import {
  COLLECT_TASK_STATUS_DESCRIPTIONS,
  COLLECT_TASK_STATUS_OPTIONS,
  CollectTaskInList,
  CollectTaskQuery,
} from '../../../models';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import type {FilterValue, SorterResult} from 'antd/es/table/interface';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToMomentTuple,
  convertTimestampTupleToDayTuple,
  humanizeTime,
  removeEmptyValue,
  convertCityForm,
  convertCityback,
} from '../../../utils';
import {omit} from 'lodash';
import {useNavigate} from 'react-router-dom';
import {BatchSearchSelect} from '../../project/batch-search-select';
import {ProjectSearchSelect} from '../../project/project-search-select';
import {BusinessType} from '../../business-type';

type SearchParams = CollectTaskQuery;

/**
 * 资料采集
 */
export const DataCollect = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<CollectTaskInList[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();
  const navigate = useNavigate();

  const create_state = useEditState();
  const recollect_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>({});

  const [changeBusiness, setChangeBusiness] = useState(1);
  const handleSearch = () => {
    const values = form.getFieldsValue();

    const cityList = convertCityForm(values.cityNameList);
    const createTime = convertMomentTupleToTimestampTuple(values.createTime);
    if (values.businessType) {
      changeHistory({
        ...omit(values, ['createTime', 'cityNameList']),
        startTime: createTime[0],
        endTime: createTime[1],
        page: 1,
        pageSize: pagination.pageSize,
        cityNameList: cityList,
      });
    } else {
      message.error('请选择生产模式');
    }
  };

  const handleCloseCreateModel = () => {
    create_state.hide();
  };

  const getList = async (params: SearchParams) => {
    try {
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;

      setLoading(true);
      const ret = await cpmService.retrieveCollectTaskList({
        ...omit(params, 'page', 'pageSize'),
        pageNo,
        pageSize,
      });

      setList(ret.data);
      setPagination({
        ...pagination,
        total: ret.totalCount,
        current: pageNo,
        pageSize,
      });
    } catch (error: any) {
      message.error(error.message);

      setList([]);
      setPagination(pagination);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<CollectTaskInList> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
    },
    {
      title: '批次编号',
      dataIndex: 'batchId',
    },
    {
      title: '路口编号',
      dataIndex: 'crossId',
    },
    {
      title: '路口类型',
      dataIndex: 'crossTypeDesc',
    },
    {
      title: '路径总数',
      dataIndex: 'collectRouteNum',
    },
    {
      title: '已采集路径数',
      dataIndex: 'collectedRouteNum',
    },
    {
      title: '采集完整路径数',
      dataIndex: 'entireRouteNum',
      sorter: true,
    },
    {
      title: '采集任务数',
      dataIndex: 'collectTaskNum',
    },
    {
      title: '已结束任务数',
      dataIndex: 'finishedTaskNum',
    },
    {
      title: '有数据任务数',
      dataIndex: 'collectedTaskNum',
      sorter: true,
    },
    {
      title: '有完整数据任务数',
      dataIndex: 'entireTaskNum',
      sorter: true,
    },
    {
      title: '已结束路径数',
      dataIndex: 'finishedRouteNum',
      sorter: true,
    },
    {
      title: '任务创建时间',
      dataIndex: 'createTime',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
      sorter: true,
    },
    {
      title: '资料最后回传时间',
      dataIndex: 'updateTime',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'detail',
      render: (text, record) => {
        return (
          <>
            <Button type="link" href={record.collectUrl} target="_blank">
              链接
            </Button>
          </>
        );
      },
    },
  ];

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<CollectTaskInList> | SorterResult<CollectTaskInList>[],
  ) => {
    var dataIndex = '';
    let dataIndexRes = '';
    const sorterResult = sorter as SorterResult<any>;
    if (sorterResult.column) {
      dataIndex = String(sorterResult.column.dataIndex);
      if (sorterResult.order == 'descend') {
        dataIndex = dataIndex + ' desc';
      }
      let length = dataIndex.length;
      for (let i = 0; i < length; i++) {
        if (dataIndex[i] === dataIndex[i].toUpperCase() && dataIndex[i] != ' ') {
          dataIndexRes += '_' + dataIndex[i].toLowerCase();
        } else {
          dataIndexRes += dataIndex[i];
        }
      }
    }

    changeHistory({
      ...serach_params,
      orderBy: dataIndexRes,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  useEffect(() => {
    let params: SearchParams = {};

    query.forEach((value, key) => {
      if (
        ['startTime', 'endTime', 'pageNo', 'pageSize', 'projectId', 'batchId', 'businessType', 'batchMode'].includes(
          key,
        )
      ) {
        // @ts-ignore
        params[key] = value ? Number(value) : undefined;
      } else if (['cityNameList'].includes(key)) {
        //@ts-ignore
        params[key] = (value ? decodeURI(value) : undefined)?.split(',');
      } else {
        // @ts-ignore
        params[key] = value;
      }
    });

    //进入页面默认选中Cross产线
    // if (!params.businessType) {
    //   params.businessType = 1;
    // }

    params = removeEmptyValue(params);

    const createTime = convertTimestampTupleToDayTuple([params.startTime, params.endTime]);

    form.setFieldsValue({
      ...omit(params, ['startTime', 'endTime', 'cityNameList']),
      createTime: createTime,
    });

    setSerachParams(params);

    getList(params);
  }, [query.toString()]);

  const handleRecollect = () => {
    recollect_state.show();
  }

  const onChangeBusiness = (e: any) => {
    setChangeBusiness(e);
    form.setFieldValue('batchMode', undefined);
  };
  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            {/* <ProjectSearchSelect></ProjectSearchSelect> */}
            <BusinessType
              businessModel={true}
              city={true}
              changeBusiness={onChangeBusiness}
              modeDisabledType={'vector'}
            ></BusinessType>
            <BatchSearchSelect changeBusiness={changeBusiness}></BatchSearchSelect>
            <Form.Item label="路口编号" name="crossId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="执行状态" name="status">
              <Select
                placeholder="请选择"
                options={COLLECT_TASK_STATUS_OPTIONS}
                style={{width: '200px'}}
                allowClear
              ></Select>
            </Form.Item>
            <Form.Item label="创建时间" name="createTime">
              <DatePicker.RangePicker
                showTime={{format: 'HH:mm:ss'}}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={['起始时间', '结束时间']}
              ></DatePicker.RangePicker>
            </Form.Item>
          </Form>
        </div>
        <div className="search-button">
          <Space>
            <Button type="primary" onClick={handleSearch}>
              查询
            </Button>
            <Button
              type="primary"
              onClick={() => {
                const values = form.getFieldsValue();
                if (values.batchId !== undefined) {
                  navigate('/data-monitor/batch?batchId=' + values.batchId);
                } else {
                  navigate('/data-monitor/batch');
                }
              }}
            >
              生产进度
            </Button>
            <Button type="primary" onClick={handleRecollect}>
              资料补采
            </Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="crossId"
        className="page-table"
        columns={columns}
        dataSource={list}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      ></Table>
      <CreateModal
        visible={create_state.visible}
        onSuccess={() => {
          handleCloseCreateModel();
        }}
        onCancel={() => {
          handleCloseCreateModel();
        }}
      ></CreateModal>
      <MaterialReCollectDlg
        visible={recollect_state.visible}
        onSuccess={() => {
          recollect_state.hide();
        }}
        onCancel={() => {
          recollect_state.hide();
        }}
      ></MaterialReCollectDlg>
    </div>
  );
};
