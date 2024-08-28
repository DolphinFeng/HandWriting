import {
  Tabs,
  Form,
  Button,
  RangePicker,
  Select,
  Loading,
  message
} from '@ss/mtd-react';
import { debounce } from 'lodash';
import React, {
  useMemo,
  useRef,
  useCallback,
  useState,
  useEffect
} from 'react';
import { endOfDay, addDays, startOfDay } from 'date-fns';
import { useRequest } from '@/services/useRequest';
import { EXPORT_RECORDS_QUERY } from '@/services/export';
import { getFlowList } from '@/services/bpmn';

import Styles from './index.less';
import { IApprovalInfo } from '../index.type';
import { BillStateText, BillState } from './index.type';
import ExportList from './list';

const { TabPane } = Tabs;
const { Option } = Select;

export default function Export() {
  const { loading: queryLoading, fetchData } = useRequest<number>(
    EXPORT_RECORDS_QUERY,
    'post'
  );

  const [activeKey, setActiveKey] = useState<'export-query' | 'export-list'>(
    'export-query'
  );

  const [result, setResult] = useState<IApprovalInfo[]>([]);
  const [disabledAction, setDisabledAction] = useState<boolean>(true);
  const [refreshToken, setRefreshToken] = useState<number>(0);
  const formRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [defaultResult, setDefaultResult] = useState<IApprovalInfo[]>([]);

  const WorkFlowListParams = {
    fuzzy: '',
    pageSize: 100,
    pageNo: 1
  };

  const handleTabChange = useCallback((key) => {
    setActiveKey(() => {
      return key;
    });

    setRefreshToken(() => {
      return Math.random();
    });
  }, []);

  const handleFieldValueChange = useCallback(() => {
    const isValid = formRef.current.validateFields();
    if (!isValid) {
      setDisabledAction(() => {
        return true;
      });
      return;
    }

    setDisabledAction(() => {
      return false;
    });
  }, [disabledAction]);

  const handleRetry = useCallback(
    (row) => {
      setActiveKey(() => {
        return 'export-query';
      });

      const { pdId, pdName, billSubmitFrom, billSubmitTo, billState } = row;

      formRef.current.setFieldsValue({
        processInfo: { label: pdName, value: pdId },
        billState,
        rangeDate: [new Date(billSubmitFrom), new Date(billSubmitTo)]
      });

      handleFieldValueChange();
    },
    [setActiveKey, handleFieldValueChange]
  );

  const handleFilter = debounce((filter) => {
    if (!filter) {
      setResult(defaultResult);
      return;
    }
    setListLoading(true);
    getFlowList({ ...WorkFlowListParams, fuzzy: filter }).then((data) => {
      setResult(data);
      setListLoading(false);
    });
  }, 300);

  useEffect(() => {
    setLoading(true);
    getFlowList(WorkFlowListParams).then((data) => {
      setResult(data);
      setDefaultResult(data);
      setLoading(false);
    });
  }, []);

  const exportListMemo = useMemo(() => {
    return (
      <ExportList handleRetry={handleRetry} key={refreshToken}></ExportList>
    );
  }, [handleRetry, refreshToken]);

  const handleRenderLabel = (value) => {
    return value?.label;
  };

  const flowListMemo = useMemo(() => {
    return (
      <Select
        onFilter={handleFilter}
        toFormItem
        renderInputLabel={handleRenderLabel}
        loading={listLoading}
        loadingMessage={() => <Loading />}
        notFoundMessage='无数据'
      >
        {result?.map((item) => {
          return (
            <Option key={item.id} value={item.id}>
              {item.name}
            </Option>
          );
        })}
      </Select>
    );
  }, [result, listLoading, defaultResult, loading]);

  const billStateMemo = useMemo(() => {
    return (
      <Select toFormItem onlyKeyValue>
        {Object.keys(BillStateText).map((key) => {
          return (
            <Option key={key} value={key}>
              {BillStateText[key]}
            </Option>
          );
        })}
      </Select>
    );
  }, []);

  const handleExport = useCallback(async () => {
    const isValid = formRef.current.validateFields();
    if (!isValid) {
      return;
    }

    const {
      processInfo,
      billState,
      rangeDate = []
    } = formRef.current.getFieldsValue();
    const payload = {
      pdId: processInfo.value,
      billState,
      from: rangeDate[0].getTime(),
      to: rangeDate[1].getTime()
    };

    try {
      const exportCount = await fetchData(payload);

      if (typeof exportCount === 'undefined' || exportCount === null) {
        return;
      }

      if (exportCount <= 0) {
        message.error({
          message: '查询无结果，请修改查询条件'
        });
        return;
      }

      setActiveKey(() => {
        return 'export-list';
      });

      setRefreshToken(() => {
        return Math.random();
      });
    } catch (e) {
      message.error({
        message: '查询失败，请稍后重试'
      });
    }
  }, [setActiveKey, fetchData]);

  const endOfToday = endOfDay(new Date());
  const startOfToday = startOfDay(new Date());
  const last30Days = addDays(startOfToday, -30);

  return (
    <Loading loading={loading}>
      <div className={Styles['export-container']}>
        <Tabs
          onChange={handleTabChange}
          activeKey={activeKey}
          defaultActiveKey='export-query'
          className={Styles['export-select']}
        >
          <TabPane label='数据查询' key='export-query'>
            <Form
              style={{ maxWidth: '450px' }}
              ref={formRef}
              defaultFieldsValue={{
                billState: BillState.ALL,
                rangeDate: [last30Days, endOfToday]
              }}
              onFieldValueChange={handleFieldValueChange}
            >
              <Form.Item
                label='流程名称'
                formItemKey='processInfo'
                labelWidth='100px'
                rules={[{ required: true, message: '流程名称必选' }]}
              >
                {flowListMemo}
              </Form.Item>
              <Form.Item
                label='单据状态'
                formItemKey='billState'
                labelWidth='100px'
                rules={[{ required: true, message: '单据状态必选' }]}
              >
                {billStateMemo}
              </Form.Item>
              <Form.Item
                label='单据提交时间'
                formItemKey='rangeDate'
                labelWidth='100px'
                rules={[
                  {
                    required: true,
                    message: '单据提交时间必选'
                  }
                ]}
              >
                <RangePicker
                  toFormItem
                  single
                  rangeMaxDateable
                  placeholder={['开始日期', '结束日期']}
                  className='date-render-double'
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type='primary'
                  onClick={handleExport}
                  loading={queryLoading}
                  disabled={disabledAction}
                >
                  查询并导出
                </Button>
              </Form.Item>
            </Form>
            <div>
              <p>
                <b>说明：</b>
              </p>
              <p>1. 导出的数据文件会保留48小时，请在保留期限内及时下载。</p>
              <p>
                2.
                单个工作表导出的数据行数不超过50000行，如导出后发现超过总行数，请修改查询条件并重新导出。
              </p>
              <p>3. 导出的表单字段，会按这条流程最新的表单字段设计导出。</p>
            </div>
          </TabPane>

          <TabPane label='导出记录' key='export-list'>
            {exportListMemo}
          </TabPane>
        </Tabs>
      </div>
    </Loading>
  );
}
