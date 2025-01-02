import {Button, Form, Input, Select, Space, Table, message, Modal, Upload} from 'antd';
import {DefaultPagination} from '../../constants';
import {useEffect, useState} from 'react';
import {CreateSceneList} from '../project/create-scene-list';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {buildMapService} from '../../services/build-map-service';
import { components } from '../../models/openapi-build-map';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToDayTuple,
  humanizeTime,
  removeEmptyValue,
  convertCityForm,
} from '../../utils';
import {omit} from 'lodash';
import {
  PRODUCE_TASK_STATUS_DESCRIPTIONS,
  ProduceTaskInList,
  TASK_STATUS,
  TASK_STATUS_DESCRIPTIONS,
  TASK_TYPE,
} from '../../models';
import JsonViewDlg from '../json-view';
import { useNavigate } from 'react-router-dom';
import { capitalizeOptions } from '../../libs/client/util';

type SearchParams = components['schemas']['场景查询条件实体类'];
type SiteInfo = components['schemas']['SiteInfo'];

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

/**
 * 场景列表
 */
export const BuildMapSceneList = ({mappingTaskType}: {mappingTaskType?: TASK_TYPE}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<SiteInfo[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState();
  const [modalTitle, setModalTitle] = useState('');

  const create_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>({});

  const [businessType, setBusinessType] = useState<{ label: string; value: number; }[]>([]);
  const [sceneTypes, setSceneTypes] = useState<{ label: string; value: number; }[]>([]);
  const [sceneTypeDescs, setSceneTypeDescs] = useState<{ label: string; value: number; }[]>([]);
  const [siteStatus, setSiteStatus] = useState<{ label: string; value: number; }[]>([]); 
  const [selectedBusinessType, setSelectedBusinessType] = useState<number>();
  const [downloading, setDownloading] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncForm] = Form.useForm();

  const navigate = useNavigate();

  const [initialCoordinates, setInitialCoordinates] = useState<string | undefined>(undefined);
  const [editData, setEditData] = useState<any>(null);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const searchParams = {
      ...omit(values, []),
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
      const ret = await buildMapService.querySiteList({
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

  const columns: ColumnsType<ProduceTaskInList> = [
    {
      title: '场景编号',
      dataIndex: 'siteId',
    },
    {
      title: '场景种别',
      width: '120px',
      dataIndex: 'kind',
      render: (x, record) => {
        return <span>{sceneKindMap[x]}</span>;
      },
    },
    {
      title: '场景类型',
      width: '120px',
      dataIndex: 'typeName',
      render: (x, record) => {
        return <span>{x}</span>;
      },
    },
    {
      title: '路口类型',
      width: '120px',
      dataIndex: 'tagName',
    },
    {
      title: '业务类型',
      width: '120px',
      dataIndex: 'bizType',
      render: (x, record) => {
        return <span>{businessTypeMap[x]}</span>;
      },
    },
    {
      title: '关联信息',
      dataIndex: 'related',
    },
    {
      title: '图幅号',
      dataIndex: 'mesh',
    },
    {
      title: '坐标',
      width: '100px',
      dataIndex: 'locationWkt',
    },
    {
      title: '城市名称',
      width: '120px',
      dataIndex: 'cityName',
    },
    {
      title: '生产状态',
      width: '120px',
      dataIndex: 'status',
      render: (x, record) => {
        return <>{TASK_STATUS_DESCRIPTIONS[x as keyof typeof TASK_STATUS_DESCRIPTIONS]}</>;
      },
    },
    {
      title: '创建时间',
      width: '120px',
      dataIndex: 'createTime',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '更新时间',
      width: '120px',
      dataIndex: 'updateTime',
      render: (x, record) => {
        return <span>{humanizeTime(x)}</span>;
      },
    },
    {
      title: '操作',
      dataIndex: 'detail',
      width: '300px',
      render: (text, record) => {
        const {aipTaskUrl, bizType, siteId, locationWkt, mesh, adminCode, cityName, kind, descName, regionWkt, related} = record;
        const buttons = [];
        
        if (bizType == '1') {
          buttons.push(
            <Button key="edit" type="link" href={aipTaskUrl} target="_blank" onClick={() => {
              setModalTitle('修改场景');
              setInitialCoordinates(locationWkt);
              create_state.show();
              setEditData({
                bizType,
                siteKind: typeof kind === 'number' ? sceneKindMap[kind as number] || kind : '未知种别',
                siteId,
                descName,
                locationWkt: locationWkt,
                district: adminCode,
                area: adminCode,
                mapSheetNo: mesh,
                regionWkt: regionWkt,
                related: related,
              });
            }}>
              场景编辑
            </Button>
          );
        }
        
        if (bizType == '1' || bizType == '0' || bizType == '2' || bizType == '3') {
          buttons.push(
            <Button key="path" type="link" onClick={() => {
              console.log('Navigating to path list with siteId:', siteId);
              navigate(`/build-map/path-list?siteId=${siteId}`);
            }}>
              路径明细
            </Button>
          );
        }
        
        return buttons;
      },
    }
  ];
  const handleTableChange = (pagination: TablePaginationConfig) => {
    changeHistory({
      ...serach_params,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
  };
  useEffect(() => {
    let params: any = {};

    query.forEach((value, key) => {
      if (
        ['pageNo', 'pageSize', 'siteIdList', 'bizType', 'kind', 'type', 'status'].includes(
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

    setSerachParams(params);

    getList(params);
  }, [query.toString()]);

  const fetchOptions = async () => {
    try {
      // 获取业务类型
      const bizTypeRes = await buildMapService.getBizType();
      const businessTypes = bizTypeRes.data ? Object.entries(bizTypeRes.data).map(([label, value]) => ({ 
        label, 
        value: Number(value) 
      })) : [];
      setBusinessType(capitalizeOptions(businessTypes));

      // 如果有选中的业务类型,获取场景种别和场景类型
      if (selectedBusinessType !== undefined) {
        // 获取场景种别
        const siteKindRes = await buildMapService.getSiteKind(selectedBusinessType);
        const createOptions = (data: any) => 
          data ? Object.entries(data).map(([label, value]) => ({ 
            label, 
            value: Number(value) 
          })) : [];
        setSceneTypes(capitalizeOptions(createOptions(siteKindRes.data)));

        // 获取场景类型
        const siteTypeRes = await buildMapService.getSiteType(selectedBusinessType);
        setSceneTypeDescs(capitalizeOptions(createOptions(siteTypeRes.data)));
      }

      // 获取生产状态
      const siteStatusRes = await buildMapService.getSiteStatus();
      const createOptions = (data: any) => 
        data ? Object.entries(data).map(([label, value]) => ({ 
          label, 
          value: Number(value) 
        })) : [];
      setSiteStatus(capitalizeOptions(createOptions(siteStatusRes.data)));

    } catch (error) {
      console.error('Failed to fetch options:', error);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [selectedBusinessType]);

  const handleBusinessTypeChange = async (value: number) => {
    console.log('业务类型改变:', value);
    setSelectedBusinessType(value);
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
    try {
      const pageSize = 2000;
      let ret: any = [];
      for (let i = 1; i <= 10; i++) {
        const pageNo = i;
        const result = await buildMapService.querySiteList({
          ...omit(filteredObj, 'pageNo', 'pageSize'),
          pageNo,
          pageSize,
        });
        ret = [...ret, ...(result.data ?? [])];
        if (!result.data?.length || result.data.length < pageSize) {
          break;
        }
      }

      let uploadList: any = ret;
      if (uploadList.length == 20000) {
        // uploadList = uploadList.slice(0, 20000);
        message.warning('只能下载前两万条');
      }

      if (uploadList.length > 0) {
        let dataList = uploadList.map(({
          siteId,
          kind,
          type,
          tag,
          bizType,
          related,
          mesh,
          location,
          cityName,
          status,
          createTime,
          updateTime
        }: any) => ({
          场景编号: siteId,
          场景种别: kind,
          场景类型: type,
          路口类型: tag,
          业务类型: bizType,
          关联信息: related,
          图幅号: mesh,
          坐标: location,
          城市名称: cityName,
          生产状态: status,
          创建时间: createTime,
          更新时间: updateTime
        }));
        const data = jsonToCsv(dataList);
        downloadFile('场景列表.csv', data);
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
          // 如果该字段是数组我们将其转换为CSV格式的字符串
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
    //指定��下载的文件(浏览器下载时，会根据文件后缀名指定解码)
    aLink.download = fileName;
    //给a链接配置href指向刚才的二进制对象
    aLink.href = URL.createObjectURL(blob);
    //触发事件
    aLink.click();
  }

  const handleSync = () => {
    setIsSyncModalOpen(true);
  };

  const handleSyncCancel = () => {
    setIsSyncModalOpen(false);
  };

  const cookies = document.cookie.split(';').reduce((prev: any, curr: any) => {
    const [k, v] = curr.split('=');
    prev[k.trim()] = v;
    return prev;
  }, {});

  const handleSyncOk = async () => {
    try {
      const values = syncForm.getFieldsValue();
      const { bizType, name, mapSiteFile } = values;

      const operator = cookies['userName4Cross'];

      await buildMapService.syncMapSite(bizType, mapSiteFile, name, operator);
      message.success('场景同步成功');
      setIsSyncModalOpen(false);
    } catch (error: any) {
      console.error('场景同步失败:', error);
      message.error('场景同步失败');
    }
  };

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            <Form.Item label="业务类型" name="bizType">
              <Select
                placeholder="请选择"
                style={{width: '200px'}}
                allowClear
                options={businessType}
                onChange={handleBusinessTypeChange}
                onSelect={(value) => console.log('选择的值:', value)}
              ></Select>
            </Form.Item>
            <Form.Item label="场景种别" name="kind">
              <Select
                placeholder="请选择"
                style={{width: '200px'}}
                allowClear
                options={sceneTypes}
              ></Select>
            </Form.Item>
            <Form.Item label="场景类型" name="type">
              <Select
                placeholder="请选择"
                style={{width: '200px'}}
                allowClear
                options={sceneTypeDescs}
              ></Select>
            </Form.Item>
            <Form.Item label="生产状态" name="status">
              <Select
                placeholder="请选择"
                style={{width: '200px'}}
                allowClear
                options={siteStatus}
              ></Select>
            </Form.Item>
            <Form.Item label="场景编号" name="siteId">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
          </Form>
        </div>
        <div className="search-button">
          <Space>
            <Button type="primary" onClick={handleSearch}>
              查询
            </Button>
            <Button type="primary" onClick={handleSync}>
              场景同步
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setModalTitle('新增场景');
                create_state.show();
                handleSearch();
              }}
            >
              场景创造
            </Button>
            <Button type="primary" onClick={handleDownload} loading={downloading}>
              下载
            </Button>
          </Space>
        </div>
      </div>

      <Modal
        title="场景同步"
        visible={isSyncModalOpen}
        onCancel={handleSyncCancel}
        onOk={handleSyncOk}
      >
        <Form form={syncForm} layout="inline">
          <Form.Item
            label="业务类型"
            name="bizType"
            style={{ marginBottom: '16px' }}
          >
            <span style={{ width: '200px', display: 'inline-block' }}>MAP</span>
          </Form.Item>
          <Form.Item
            label="DIFF文件地址"
            name="name"
            rules={[{ required: true, message: '请输入DIFF文件地址' }]}
            style={{ marginBottom: '16px' }}
          >
            <Input placeholder="请输入DIFF文件地址" style={{ width: '200px' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Table
        rowKey="mappingTaskId"
        className="page-table"
        columns={columns as ColumnsType<SiteInfo>}
        dataSource={list}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      ></Table>
      <CreateSceneList
        visible={create_state.visible}
        onSuccess={() => {
          handleCloseCreateModel();
        }}
        onCancel={() => {
          handleCloseCreateModel();
        }}
        title={modalTitle}
        initialCoordinates={initialCoordinates}
        editData={editData}
      ></CreateSceneList>
      <JsonViewDlg visible={isModalOpen} closeDialog={() => setIsModalOpen(false)} content={content}></JsonViewDlg>
    </div>
  );
};