import {Button,DatePicker, Form, Input, Select, Space, Table, message, Modal, Upload} from 'antd';
import {DefaultPagination} from '../../constants';
import {useEffect, useState} from 'react';
import {CreateModal} from '../project/create-modal';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {buildMapService} from '../../services/build-map-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToDayTuple,
  humanizeTime,
  removeEmptyValue,
} from '../../utils';
import {omit} from 'lodash';
import {components} from '../../models/openapi-build-map';
import { TASK_TYPE } from '../../models';
import JsonViewDlg from '../json-view';
import { useNavigate } from 'react-router-dom';
import { capitalizeOptions } from '../../libs/client/util';

type SearchParams = components['schemas']['DemandInfoQuery'];
type DemandInfo = components['schemas']['DemandInfoRes'];

const businessTypeMap: Record<number, string> = {
  1: 'PNPSP',
  4: 'PNV',
  0: 'MAP',
  3: 'FDM',
  2: 'P2P',
};

const sceneKindMap: Record<number, string> = {
  20000: 'PSP',
  10000: 'PN',
  40000: 'PNV',
  2: 'FORK',
  2000: 'ROUNDABOUT',
  1: 'CROSS',
  1000: 'SITE_GROUP',
  21: 'MAIN',
  30000: 'FDM',
  50000: 'P2P',
};

const statusMap: Record<number, string> = {
  0: 'READY',
  1: 'WORKING',
  2: 'DELETED',
  3: 'FAILURE',
};

/**
 * 任务创建
 */
