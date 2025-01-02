import {Button, DatePicker, Form, Input, Select, Space, Table, message} from 'antd';
import {DefaultPagination} from '../../constants';
import {useEffect, useState} from 'react';
import {CreateAlgoDlg} from './create-algo-dlg';
import {useEditState, usePageFns, useQuery} from '../../hooks';
import {algoService} from '../../services/algo-service';
import {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import {
  convertMomentTupleToTimestampTuple,
  convertTimestampTupleToDayTuple,
  getQueryOffset,
  humanizeTime,
  removeEmptyValue,
} from '../../utils';
import {omit} from 'lodash';
import {components} from '../../models/openapi-alg';

type SearchParams = components['schemas']['EvalMetricSumQuery'];
type MetricSumTable = components['schemas']['MetricSumTable'];

export const EvaStatistic = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const query = useQuery<SearchParams>();
  const {changeHistory} = usePageFns();
  const create_state = useEditState();

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const createTime = convertMomentTupleToTimestampTuple(values.createTime);

    changeHistory({
      ...omit(values, ['createTime']),
      startCreateTime: createTime[0],
      endCreateTime: createTime[1],
      pageNo: 1,
      pageSize: 20,
    });
  };

  const handleCloseCreateModel = () => {
    create_state.hide();
  };

  const [algoTypeOption, setAlgoTypeOption] = useState<{label: string; value: number}[]>([]);
  const [setOption, setSetOption] = useState<any>([]); //评测集
  const [evaTaskOption, setEvaTaskOption] = useState<any>([]);
  const [tables, setTables] = useState<any>([]);

  const getAlgoType = async () => {
    try {
      const options = await algoService.queryAlgoTypeOptions();
      setAlgoTypeOption(options);
    } catch (error) {
      message.error(error + '');
    }
  };

  useEffect(() => {
    getAlgoType();
  }, []);

  const handleChangeAlgoType = async (e: any) => {
    try {
      if (e) {
        const ret = await algoService.querySamplesetList({
          algType: form.getFieldValue('algType'),
          pageNo: 1,
          pageSize: 1000,
        });

        setSetOption(
          ret.data.map((item) => {
            return {
              label: item.setDesc,
              value: item.setId,
            };
          }),
        );
      } else {
        setSetOption([]);
      }

      form.setFieldValue('setId', undefined);
      form.setFieldValue('taskId', []);

      setEvaTaskOption([]);
    } catch (error) {
      message.error(error + '');
    }
  };

  const handleChangeSet = async (e: any) => {
    try {
      if (e) {
        const ret = await algoService.queryAlgoVerifyTaskList({
          algType: form.getFieldValue('algType'),
          setId: form.getFieldValue('setId'),
          pageNo: 1,
          pageSize: 1000,
        });

        setEvaTaskOption(
          ret.data.map((item) => {
            return {
              label: item.taskDesc,
              value: item.taskId,
            };
          }),
        );
      } else {
        setEvaTaskOption([]);
      }

      form.setFieldValue('taskId', []);
    } catch (error) {
      message.error(error + '');
    }
  };

  const getList = async (params: SearchParams) => {
    let setId = form.getFieldValue('setId');
    if (!setId) {
      return;
    }

    try {
      setLoading(true);
      const ret = await algoService.queryEvaMetric({
        setId: setId,
        taskIdList: form.getFieldValue('taskId')?.length != 0 ? form.getFieldValue('taskId') : undefined,
        dimName1: form.getFieldValue('dimName1'),
        dimName2: form.getFieldValue('dimName2'),
      });

      let tables = [];
      for (let item of ret.data) {
        let columns: any = [];
        let list = [];
        if (item.tableData && item.tableData.length > 0) {
          columns = item.tableData[0].map((subItem, index) => {
            return {
              title: subItem,
              dataIndex: 'item' + index,
              height: 400,
            };
          });

          columns.push({
            title: '序号',
            dataIndex: 'index',
            width: 400,
          });

          for (let i = 1; i < item.tableData.length; i++) {
            let record: any = {};
            for (let j = 0; j < item.tableData[i].length; j++) {
              record['item' + j] = item.tableData[i][j];
            }

            record['index'] = i;
            list.push(record);
          }
        }

        tables.push({
          title: item.tableName,
          columns: columns,
          list: list,
        });
      }

      setTables(tables);
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const queryChanged = async () => {
    let params: any = {};
    query.forEach((value, key) => {
      if (['startTime', 'endTime', 'pageNo', 'pageSize', 'setId', 'algType'].includes(key)) {
        // @ts-ignore
        params[key] = value ? Number(value) : undefined;
      } else if ('taskId' == key) {
        //taskId 是多选，解析为数组
        let p = value.split(',');
        params[key] = p.map((item) => {
          return parseInt(item);
        });
      } else {
        // @ts-ignore
        params[key] = value;
      }
    });

    params = removeEmptyValue(params);
    const createTime = convertTimestampTupleToDayTuple([params.startCreateTime, params.endCreateTime]);

    if (setOption.length == 0) {
      await handleChangeAlgoType(1);
      await handleChangeSet(1);
    }

    form.setFieldsValue({
      ...omit(params, ['startCreateTime', 'endCreateTime']),
      createTime: createTime,
    });

    getList(params);
  };

  useEffect(() => {
    queryChanged();
  }, [query.toString()]);

  return (
    <div>
      <div className="search-area">
        <div className="search-form">
          <Form form={form} layout="inline">
            <Form.Item label="算法类型" style={{minWidth: 100}} name="algType">
              <Select
                placeholder="请选择"
                style={{width: '200px'}}
                onChange={handleChangeAlgoType}
                allowClear
                options={algoTypeOption}
              ></Select>
            </Form.Item>
            <Form.Item label="评测集" name="setId">
              <Select placeholder="请选择" allowClear options={setOption} onChange={handleChangeSet}></Select>
            </Form.Item>
            <Form.Item label="评测任务" name="taskId">
              <Select
                placeholder="请选择"
                allowClear
                options={evaTaskOption}
                mode="multiple"
                style={{minWidth: 100}}
              ></Select>
            </Form.Item>
            <Form.Item label="评测类型" name="dimName1">
              <Input placeholder="请输入" allowClear></Input>
            </Form.Item>
            <Form.Item label="要素类型" name="dimName2">
              <Input placeholder="请输入" allowClear></Input>
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
                create_state.show();
                handleSearch();
              }}
            >
              创建算法
            </Button>
          </Space>
        </div>
      </div>

      <div style={{display: 'flex'}}>
        {tables.map((item: any) => (
          <>
            <div style={{width: '100%'}}>
              <div style={{marginTop: '40px'}}>{item.title}</div>
              <Table
                rowKey="index"
                className="page-table"
                columns={item.columns}
                dataSource={item.list}
                loading={loading}
                scroll={{x: '100%'}}
                pagination={false}
              ></Table>
            </div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;</div>
          </>
        ))}
      </div>

      <CreateAlgoDlg
        visible={create_state.visible}
        onSuccess={() => {
          handleCloseCreateModel();
          handleSearch();
        }}
        onCancel={() => {
          handleCloseCreateModel();
        }}
      ></CreateAlgoDlg>
    </div>
  );
};
