import {Button, DatePicker, Form, Input, Select, Space, Table, Typography, message, Tooltip, InputNumber} from 'antd';
import {DefaultPagination} from '../../constants';
import {useEffect, useState} from 'react';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {cpmService} from '../../services/cpw-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToMomentTuple,
  convertTimestampTupleToDayTuple,
  humanizeTime,
  removeEmptyValue,
} from '../../utils';
import {omit} from 'lodash';
import {
  CreateMapByModelPayload,
  DataManageInList,
  DataManageListQuery,
  MAPPING_RESULT_STATUS_DESC,
  MAPPING_RESULT_STATUS_OPTIONS,
} from '../../models';
import {CitySelects} from './intersection-list/city-search-selects';
import {SITE_TAG_OPTIONS} from '../../models/cross';
import {CreateDeliveryTask} from './data-list/create-delivery-task';
import { stringify } from 'lossless-json';

type SearchParams = DataManageListQuery & {
  startCreateTime?: number;
  endCreateTime?: number;
  crossTypes?: [];
  crossTags?: [];
};

/**
 * 任务列表
 */
export const DataDelivery = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<DataManageInList[]>([]); // 项目列表
  const [formValue, setFormValus] = useState();
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();
  const create_delivery_task = useEditState();

  const [serach_params, setSerachParams] = useState<SearchParams>({});
  const handleSearch = () => {
    const values = form.getFieldsValue();
    setFormValus(values);

    changeHistory({
      ...omit(values),
      pageNo: 1,
      pageSize: pagination.pageSize,
    });
  };

  const getList = async (params: SearchParams) => {
    try {
      setLoading(true);
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;
      const ret = await cpmService.retrieveDataDeliveryList({...omit(params, 'pageNo', 'pageSize'), pageSize, pageNo});

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
  
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    changeHistory({
      ...serach_params,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const crossTypesOptions = [
    {
      label: 'HIGH_LEVEL_INTER',
      value: 1,
    },
    {
      label: 'MIX_LEVEL_INTER',
      value: 2,
    },
    {
      label: 'LOW_LEVEL_INTER',
      value: 3,
    },
  ];
  const crossTagsOptions = [
    {
      label: '城区',
      value: 1,
    },
    {
      label: '多挂接点',
      value: 2,
    },
    {
      label: '包含掉头口道路',
      value: 3,
    },
    {
      label: '有红绿灯',
      value: 4,
    },
    {
      label: '有通行限制',
      value: 5,
    },
    {
      label: '有右转专用道路',
      value: 6,
    },
    {
      label: '多车道',
      value: 7,
    },
    {
      label: '5级路',
      value: 8,
    },
    {
      label: '有左转专用道路',
      value: 9,
    },
    {
      label: '腾讯覆盖',
      value: 10,
    },
    {
      label: 'AO覆盖',
      value: 11,
    },
    {
      label: 'AO高优覆盖',
      value: 12,
    },
  ];

  useEffect(() => {
    let params: SearchParams = {};

    query.forEach((value, key) => {
      if (
        [
          'routeTotalCountBegin',
          'routeTotalCountEnd',
          'routeSuccessPerBegin',
          'routeSuccessPerEnd',
          'pageNo',
          'pageSize',
        ].includes(key)
      ) {
        // @ts-ignore
        params[key] = value ? Number(value) : undefined;
      }
      
      if (['crossTypes', 'crossTags'].includes(key)) {
        var matches:any;
        let arr:any;
        // @ts-ignore
        if (value) {
          // @ts-ignore
          matches = value?.match(/\d+/g).filter(function (val) {
            return val !== '%2C';
          });
           arr = matches.map(Number);  
        }
        
        // @ts-ignore
        params[key] = value ? arr : undefined;
      } 


      if (['cityCodes'].includes(key)) {
        var matchesarr;
        // @ts-ignore
        if (value) {
          // @ts-ignore
          matchesarr = value?.match(/\d+/g).filter(function (val) {
            return val !== '%2C';
          });
        
        }
        
       // @ts-ignore
        params[key] = value ? matchesarr : undefined;
      }
      
    });

    params = removeEmptyValue(params);
    
    form.setFieldsValue({ params});

    setSerachParams(params);

    getList(params);
  }, [query.toString()]);

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            <Form.Item label="城市" name="cityCodes">
              <CitySelects style={{width: '200px'}}></CitySelects>
            </Form.Item>
            <Form.Item label="路口场景" name="crossTags">
              <Select
                mode="multiple"
                placeholder="请选择"
                options={crossTagsOptions}
                style={{width: '200px'}}
                allowClear
                optionLabelProp="label"
              ></Select>
            </Form.Item>
            <Form.Item label="路径数" name="routeTotalCountBegin" style={{margin: 0, padding: 0}}>
              <InputNumber placeholder="请输入" min={0} style={{width: '100px'}}></InputNumber>
            </Form.Item>
            <Form.Item style={{margin: 0, padding: 0}}>
              <span>-</span>
            </Form.Item>
            <Form.Item name="routeTotalCountEnd">
              <InputNumber placeholder="请输入" min={0} style={{width: '100px'}}></InputNumber>
            </Form.Item>
            <Form.Item label="建图完成占比" name="routeSuccessPerBegin" style={{margin: 0, padding: 0}}>
              <InputNumber placeholder="请选择" min={0} max={100} style={{width: '100px'}}></InputNumber>
            </Form.Item>
            <Form.Item style={{margin: 0, padding: 0}}>
              <span>%-</span>
            </Form.Item>
            <Form.Item name="routeSuccessPerEnd" style={{margin: 0, padding: 0}}>
              <InputNumber placeholder="请选择" min={0} max={100} style={{width: '100px'}}></InputNumber>
            </Form.Item>
            <Form.Item>
              <span>%</span>
            </Form.Item>
            <Form.Item label="道路等级" name="crossTypes">
              <Select
                mode="multiple"
                placeholder="请选择"
                options={crossTypesOptions}
                style={{width: '200px'}}
                allowClear
              ></Select>
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
                setFormValus(values);
                create_delivery_task.show();
              }}
            >
              创建送标任务
            </Button>
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
      <CreateDeliveryTask
        deliverySelect={formValue}
        state={create_delivery_task}
        visible={create_delivery_task.visible}
        onSuccess={() => {
          create_delivery_task.hide();
        }}
        onCancel={() => {
          create_delivery_task.hide();
        }}
      ></CreateDeliveryTask>
    </div>
  );
};
