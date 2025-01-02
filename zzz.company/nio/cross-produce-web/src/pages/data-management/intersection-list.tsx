import {Button, Form, Input, Space, Table, message, Select} from 'antd';
import {DefaultPagination} from '../../constants';
import {useEffect, useState} from 'react';
import {usePageFns, useQuery} from '../../hooks';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {removeEmptyValue} from '../../utils';
import {omit} from 'lodash';
import {TASK_TYPE} from '../../models';
import {CrossInList, CrossListQuery, SITE_TAG_OPTIONS, PV_RANK_OPTIONS, PV_RANK_DESC, SITE_TAG_DESC, SITE_TAG} from '../../models/cross';
import {mssService} from '../../services/mss-service';
import {getAreaMap} from '../../constants/administrative-divisions/areas';
import {AreaSearchSelect} from './intersection-list/area-search-select';
import {CitySearchSelect} from './intersection-list/city-search-select';
import {download} from '../../utils/blob';

const AreaMap = getAreaMap();

type SearchParams = CrossListQuery;

/**
 * 路口列表
 */
export const IntersectionList = ({mappingTaskType}: {mappingTaskType?: TASK_TYPE}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [list, setList] = useState<CrossInList[]>([]); // 项目列表
  const [pagination, setPagination] = useState<TablePaginationConfig>(DefaultPagination);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();

  const [serach_params, setSerachParams] = useState<SearchParams>({});

  const [select_city, setSelectCity] = useState<number | undefined>(undefined);

  const handleSearch = () => {
    const values = form.getFieldsValue();

    changeHistory({
      ...omit(values, ['createTime']),
      pageNo: 1,
      pageSize: pagination.pageSize,
    });
  };

  const getList = async (params: SearchParams) => {
    try {
      const pageSize = params.pageSize ?? DefaultPagination.pageSize;
      const pageNo = params.pageNo ?? DefaultPagination.current;

      setLoading(true);

      let adminCodes: string[] | undefined = getArrayParam(params.adminCodes) as string[];
      let pvRanks: number[] | undefined = getArrayParam(params.pvRanks) as number[];
      let siteTags: string[] | undefined = getArrayParam(params.siteTags) as string[];

      const ret = await mssService.retrieveIntersectionList({
        ...params,
        adminCodes,
        pvRanks,
        siteTags,
        pageNo,
        pageSize,
      });

      setList(ret.data.result);
      setPagination({
        ...pagination,
        total: ret.data.total,
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

  const columns: ColumnsType<CrossInList> = [
    {
      title: '路口编号',
      dataIndex: 'sitePid',
      render: (text, record) => {
        return <span>{text}</span>;
      },
    },
    {
      title: '图幅号',
      dataIndex: 'tile',
      render: (text, record) => {
        return <span>{text}</span>;
      },
    },
    {
      title: '城市',
      dataIndex: 'adminCode',
      render: (text) => {
        return AreaMap[text]?.name;
      },
    },
    {
      title: '热度',
      dataIndex: 'pvRank',
      render(value, record, index) {
        const {pvRank} = record;
        return <span>{pvRank ? PV_RANK_DESC[pvRank] : '--'}</span>;
      },
    },
    {
      title: '场景标签',
      dataIndex: 'tags',
      render(value, record, index) {
        const {tags} = record;

        let tagList = tags.split(',');
        let tagDesc = '';

        for(let i = 0; i < tagList.length; i ++){
          let tag = tagList[i] as SITE_TAG;
          tagDesc += SITE_TAG_DESC[tag] + '，';
        }

        return <span>{tags ? tagDesc.slice(0, -1) : '--'}</span>;
      },
    },
    {
      title: '操作',
      dataIndex: 'detail',
      render: (text, record) => {
        return (
          <>
            <Button type="link">路口详情</Button>
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
    let adminCodes: string[] | undefined = getArrayParam(serach_params.adminCodes) as string[];
    let pvRanks: number[] | undefined = getArrayParam(serach_params.pvRanks) as number[];
    let siteTags: string[] | undefined = getArrayParam(serach_params.siteTags) as string[];

    try {
      setDownloading(true);

      const ret = await mssService.downloadIntersectionData({
        ...omit(serach_params, ['pageNo', 'pageSize']),
        adminCodes,
        pvRanks,
        siteTags,
      });

      console.log('ret', ret);

      download({
        content: ret,
        filename: `路口数据-${Date.now()}.txt`,
      });
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleValueChange = (values: Partial<CrossListQuery>) => {
    if (values.cityCode) {
      setSelectCity(values.cityCode);
      form.setFieldValue('adminCodes', undefined);
    }
  };

  useEffect(() => {
    let params: SearchParams = {};

    query.forEach((value, key) => {
      if (['pageNo', 'pageSize', 'projectId'].includes(key)) {
        // @ts-ignore
        params[key] = value ? Number(value) : undefined;
      } else {
        // @ts-ignore
        params[key] = value;
      }
    });

    params = removeEmptyValue(params);

    form.setFieldsValue({
      ...params,
    });

    setSerachParams(params);

    getList(params);
  }, [query.toString()]);

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline" onValuesChange={handleValueChange}>
            <CitySearchSelect></CitySearchSelect>
            <AreaSearchSelect city_code={select_city?.toString()}></AreaSearchSelect>
            <Form.Item label="图幅号" name="tiles">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="路口编号" name="sitePid">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="热度等级" name="pvRanks">
              <Select
                placeholder="请选择"
                options={PV_RANK_OPTIONS}
                style={{width: '200px'}}
                allowClear
              ></Select>
            </Form.Item>
            <Form.Item label="场景标签" name="siteTags">
              <Select
                placeholder="请选择"
                options={SITE_TAG_OPTIONS}
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
            <Button type="primary" onClick={handleDownload} loading={downloading}>
              下载
            </Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="sitePid"
        className="page-table"
        columns={columns}
        dataSource={list}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      ></Table>
    </div>
  );
};

const getArrayParam = (param?: string | string[] | number | number[]) => {
  if (param) {
    if (typeof param === 'string') {
      return param.split(',');
    }

    if (typeof param === 'number') {
      return [param];
    }

    if (Array.isArray(param)) {
      return param;
    }
  }

  return undefined;
};
