import {Button, DatePicker, Form, Input, Select, Space, Table, message} from 'antd';
import {DefaultPagination} from '../../../constants';
import {useEffect, useState} from 'react';
import {CreateModal} from '../../project/create-modal';
import {useEditState, usePageFns, useQuery} from '../../../hooks';
import {cpmService} from '../../../services/cpw-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
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
import {
  PRODUCE_TASK_STATUS_DESCRIPTIONS,
  PRODUCE_TASK_STATUS_OPTIONS,
  ProduceTaskInList,
  ProduceTaskQuery,
  TASK_TYPE,
} from '../../../models';
import { useNavigate } from 'react-router-dom';
import JsonViewDlg from '../../json-view';
import { BusinessType } from '../../business-type';
import { ProjectSelect } from '../../project/project-select';

type SearchParams = ProduceTaskQuery;

/**
 * 任务列表
 */
export const ProduceTaskList = ({mappingTaskType}: {mappingTaskType?: TASK_TYPE}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ProduceTaskInList[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState();

  const create_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>({});
  const [business, setBusiness] = useState(1);
  const handleSearch = () => {
    const values = form.getFieldsValue();
    const createTime = convertMomentTupleToTimestampTuple(values.createTime);
    const cityList = convertCityForm(values.cityNameList);
    if (values.businessType) {
      changeHistory({
        ...omit(values, ['createTime', 'cityNameList']),
        startCreateTime: createTime[0],
        endCreateTime: createTime[1],
        pageNo: 1,
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
      const ret = await cpmService.retrieveProduceTaskList({
        ...omit(params, 'pageNo', 'pageSize'),
        mappingTaskType,
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
      console.error(error);
      message.error(error.message);

      setList([]);
      setPagination(pagination);
    } finally {
      setLoading(false);
    }
  };

  const businessChange = (e: any) => {
    setBusiness(e);
    form.setFieldValue('batchMode', undefined);
  };

  const columns: ColumnsType<ProduceTaskInList> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
    },
    {
      title: '批次编号',
      dataIndex: 'batchId',
      render: (x, record) => {
        return <span>{x}</span>;
      },
    },
    {
      title: '路口编号',
      dataIndex: 'crossId',
      render: (x, record) => {
        return <span>{x}</span>;
      },
    },
    {
      title: '任务编号（路口）',
      dataIndex: 'mappingTaskId',
      render: (x, record) => {
        return <span>{x}</span>;
      },
    },
    {
      title: '路口类型',
      dataIndex: 'crossTypeDesc',
    },
    {
      title: '创建时间',
      dataIndex: 'startTime',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '路径总数',
      dataIndex: 'routeTotalCount',
    },
    {
      title: '输入覆盖路径数',
      dataIndex: 'inputRouteNum',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (x, record) => {
        const {status} = record;
        return <>{PRODUCE_TASK_STATUS_DESCRIPTIONS[status]}</>;
      },
    },
    {
      title: '操作',
      dataIndex: 'detail',
      width: '400px',
      render: (text, record) => {
        const {aipTaskUrl, mappingTaskId, dataVisualUrl} = record;

        return (
          <>
            <Button type="link" href={aipTaskUrl} target="_blank">
              AIP任务
            </Button>
            {dataVisualUrl && (
              <Button type="link" href={dataVisualUrl} target="_blank">
                数据可视化
              </Button>
            )}
            {mappingTaskId && mappingTaskType == 'PERCEPTION' && (
              <>
                <Button type="link" onClick={() => checkCi(mappingTaskId)}>
                  查看CI文件
                </Button>
                <Button
                  type="link"
                  onClick={() => {
                    checkParseKwargs(mappingTaskId);
                  }}
                >
                  查看建图参数
                </Button>
              </>
            )}
          </>
        );
      },
    },
  ];

  const showContent = (content: any) => {
    setContent(content);
    setIsModalOpen(true);
  };
  const checkCi = async (taskId: any) => {
    try {
      const ret = await cpmService.getCiFileByTaskId(taskId);
      // @ts-ignore
      let result = ret.data;
      let arr = result.split(' ');
      result = arr.join('');
      result = result.replace(/\n+/g, '');
      result = result.replace(/\\/g, '');
      let text = JSON.parse(result);
      showContent(text);
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };

  const checkParseKwargs = async (taskId: any) => {
    try {
      const ret = await cpmService.getParseKwargsByTaskId(taskId);
      showContent(ret.data);
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };
  const handleTableChange = (pagination: TablePaginationConfig) => {
    changeHistory({
      ...serach_params,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
  };
  const changeBusiness = () => {
    form.setFieldValue('batchMode', undefined);
  };
  useEffect(() => {
    let params: SearchParams = {};

    query.forEach((value, key) => {
      if (
        ['startCreateTime', 'endCreateTime', 'pageNo', 'pageSize', 'projectId', 'businessType', 'batchMode'].includes(
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

    params = removeEmptyValue(params);

    const createTime = convertTimestampTupleToDayTuple([params.startCreateTime, params.endCreateTime]);

    //进入页面 默认产线为cross
    // if (!params.businessType) {
    //   params.businessType = 1;
    // }

    form.setFieldsValue({
      ...omit(params, ['startCreateTime', 'endCreateTime', 'cityNameList']),
      createTime: createTime,
    });

    setSerachParams(params);

    getList(params);
  }, [query.toString()]);

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            {mappingTaskType !== TASK_TYPE.INFERENCE && (
              <BusinessType
                businessModel={true}
                city={true}
                changeBusiness={changeBusiness}
                modeDisabledType={'vector'}
              ></BusinessType>
            )}
            {mappingTaskType === TASK_TYPE.INFERENCE && (
              <BusinessType businessModel={true} city={true} changeBusiness={changeBusiness}></BusinessType>
            )}
            <ProjectSelect changeBusiness={business}></ProjectSelect>
            <Form.Item label="批次编号" name="batchId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="批次名称" name="batchName">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="路口编号" name="crossId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="任务编号" name="mappingTaskId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="状态" name="status">
              <Select
                allowClear
                style={{width: '200px'}}
                placeholder="请选择"
                options={PRODUCE_TASK_STATUS_OPTIONS}
              ></Select>
            </Form.Item>
            <Form.Item label="创建时间" name="createTime">
              <DatePicker.RangePicker
                showTime={{format: 'HH:mm:ss'}}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={['起始时间', '结束时间']}
              ></DatePicker.RangePicker>
            </Form.Item>
            {(mappingTaskType === TASK_TYPE.MODEL || mappingTaskType === TASK_TYPE.INFERENCE) && (
              <Form.Item label="刷库任务编号" name="batchMappingTaskIds">
                <Input placeholder="请输入" allowClear></Input>
              </Form.Item>
            )}
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
          </Space>
        </div>
      </div>

      <Table
        rowKey="mappingTaskId"
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
      <JsonViewDlg visible={isModalOpen} closeDialog={() => setIsModalOpen(false)} content={content}></JsonViewDlg>
    </div>
  );
};
