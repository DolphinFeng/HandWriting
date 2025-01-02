import {Button, Form, Space, Table, message} from 'antd';
import {useEffect, useState} from 'react';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {cpmService} from '../../services/cpw-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {convertMomentTupleToTimestampTuple, removeEmptyValue} from '../../utils';
import {omit} from 'lodash';
import {ProjectProgressInList, ProjectProgressListQuery} from '../../models';
import {ProjectSearchSelect} from '../project/project-search-select';
import {useNavigate} from 'react-router-dom';

type SearchParams = ProjectProgressListQuery;

/**
 * 任务列表
 */
export const ProjectProgressList = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ProjectProgressInList[]>([]); // 项目列表
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();
  const navigate = useNavigate();

  const create_state = useEditState();
  const [serach_params, setSerachParams] = useState<SearchParams>({});

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const createTime = convertMomentTupleToTimestampTuple(values.createTime);

    changeHistory({
      ...omit(values, ['createTime']),
      startCreateTime: createTime[0],
      endCreateTime: createTime[1],
    });
  };

  const getList = async (params: SearchParams) => {
    if (!params.projectId) return message.warning('请选择项目');

    try {
      setLoading(true);
      const ret = await cpmService.retrieveProjectProgressList({
        ...params,
      });

      setList(ret.data);
    } catch (error: any) {
      console.error(error);
      message.error(error.message);

      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<ProjectProgressInList> = [
    {
      title: '数据生产环节',
      dataIndex: 'processName',
    },
    {
      title: '路口数量',
      dataIndex: 'crossNum',
    },
    {
      title: '任务数',
      dataIndex: 'taskNum',
    },
    {
      title: '成功任务数',
      dataIndex: 'successTaskNum',
    },
    {
      title: '交付路口数',
      dataIndex: 'successCrossNum',
    },
    {
      title: '交付完整路口数',
      dataIndex: 'successEntireCrossNum',
    },
    {
      title: '交付任务比例',
      dataIndex: 'successTaskRate',
      render:(text, record) => {
        return (text * 100).toFixed(2) + '%';
      }
    },
    {
      title: '交付路口比例',
      dataIndex: 'successCrossRate',
      render:(text, record) => {
        return (text * 100).toFixed(2) + '%';
      }
    },
    {
      title: '交付完整路口比例',
      dataIndex: 'successEntireCrossRate',
      render:(text, record) => {
        return (text * 100).toFixed(2) + '%';
      }
    },
    {
      title: '操作',
      dataIndex: 'processName',
      render: (text, record) => {

        let id = '';
        query.forEach((value, key) => {
          if (['projectId'].includes(key)) {
            // @ts-ignore
            id = value ? Number(value) : '';
          }
        });

        return (
          <>
            <Button type="link" 
              onClick={() => {
                navigate('/data-monitor/charts?type=project&id=' + id + '&desc=' + text + '&processKey=' + record.processKey);
              }}>详情
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
      if (['startCreateTime', 'endCreateTime', 'pageNo', 'pageSize', 'projectId'].includes(key)) {
        // @ts-ignore
        params[key] = value ? Number(value) : undefined;
      } else {
        // @ts-ignore
        params[key] = value;
      }
    });

    params = removeEmptyValue(params);

    form.setFieldsValue({
      ...omit(params, ['startCreateTime', 'endCreateTime']),
    });

    setSerachParams(params);

    console.log('params', params);

    getList(params);
  }, [query.toString()]);

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            <ProjectSearchSelect></ProjectSearchSelect>
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
                create_state.show();
              }}
            >
              创建项目
            </Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="processName"
        className="page-table"
        columns={columns}
        dataSource={list}
        pagination={false}
        loading={loading}
        onChange={handleTableChange}
      ></Table>
    </div>
  );
};
