import {Button, DatePicker, Form, Input, Select, Space, Table, message, Modal} from 'antd';
import {DefaultPagination} from '../constants';
import {useEffect, useState} from 'react';
import {CreateModal} from './project/create-batch';
import {UpdateBatchModal} from './project/update-batch';
import {useEditState, usePageFns, useQuery} from '../hooks';
import {cpmService} from '../services/cpw-service';
import {BatchInList} from '../models';
import JsonViewDlg from './json-view';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToMomentTuple,
  convertTimestampTupleToDayTuple,
  getQueryOffset,
  humanizeTime,
  removeEmptyValue,
} from '../utils';

import {omit} from 'lodash';
import {ProjectSelect} from './project/project-select';
import {BusinessType} from './business-type';
interface SearchParams {
  projectId?: number;
  projectName?: string;
  startTime?: number;
  endTime?: number;
  pageNo?: number;
  pageSize?: number;
  businessType?: number;
  batchMode?: number;
}

/**
 * 批次列表页面
 */
export const BatchList = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<BatchInList[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [record, setRecord] = useState();
  const update_batch_state = useEditState();

  const create_state = useEditState();

  const [serach_params, setSerachParams] = useState<SearchParams>({});
  const [businessTypeList, setBusinessTypeList] = useState();
  const [buttonType, setButtonType] = useState('');
  const [changeBusiness, setChangeBusiness] = useState(1);
  const showContent = (content: any) => {
    setRecord(content);
    setIsModalOpen(true);
  };

  const showUpdate = (param: any) => {
    let processList = JSON.parse(param.processList);

    update_batch_state.setItem({
      businessType: param.businessType,
      batchMode: param.batchMode,
      batchId: param.batchId,
      batchName: param.batchName,
      batchDesc: param.batchDesc,
      processList: processList,
      configParamList: param.configParamList,
    });

    update_batch_state.show();
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const createTime = convertMomentTupleToTimestampTuple(values.createTime);
    if (values.businessType) {
      changeHistory({
        ...omit(values, ['createTime']),
        startTime: createTime[0],
        endTime: createTime[1],
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

  const getList = async (params: SearchParams) => {
    try {
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;

      // const startIndex = getQueryOffset(pageNo, pageSize);

      setLoading(true);
      const ret = await cpmService.retrieveBatchList({
        ...omit(params, 'pageNo', 'pageSize'),
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
  const handleDownload = async () => {
    let values = form.getFieldsValue();
    const createTime = convertMomentTupleToTimestampTuple(values.createTime);

    let filteredObj = Object.keys(values)
      .filter((key) => key !== 'createTime')
      .reduce((result: any, key) => {
        result[key] = values[key];
        return result;
      }, {});

    filteredObj.startTime = createTime[0];
    filteredObj.endTime = createTime[1];
    try {
      const pageSize = 2000;
      let ret: any = [];
      for (let i = 1; i <= 10; i++) {
        const pageNo = i;
        let result = await cpmService.retrieveBatchList({
          ...omit(filteredObj, 'pageNo', 'pageSize'),
          pageNo,
          pageSize,
        });
        ret = [...ret, ...result.data];

        if (result.data.length == 0 || result.data.length < pageSize) {
          break;
        }
      }
      if (ret.length == 20000) {
        message.warning('只能下载前两万条');
      }
      if (ret.length > 0) {
        const data = jsonToCsv(ret);
        downloadFile('批次下载.csv', data);
      } else {
        return message.warning('没有可下载的内容');
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
      const values = headers.map((header, index) => {
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

  const columns: ColumnsType<BatchInList> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
    },
    {
      title: '批次编号',
      dataIndex: 'batchId',
    },
    {
      title: '批次名称',
      dataIndex: 'batchName',
      render: (x, record) => {
        return <span>{x || '-'}</span>;
      },
    },
    {
      title: '批次创建时间',
      dataIndex: 'createTime',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },

    {
      title: '路口数量',
      dataIndex: 'crossNum',
    },
    {
      title: '操作员',
      dataIndex: 'operator',
    },
    {
      title: '批次环节列表',
      dataIndex: 'processList',
      render: (text, record) => {
        return (
          <div>
            <Button onClick={() => showContent(JSON.parse(text))}>查看</Button>
          </div>
        );
      },
    },
    {
      title: '批次配置参数列表',
      dataIndex: 'configParamList',
      render: (text, record) => {
        return (
          <div>
            <Button onClick={() => showContent(text)}>查看</Button>
          </div>
        );
      },
    },
    {
      title: '更新',
      dataIndex: 'batchId',
      render: (text, record) => {
        return (
          <div>
            <Button
              onClick={() =>
                showUpdate({
                  businessType: record.businessType,
                  batchMode: record.batchMode,
                  configParamList: record.configParamList as [],
                  processList: record.processList as string,
                  batchDesc: record.batchDesc as string,
                  batchId: record.batchId as number,
                  batchName: record.batchName as string,
                })
              }
            >
              更新
            </Button>
          </div>
        );
      },
    },
    // {
    //   title: '状态',
    //   dataIndex: 'status',
    // },
    {
      title: '操作',
      dataIndex: 'detail',
      render: (text, record) => {
        const {batchId} = record;
        return (
          <>
            <Button type="link" href={`/#/data-product/increment/collect?batchId=${batchId}`} target="_blank">
              详情
            </Button>
            <Button type="link" href={`/#/data-monitor/batch?batchId=${batchId}`} target="_blank">
              统计
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

  const getBusinessTypeList = async () => {
    try {
      const businessTypeResult: any = await cpmService.getBusinessTypeList();

      setBusinessTypeList(
        businessTypeResult.data.map((item: any) => {
          return {
            label: item.name,
            value: item.value,
          };
        }),
      );
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };
  const businessChange = (e: any) => {
    setChangeBusiness(e);
    form.setFieldValue('batchMode', undefined);
  };

  useEffect(() => {
    //getModeList();
    getBusinessTypeList();
  }, []);

  useEffect(() => {
    let params: SearchParams = {};

    query.forEach((value, key) => {
      if (['startTime', 'endTime', 'pageNo', 'pageSize', 'projectId', 'businessType', 'batchMode'].includes(key)) {
        // @ts-ignore
        params[key] = value ? Number(value) : undefined;
      } else {
        // @ts-ignore
        params[key] = value;
      }
    });
    //进入页面 默认产线为cross
    if (!params.businessType) {
      params.businessType = 1;
    }

    params = removeEmptyValue(params);
    params = omit(params, ['userName']);

    const createTime = convertTimestampTupleToDayTuple([params.startTime, params.endTime]);

    form.setFieldsValue({
      ...omit(params, ['startTime', 'endTime']),
      createTime: createTime,
    });

    setSerachParams(params);

    getList(params);
  }, [query.toString(), update_batch_state.visible]);

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            <ProjectSelect changeBusiness={changeBusiness}></ProjectSelect>
            <Form.Item label="批次编号" name="batchId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="批次名称" name="batchName">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="生产模式" name="businessType">
              <Select
                placeholder="请选择"
                style={{width: '200px'}}
                allowClear
                options={businessTypeList}
                onChange={businessChange}
              ></Select>
            </Form.Item>
            {/* <Form.Item label="产线模式" name="batchMode">
              <Select placeholder="请选择" style={{width: '200px'}} allowClear options={modelName}></Select>
            </Form.Item> */}

            <Form.Item label="创建时间" name="createTime">
              <DatePicker.RangePicker
                showTime={{format: 'HH:mm:ss'}}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={['起始时间', '结束时间']}
                style={{width: '340px'}}
              ></DatePicker.RangePicker>
            </Form.Item>
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
            <Button
              type="primary"
              onClick={() => {
                setButtonType('create');
                create_state.show();
              }}
            >
              创建批次
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setButtonType('updateList');
                create_state.show();
              }}
            >
              批量更新
            </Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="batchId"
        className="page-table"
        columns={columns}
        dataSource={list}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      ></Table>
      <JsonViewDlg visible={isModalOpen} closeDialog={() => setIsModalOpen(false)} content={record}></JsonViewDlg>
      <UpdateBatchModal
        businessTypeList={businessTypeList}
        state={update_batch_state}
        visible={update_batch_state.visible}
        configParamList={update_batch_state.getItem()?.configParamList}
        onSuccess={() => {
          update_batch_state.hide();
        }}
        onCancel={() => {
          update_batch_state.hide();
        }}
      ></UpdateBatchModal>
      <CreateModal
        businessType={businessTypeList}
        visible={create_state.visible}
        buttonType={buttonType}
        onSuccess={() => {
          if (buttonType == 'create') {
            handleCloseCreateModel();
            handleSearch();
          } else if (buttonType === 'updateList') {
            create_state.hide();
            handleSearch();
          }
        }}
        onCancel={() => {
          handleCloseCreateModel();
        }}
      ></CreateModal>
    </div>
  );
};
