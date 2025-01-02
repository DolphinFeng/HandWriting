import {Button, Form, Input, Select, Space, Table, message, Modal, Upload, Radio} from 'antd';
import {DefaultPagination} from '../../constants';
import {useEffect, useState} from 'react';
import {CreateModal} from '../project/create-modal';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {buildMapService} from '../../services/build-map-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {
  humanizeTime,
  removeEmptyValue,
} from '../../utils';
import {omit} from 'lodash';
import {
  TASK_TYPE,
} from '../../models';
import JsonViewDlg from '../json-view';
import {components} from '../../models/openapi-build-map';
import { capitalizeOptions } from '../../libs/client/util';
import { useNavigate } from 'react-router-dom';

type SearchParams = components['schemas']['DemandInfoQuery'];
type DemandInfo = components['schemas']['DemandInfoRes'];

/**
 * 需求管理
 */
export const BuildMapDemandImport = ({mappingTaskType}: {mappingTaskType?: TASK_TYPE}) => {
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
  const [demandTypes, setDemandTypes] = useState<{ label: string; value: number; }[]>([]);
  const [businessType, setBusinessType] = useState<{ label: string; value: number; }[]>([]); // 新增业务类型状态
  const [selectedBusinessType, setSelectedBusinessType] = useState<number>(); // 新增选中的业务类型状态

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const bizTypeRes = await buildMapService.getBizType(); // 获取业务类型
        const businessTypes = bizTypeRes.data ? Object.entries(bizTypeRes.data).map(([label, value]) => ({ 
          label, 
          value: Number(value) 
        })) : [];
        setBusinessType(capitalizeOptions(businessTypes));
      } catch (error) {
        console.error('Failed to fetch business types:', error);
      }
    };

    fetchBusinessTypes();
  }, []);

  useEffect(() => {
    const fetchDemandTypes = async () => {
      try {
        if (selectedBusinessType !== undefined) {
          const demandTypeRes = await buildMapService.getDemandType(selectedBusinessType); // 使用选中的业务类型
          const createOptions = (data: any) => 
            data ? Object.entries(data).map(([label, value]) => ({ 
              label, 
              value: Number(value) 
            })) : [];
          setDemandTypes(capitalizeOptions(createOptions(demandTypeRes.data)));
        }
      } catch (error) {
        console.error('Failed to fetch demand types:', error);
      }
    };

    fetchDemandTypes();
  }, [selectedBusinessType]);

  const handleBusinessTypeChange = (value: number) => {
    setSelectedBusinessType(value);
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const searchParams = {
      ...values,
      pageNo: 1,
      pageSize: pagination.pageSize,
    };
    
    changeHistory(removeEmptyValue(searchParams));
  };

  const handleCloseCreateModel = () => {
    create_state.hide();
  };

  const getList = async (params: SearchParams) => {
    try {
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;

      setLoading(true);
      const ret = await buildMapService.queryDemand({
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

  const [isSceneLinkModalOpen, setIsSceneLinkModalOpen] = useState(false);
  const [sceneLinkForm] = Form.useForm();
  const [currentDemandId, setCurrentDemandId] = useState<number | null>(null); // 新增状态用于存储当前行的需求编号

  const handleSceneLink = (demandId: number) => {
    setCurrentDemandId(demandId); // 设置当前行的需求编号
    setIsSceneLinkModalOpen(true);
  };

  const handleSceneLinkCancel = () => {
    setIsSceneLinkModalOpen(false);
  };

  const handleSceneLinkOk = async () => {
    try {
      const values = sceneLinkForm.getFieldsValue();
      const { sceneList, triggerCollection } = values;

      if (currentDemandId === null) {
        throw new Error('未选择需求编号');
      }

      const formData = new FormData();
      formData.append('demandId', currentDemandId.toString());
      formData.append('siteIdList', sceneList);
      formData.append('needCollect', triggerCollection === 'yes' ? 'true' : 'false');

      const result = await buildMapService.addSites(formData);

      if (result.data?.code === -1) {
        message.error(result.data.msg);
      } else {
        message.success('场景关联成功');
        setIsSceneLinkModalOpen(false);
      }
    } catch (error: any) {
      console.error('场景关联失败:', error);

      const errorMessage = error.response?.data?.message || error.message || '场景关联失败';
      message.error(errorMessage);
    }
  };

  const handleTaskDetail = (demandId: number) => {
    navigate(`/build-map/demand-detail?demandId=${demandId}`);
  };

  const businessTypeMap: Record<number, string> = {
    1: 'PNPSP',
    4: 'PNV',
    0: 'MAP',
    3: 'FDM',
    2: 'P2P',
  };

  const demandTypeMap: Record<number, string> = {
    2: '业务需求',
    3: '生产需求',
  };

  const columns: ColumnsType<DemandInfo> = [
    {
      title: '需求编号',
      dataIndex: 'demandId',
    },
    {
      title: '业务类型',
      dataIndex: 'bizType',
      render: (x) => <span>{businessTypeMap[x]}</span>,
    },
    {
      title: '需求名称',
      dataIndex: 'name',
    },
    {
      title: '需求描述',
      dataIndex: 'desc',
    },
    {
      title: '需求类型',
      dataIndex: 'demandType',
      render: (x) => <span>{demandTypeMap[x]}</span>,
    },
    {
      title: '场景数量',
      dataIndex: 'siteNum',
    },
    {
      title: '操作员',
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
        const {demandId} = record;

        return (
          <>
            {demandId !== undefined && (
              <Button type="link" onClick={() => handleSceneLink(demandId)}>
                场景关联
              </Button>
            )}
            <Button type="link" onClick={() => handleTaskDetail(record.demandId ?? 0)}>
              需求明细
            </Button>
          </>
        );
      },
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const values = form.getFieldsValue();
    changeHistory({
      ...values,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
  };
  useEffect(() => {
    let params: any = {};

    query.forEach((value, key) => {
      if (
        ['pageNo', 'pageSize', 'demandId', 'bizType', 'demandType'].includes(
          key,
        )
      ) {
        // @ts-ignore
        params[key] = value ? Number(value) : undefined;
      } else {
        // @ts-ignore
        params[key] = value;
      }
    });

    params = removeEmptyValue(params);

    form.setFieldsValue({
      ...omit(params, []),
    });

    setSerachParams(params);

    getList(params);
  }, [query.toString()]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();

  const handleCreateDemand = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateCancel = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateOk = async () => {
    try {
      const values = createForm.getFieldsValue();
      // 调用 upsertDemand 接口
      await buildMapService.upsertDemand(values);
      message.success('需求创建成功');
      setIsCreateModalOpen(false);
      // 重置创建表单
      createForm.resetFields();
      // 刷新列表数据
      const searchValues = form.getFieldsValue();
      const searchParams = {
        ...searchValues,
        pageNo: 1,
        pageSize: pagination.pageSize,
      };
      changeHistory(removeEmptyValue(searchParams));
    } catch (error: any) {
      console.error('需求创建失败:', error);
      message.error('需求创建失败');
    }
  };

  const [createDemandTypes, setCreateDemandTypes] = useState<{ label: string; value: number; }[]>([]); // 新增状态用于存储创建需求时的需求类型
  const [selectedCreateBusinessType, setSelectedCreateBusinessType] = useState<number>(); // 新增状态用于存储创建需求时选中的业务类型

  useEffect(() => {
    const fetchCreateDemandTypes = async () => {
      try {
        if (selectedCreateBusinessType !== undefined) {
          const demandTypeRes = await buildMapService.getDemandType(selectedCreateBusinessType); // 使用选中的业务类型
          const createOptions = (data: any) => 
            data ? Object.entries(data).map(([label, value]) => ({ 
              label, 
              value: Number(value) 
            })) : [];
          setCreateDemandTypes(capitalizeOptions(createOptions(demandTypeRes.data)));
        }
      } catch (error) {
        console.error('Failed to fetch demand types for creation:', error);
      }
    };

    fetchCreateDemandTypes();
  }, [selectedCreateBusinessType]);

  const handleCreateBusinessTypeChange = (value: number) => {
    setSelectedCreateBusinessType(value);
  };

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            <Form.Item label="需求名称" name="name">
              <Input placeholder="请输入" allowClear style={{width: '200px'}}></Input>
            </Form.Item>
            <Form.Item label="需求编号" name="demandId">
              <Input placeholder="请输入" allowClear style={{width: '200px'}}></Input>
            </Form.Item>
            <Form.Item
              label="业务类型"
              name="bizType"
              style={{ marginBottom: '16px' }}
            >
              <Select 
                placeholder="请选择" 
                style={{ width: '200px' }} 
                options={businessType} 
                onChange={handleBusinessTypeChange} // 绑定业务类型变化事件
              />
            </Form.Item>
            <Form.Item label="需求类型" name="demandType">
              <Select
                placeholder="请选择"
                style={{width: '200px'}}
                allowClear
                options={demandTypes}
              ></Select>
            </Form.Item>
          </Form>
        </div>
        <div className="search-button">
          <Space>
            <Button type="primary" onClick={handleCreateDemand}>
              创建需求
            </Button>
            <Button type="primary" onClick={handleSearch}>
              查询
            </Button>
          </Space>
        </div>
      </div>

      <Modal
        title="创建需求"
        visible={isCreateModalOpen}
        onCancel={handleCreateCancel}
        onOk={handleCreateOk}
      >
        <Form form={createForm} layout="inline">
          <Form.Item
            label="业务类型"
            name="bizType"
            rules={[{ required: true, message: '请选择业务类型' }]}
            style={{ marginBottom: '16px' }}
          >
            <Select 
              placeholder="请选择" 
              style={{ width: '390px' }} 
              options={businessType} 
              onChange={handleCreateBusinessTypeChange} // 绑定业务类型变化事件
            />
          </Form.Item>
          <Form.Item
            label="需求类型"
            name="demandType"
            rules={[{ required: true, message: '请选择需求类型' }]}
            style={{ marginBottom: '16px' }}
          >
            <Select 
              placeholder="请选择" 
              style={{ width: '390px' }} 
              options={createDemandTypes} // 使用创建需求时的需求类型
            />
          </Form.Item>
          <Form.Item
            label="需求名称"
            name="name"
            rules={[{ required: true, message: '请输入需求名称' }]}
            style={{ marginBottom: '16px' }}
          >
            <Input placeholder="请输入需求名称" style={{ width: '390px' }} />
          </Form.Item>
          <Form.Item
            label="关联信息"
            name="otherInfo"
            style={{ marginBottom: '16px' }}
          >
            <Input placeholder="请输入关联信息" style={{ width: '400px' }} />
          </Form.Item>
          <Form.Item
            label="需求描述"
            name="desc"
            style={{ marginBottom: '16px' }}
          >
            <Input.TextArea placeholder="请输入需求描述" style={{ width: '400px' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="场景关联"
        visible={isSceneLinkModalOpen}
        onCancel={handleSceneLinkCancel}
        onOk={handleSceneLinkOk}
      >
        <Form form={sceneLinkForm} layout="vertical">
          <Form.Item
            label="场景 LIST"
            name="sceneList"
            rules={[{ required: true, message: '请输入场景列表' }]}
            style={{ marginBottom: '16px' }}
          >
            <Input.TextArea placeholder="请输入场景列表" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="场景文件" style={{ marginBottom: '16px' }}>
            <Upload>
              <Button>点击上传</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="是否触发采集"
            name="triggerCollection"
            rules={[{ required: true, message: '请选择是否触发采集' }]}
            style={{ marginBottom: '16px' }}
          >
            <Radio.Group>
              <Radio value="yes">是</Radio>
              <Radio value="no">否</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

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
    </div>
  );
};