export const BuildMapTaskCreate = ({mappingTaskType}: {mappingTaskType?: TASK_TYPE}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<DemandInfo[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState();

  const create_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>({});
  const [businessType, setBusinessType] = useState<{ label: string; value: number; }[]>([]);
  const [selectedBusinessType, setSelectedBusinessType] = useState<number | null>(null);
  const [demandStatus, setDemandStatus] = useState<{ label: string; value: number; }[]>([]);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [selectedDemandId, setSelectedDemandId] = useState<number | null>(null);

  const navigate = useNavigate();

  const [importForm] = Form.useForm();

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const createTime = convertMomentTupleToTimestampTuple(values.createTime);
    changeHistory({
      ...omit(values, ['createTime']),
      startCreateTime: createTime[0],
      endCreateTime: createTime[1],
      pageNo: 1,
      pageSize: pagination.pageSize,
    });
  };

  const handleCloseCreateModel = () => {
    create_state.hide();
  };

  const getList = async (params: SearchParams) => {
    try {
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;

      setLoading(true);
      const ret = await buildMapService.querySyncTaskUsingPOST({
        ...omit(params, 'pageNo', 'pageSize'),
        pageNo,
        pageSize,
      });

      setList(ret.data ?? []);
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

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const bizTypeRes = await buildMapService.getBizType();
        const businessTypes = bizTypeRes.data ? Object.entries(bizTypeRes.data).map(([label, value]) => ({ 
          label, 
          value: Number(value) 
        })) : [];
        setBusinessType(capitalizeOptions(businessTypes));
      } catch (error) {
        console.error('Failed to fetch options:', error);
      }
    };

    fetchOptions();
  }, [selectedBusinessType]);

  useEffect(() => {
    const fetchDemandStatus = async () => {
      try {
        const statusOptions = Object.entries(statusMap).map(([value, label]) => ({
          label,
          value: Number(value)
        }));
        setDemandStatus(capitalizeOptions(statusOptions));
      } catch (error) {
        console.error('Failed to fetch demand status:', error);
      }
    };

    fetchDemandStatus();
  }, []);

  const handleDiffSync = (demandId: number) => {
    setSelectedDemandId(demandId);
    setIsDiffModalOpen(true);
  };

  const handleDiffSyncSubmit = async (values: any) => {
    try {
      if (selectedDemandId === null) {
        throw new Error('Demand ID is not selected');
      }

      await buildMapService.applySyncLogUsingPOST(selectedDemandId);
      message.success('DIFF 同步成功');
      setIsDiffModalOpen(false);
    } catch (error) {
      console.error('Failed to sync DIFF:', error);
      message.error('DIFF 同步失败');
    }
  };

  const handleTaskDetail = (demandId: number) => {
    navigate(`/build-map/task-detail?demandId=${demandId}`);
  };

  const columns: ColumnsType<DemandInfo> = [
    {
      title: '业务类型',
      dataIndex: 'bizType',
      render: (x) => <span>{businessTypeMap[x]}</span>,
    },
    {
      title: '任务编号',
      dataIndex: 'demandId',
    },
    {
      title: '任务名称',
      dataIndex: 'name',
    },
    {
      title: 'DIFF数量',
      dataIndex: 'logNum',
    },
    {
      title: '核实完成DIFF量',
      dataIndex: 'checkedLogSum',
    },
    {
      title: '任务状态',
      dataIndex: 'status',
      render: (x) => <span>{statusMap[x]}</span>,
    },
    {
      title: '创建人',
      dataIndex: 'operator',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '操作',
      dataIndex: 'detail',
      width: '400px',
      render: (text, record) => {
        return (
          <>
            <Button type="link" onClick={() => handleDiffSync(record.demandId ?? 0)}>
              DIFF同步
            </Button>
            <Button type="link" onClick={() => handleTaskDetail(record.demandId ?? 0)}>
              任务明细
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
      } else if (key === 'status') {
        const foundValue = Object.entries(statusMap).find(([_, label]) => label === value)?.[0];
        params[key] = foundValue !== undefined ? Number(foundValue) : undefined;
      } else {
        // @ts-ignore
        params[key] = value;
      }
    });

    params = removeEmptyValue(params);

    const createTime = convertTimestampTupleToDayTuple([params.startCreateTime, params.endCreateTime]);

    form.setFieldsValue({
      ...omit(params, ['startCreateTime', 'endCreateTime', 'cityNameList']),
      createTime: createTime,
    });

    setSerachParams(params);

    getList(params);
  }, [query.toString()]);

  const cookies = document.cookie.split(';').reduce((prev: any, curr: any) => {
    const [k, v] = curr.split('=');
    prev[k.trim()] = v;
    return prev;
  }, {});

  const handleImport = async (values: any) => {
    try {
      const { bizType, name, taskDescription, csDeviceFile, psDeviceFile } = values;
      const formData = new FormData();
      formData.append('bizType', bizType.toString());
      formData.append('name', name);
      formData.append('desc', taskDescription);
      formData.append('operator', cookies['userName4Cross']);
      if (psDeviceFile?.fileList[0]?.originFileObj) {
        formData.append('csDeviceFile', psDeviceFile.fileList[0].originFileObj);
      }
      if (csDeviceFile?.fileList[0]?.originFileObj) {
        formData.append('psDeviceFile', csDeviceFile.fileList[0].originFileObj);
      }
      
      const { data } = await buildMapService.verifyPnPspSite(formData);
      
      if (data.code === -1) {
        message.error(data.msg || '任务创建失败');
        return;
      }
      
      message.success('任务创建成功');
      setIsImportModalOpen(false);
      
      // 重置导入表单
      form.resetFields();
      
      // 刷新列表数据
      handleSearch();
    } catch (error: any) {
      console.error('Failed to create task:', error);
      message.error(error.msg || error.message || '任务创建失败');
    }
  };

  const handleOpenImportModal = () => {
    importForm.resetFields();
    setIsImportModalOpen(true);
  };

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            <Form.Item label="任务名称" name="name">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="任务编号" name="demandId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="任务状态" name="status">
              <Select placeholder="请选择" options={demandStatus}></Select>
            </Form.Item>
          </Form>
        </div>
        <div className="search-button">
          <Space>
            <Button type="primary" onClick={handleSearch}>
              查询
            </Button>
            <Button type="primary" onClick={handleOpenImportModal}>
              资源导入
            </Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="demandId"
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

      <Modal
        title="需求分析任务创建"
        visible={isImportModalOpen}
        onCancel={() => setIsImportModalOpen(false)}
        footer={null}
      >
        <Form 
          form={importForm}
          onFinish={handleImport}
          layout="vertical"
        >
          <Form.Item
            label="业务类型"
            name="bizType"
            initialValue={1}
          >
            <Select
              disabled
              options={[{ label: 'PNPSP', value: 1 }]}
            />
          </Form.Item>
          <Form.Item
            label="任务名称"
            name="name"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item label="任务描述" name="taskDescription">
            <Input.TextArea placeholder="请输入任务描述" />
          </Form.Item>
          <Form.Item label="换电设备文件" name="csDeviceFile">
            <Upload>
              <Button>上传文件</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="充电桩设备文件" name="psDeviceFile">
            <Upload>
              <Button>上传文件</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setIsImportModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="DIFF 同步"
        visible={isDiffModalOpen}
        onCancel={() => setIsDiffModalOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setIsDiffModalOpen(false)}>取消</Button>
            <Button type="primary" form="diffSyncForm" key="submit" htmlType="submit">
              确定
            </Button>
          </Space>
        }
      >
        <Form id="diffSyncForm" onFinish={handleDiffSyncSubmit} layout="vertical">
          <Form.Item
            label="业务类型"
            name="businessType"
            rules={[{ required: true, message: '请选择业务类型' }]}
          >
            <Select
              placeholder="请选择"
              options={businessType}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
