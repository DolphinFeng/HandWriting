import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
  Table,
  Typography,
  message,
  Tooltip,
  Modal,
  Spin,
  Upload,
} from 'antd';
import {DefaultPagination} from '../../constants';
import {useEffect, useState} from 'react';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {cpmService} from '../../services/cpw-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {useNavigate} from 'react-router-dom';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToMomentTuple,
  convertTimestampTupleToDayTuple,
  humanizeTime,
  removeEmptyValue,
  convertCityForm,
  convertCityForm2,
} from '../../utils';
import {InboxOutlined} from '@ant-design/icons';
import {merge, omit} from 'lodash';
import {
  CreateMapByModelPayload,
  DataManageInList,
  DataManageListQuery,
  TASK_TYPE,
  MAPPING_RESULT_STATUS_DESC,
  MAPPING_RESULT_STATUS_OPTIONS,
} from '../../models';
import { CreateManageTask } from './data-list/create-manage-task';
import { BusinessType } from '../business-type';
import { ProjectSelect } from '../project/project-select';

type SearchParams = DataManageListQuery & {
  startCreateTime?: number;
  endCreateTime?: number;
};

/**
 * 任务列表
 */
export const DataManagementList = ({mappingResultType}: {mappingResultType?: TASK_TYPE}) => {
  const [form] = Form.useForm();
  const [modelForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [list, setList] = useState<DataManageInList[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();

  const [serach_params, setSerachParams] = useState<SearchParams>({});
  const create_task_state = useEditState<Partial<CreateMapByModelPayload>>();
  const [uploadListModalOpen, setUploadListModalOpen] = useState(false);
  const [cityName, setCityName] = useState();
  const [selectType, setSelectType] = useState(1);
  const [business, setBusiness] = useState(1);
  const navigate = useNavigate();
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
      message.error('请选择产线');
    }
  };

  const getList = async (params: SearchParams) => {
    try {
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;

      setLoading(true);
      const ret = await cpmService.retrieveDataManageList({
        ...omit(params, 'pageNo', 'pageSize'),
        mappingResultType,
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

  const columns: ColumnsType<DataManageInList> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      width: 100,
      align: 'center',
      fixed: 'left',
    },
    {
      title: '批次编号',
      dataIndex: 'batchId',
      width: 100,
      align: 'center',
      fixed: 'left',
    },
    {
      title: '路口编号',
      dataIndex: 'crossId',
      width: 150,
      align: 'center',
      fixed: 'left',
    },
    {
      title: '路径数量',
      dataIndex: 'routeTotalCount',
      width: 100,
      align: 'center',
    },
    {
      title: '路径覆盖',
      dataIndex: 'routeNum',
      width: 100,
      align: 'center',
    },
    {
      title: '任务编号',
      dataIndex: 'mappingTaskId',
      width: 100,
      align: 'center',
    },
    {
      title: '流水号主键',
      dataIndex: 'mappingResultId',
      width: 100,
      align: 'center',
    },
    {
      title: '算法版本',
      dataIndex: 'algVsn',
      width: 100,
      align: 'center',
    },
    {
      title: '数据集名称',
      dataIndex: 'datasetName',
      width: 200,
      align: 'center',
    },
    {
      title: '数据集 clip id',
      dataIndex: 'datasetClip',
      align: 'center',
      width: 200,
      render: (x, record) => {
        return <Typography.Text>{x}</Typography.Text>;
      },
    },
    {
      title: '存储信息',
      dataIndex: 'resultStoreInfo',
      width: 250,
      align: 'center',
      render: (text) => (
        <Tooltip placement="top" title={text}>
          <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      width: 150,
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 100,
      render: (x, record) => {
        const {status} = record;
        return <>{status ? MAPPING_RESULT_STATUS_DESC[status] : '--'}</>;
      },
    },
    {
      title: '操作',
      dataIndex: 'detail',
      width: 100,
      align: 'center',
      render: (text, record) => {
        return (
          <>
            {mappingResultType === TASK_TYPE.PERCEPTION && (
              <Button
                type="link"
                onClick={() => {
                  create_task_state.setItem({
                    mappingResultId: record.mappingResultId,
                  });
                  create_task_state.show();
                }}
              >
                模型建图
              </Button>
            )}
            {mappingResultType === TASK_TYPE.ANNOTATION && (
              <Button
                type="link"
                onClick={() => {
                  create_task_state.setItem({
                    mappingResultId: record.mappingResultId,
                  });
                  create_task_state.show();
                }}
              >
                推理
              </Button>
            )}
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
  const handleDownload = async () => {
    let values = form.getFieldsValue();
    const createTime = convertMomentTupleToTimestampTuple(values.createTime);

    let filteredObj = Object.keys(values)
      .filter((key) => key !== 'createTime')
      .reduce((result: any, key) => {
        result[key] = values[key];
        return result;
      }, {});

    filteredObj.startCreateTime = createTime[0];
    filteredObj.endCreateTime = createTime[1];
    filteredObj.cityNameList = convertCityForm2(values.cityNameList);
    try {
      const pageSize = 2000;
      let ret: any = [];
      for (let i = 1; i <= 10; i++) {
        const pageNo = i;
        let result = await cpmService.retrieveDataManageList({
          ...omit(filteredObj, 'pageNo', 'pageSize'),
          mappingResultType,
          pageNo,
          pageSize,
        });
        ret = [...ret, ...result.data];
        if (result.data.length == 0 || result.data.length < pageSize) {
          break;
        }
      }

      let uploadList: any = ret;
      if (uploadList.length == 20000) {
        // uploadList = uploadList.slice(0, 20000);
        message.warning('只能下载前两万条');
      }

      //需要根据表格字段中的内容进行更换
      if (uploadList.length > 0) {
        let dataList = uploadList.map(
          ({
            projectName,
            batchId,
            crossId,
            mappingTaskId,
            mappingResultId,
            algVsn,
            datasetName,
            datasetClip,
            resultStoreInfo,
            createTime,
            status,
          }: any) => ({
            projectName,
            batchId,
            crossId,
            mappingTaskId,
            mappingResultId,
            algVsn,
            datasetName,
            datasetClip,
            resultStoreInfo,
            createTime,
            status,
          }),
        );
        const data = jsonToCsv(dataList);
        downloadFile('下载.csv', data);
      } else {
        message.warning('没有可下载的内容');
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    }
  };
  function jsonToCsv(jsonData: any) {
    const csvRows = [];
    const headers = Object.keys(jsonData[0]);
    csvRows.push(headers.join(','));
    for (const row of jsonData) {
      const values = headers.map((header) => {
        if (typeof row[header] === 'object') {
          let rowValue = JSON.stringify(row[header]).replace(/,/g, '，');
          return `"${rowValue}"`;
        } else if (Array.isArray(row[header])) {
          // 如果该字段是数组，我们将其转换为CSV格式的字符串
          let Value = row[header].map((value: any) => {
            return JSON.stringify(value).replace(/,/g, '，');
          });
          return `"${Value}"`;
        } else {
          // 对于非数组字段，我们只需将值转换为字符串
          return `${('' + row[header]).replace(/,/g, '，')}`;
        }
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  }
  function downloadFile(fileName: any, data: any) {
    // 保存 string 到 文本文件
    //创建一个a链接，用于触发下载事件的载体
    let aLink = document.createElement('a');
    //将实参字符串转二进制对象，如果不是文本可以通过添加第二个参数指定编码
    let blob = new Blob([data]);
    //指定要下载的文件名(浏览器下载时，会根据文件后缀名指定解码)
    aLink.download = fileName;
    //给a链接配置href指向刚才的二进制对象
    aLink.href = URL.createObjectURL(blob);
    //触发事件
    aLink.click();
  }

  function onModalCancel() {
    setUploadListModalOpen(false);
    modelForm.resetFields();
  }

  let preData: any = [];
  async function modalHandleOk() {
    setModalLoading(true);
    let values = form.getFieldsValue();
    let modelValue = modelForm.getFieldsValue();

    const createTime = convertMomentTupleToTimestampTuple(values.createTime);
    if (modelValue.batchMappingTaskIdList) {
      modelValue.batchMappingTaskIdList = modelValue.batchMappingTaskIdList.split(',').map(Number);
    }
    let filteredObj = {
      ...omit(values, 'createTime'),
      startCreateTime: createTime[0],
      endCreateTime: createTime[1],
      ...modelValue,
    };

    filteredObj.cityNameList = convertCityForm2(values.cityNameList);

    try {
      await fetchData(filteredObj, 1);
      //  console.log(preData);

      //需要根据表格字段中的内容进行更换
      if (preData.length > 0) {
        let dataList = preData.map(
          ({
            projectName,
            batchId,
            crossId,
            mappingTaskId,
            mappingResultId,
            algVsn,
            datasetName,
            datasetClip,
            resultStoreInfo,
            createTime,
            status,
          }: any) => ({
            projectName,
            batchId,
            crossId,
            mappingTaskId,
            mappingResultId,
            algVsn,
            datasetName,
            datasetClip,
            resultStoreInfo,
            createTime,
            status,
          }),
        );
        const data = jsonToCsv(dataList);
        downloadFile('下载.csv', data);
      } else {
        message.warning('没有可下载的内容');
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    } finally {
      // setUploadListModalOpen(false);
      setModalLoading(false);
      // modelForm.resetFields();
    }
  }

  async function fetchData(filteredObj: any, page: any) {
    let result = await cpmService.retrieveDataManageList({
      ...omit(filteredObj, 'pageNo', 'pageSize'),
      mappingResultType,
      pageNo: page,
      pageSize: 2000,
    });
    preData = [...preData, ...result.data];

    if (result.data.length < 2000) {
      return preData;
    } else {
      // 否则，递归请求下一页数据
      await fetchData(filteredObj, page + 1);
    }
  }

  const handleCityList = async () => {
    try {
      const result: any = await cpmService.retrieveDimCity();

      let city = result.data.filter((obj: any, index: any) => {
        return result.data.findIndex((item: any) => item.cityName === obj.cityName) === index;
      });

      let cityList = city
        .map((obj: {cityOrder: string}) => ({
          ...obj,
          cityOrder: parseInt(obj.cityOrder),
        }))
        .sort((a: any, b: any) => a.cityOrder - b.cityOrder);

      setCityName(
        cityList.map((item: any) => ({
          label: item.cityName + '-' + item.provName,
          value: item.cityCode,
        })),
      );
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };

  const filterCityOption = (input: string, option?: {label: string; value: string}) =>
    (option?.label ?? '').includes(input);

  const changeBusiness = (e: any) => {
    form.setFieldValue('batchMode', undefined);
    setSelectType(e);
  };

  useEffect(() => {
    handleCityList();
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
    if (!params.businessType) {
      params.businessType = 1;
    }
    const createTime = convertTimestampTupleToDayTuple([params.startCreateTime, params.endCreateTime]);

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
            {mappingResultType === TASK_TYPE.ANNOTATION && (
              <BusinessType
                businessModel={true}
                city={true}
                businessDisabled={true}
                changeBusiness={changeBusiness}
                modeDisabledType={'vector'}
              ></BusinessType>
            )}
            {(mappingResultType === TASK_TYPE.PERCEPTION || mappingResultType === TASK_TYPE.MODEL) && (
              <BusinessType
                businessModel={true}
                city={true}
                changeBusiness={changeBusiness}
                pnpspDisabled={true}
                modeDisabledType={'vector'}
              ></BusinessType>
            )}
            {mappingResultType === TASK_TYPE.INFERENCE && (
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
            <Form.Item label="流水号" name="mappingResultId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="任务编号" name="mappingTaskId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="算法版本" name="algVsn">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="状态" name="status">
              <Select placeholder="请选择" options={MAPPING_RESULT_STATUS_OPTIONS} allowClear></Select>
            </Form.Item>
            <Form.Item label="创建时间" name="createTime">
              <DatePicker.RangePicker
                showTime={{format: 'HH:mm:ss'}}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={['起始时间', '结束时间']}
              ></DatePicker.RangePicker>
            </Form.Item>
            {(mappingResultType === TASK_TYPE.MODEL || mappingResultType === TASK_TYPE.INFERENCE) && (
              <Form.Item label="刷库任务编号" name="batchMappingTaskIds">
                <Input placeholder="请输入" allowClear></Input>
              </Form.Item>
            )}
          </Form>
        </div>
        <div className="search-button">
          <Space>
            <Button type="primary" onClick={handleDownload}>
              下载
            </Button>
            <Button type="primary" onClick={handleSearch}>
              查询
            </Button>
            {mappingResultType === TASK_TYPE.MODEL && selectType == 1 && (
              <Button
                type="primary"
                onClick={() => {
                  navigate('/data-management/data-delivery');
                }}
              >
                批量送标
              </Button>
            )}
            {mappingResultType === TASK_TYPE.INFERENCE && (
              <Button
                type="primary"
                onClick={() => {
                  setUploadListModalOpen(true);
                }}
              >
                批量下载
              </Button>
            )}
            {mappingResultType === TASK_TYPE.MODEL && (
              <Button
                type="primary"
                onClick={() => {
                  setUploadListModalOpen(true);
                }}
              >
                批量下载
              </Button>
            )}
            {mappingResultType === TASK_TYPE.PERCEPTION && (
              <Button
                type="primary"
                onClick={() => {
                  setUploadListModalOpen(true);
                }}
              >
                批量下载
              </Button>
            )}
          </Space>
        </div>
      </div>
      <div style={{width: '1600px'}}>
        <Table
          rowKey="mappingResultId"
          className="page-table"
          columns={columns}
          dataSource={list}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{x: 1000}}
        ></Table>
      </div>

      <CreateManageTask
        task_type={mappingResultType}
        visible={create_task_state.visible}
        onSuccess={() => {
          create_task_state.hide();
        }}
        onCancel={() => {
          create_task_state.hide();
        }}
        state={create_task_state}
      ></CreateManageTask>

      <Modal title="批量下载建图明细" open={uploadListModalOpen} onCancel={onModalCancel} onOk={modalHandleOk}>
        <Spin spinning={modalLoading}>
          <Form form={modelForm} labelCol={{span: 6}}>
            <Form.Item label="算法版本" name="algVsn">
              <Input></Input>
            </Form.Item>
            <Form.Item label="刷库任务编号" name="batchMappingTaskIdList">
              <Input placeholder="多个用英文逗号分隔"></Input>
            </Form.Item>
            <Form.Item label="城市" name="cityCodeList">
              <Select
                mode="multiple"
                showSearch
                options={cityName}
                placeholder="请选择"
                allowClear
                filterOption={filterCityOption}
              ></Select>
            </Form.Item>
            <Form.Item label="批次ID" name="batchIds">
              <Input placeholder="多个用英文逗号分隔"></Input>
            </Form.Item>
            <Form.Item label="路口list" name="crossIds">
              <Input.TextArea rows={4} placeholder="多个用英文逗号分隔"></Input.TextArea>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};
