import {Form, Cascader, Select, message} from 'antd';
import {throttle} from 'lodash';
import {createContext, useCallback, useEffect, useState} from 'react';
import {algoService} from '../../services/algo-service';
import {SelectOption} from '../../models/antd';
import {DefaultOptionType} from 'antd/es/cascader';
import {usePageFns} from '../../hooks';
//产线、产线模式、城市 子组件
export const AlgoInfoSelect = ({
  visible,
  useRule,
}: {
  visible: boolean;
  useRule: boolean;
}) => {

  const [form] = Form.useForm();
  const [algoNameOption, setAlgoNameOption] = useState<any>([]);
  const [algoVersionOption, setAlgoVersionOption] = useState<any>([]);
  const [algoTypeOption, setAlgoTypeOption] = useState<{label: string; value: number}[]>([]);

  const getAlgoType = async () => {
    try {
      const options = await algoService.queryAlgoTypeOptions();
      setAlgoTypeOption(options);
    } catch (error) {
      message.error(error + '');
    }
  };

  useEffect(() => {
    if(!visible){
      form.resetFields();
    }
  }, [visible])

  useEffect(() => {
    getAlgoType();
  }, []);

  const handleChangeAlgoType = async (e: any) => {
    const ret = await algoService.queryAlgoList({
      algType: form.getFieldValue('algType'),
      pageNo: 1,
      pageSize: 1000,
    });

    setAlgoNameOption(
      ret.data.map((item) => {
        return {
          label: item.algName,
          value: item.algName,
        };
      }),
    );
  };

  const handleChangeAlgo = async (e: any) => {
    try {
      const ret = await algoService.queryAlgoVersionList({
        algName: form.getFieldValue('algName'),
        algType: form.getFieldValue('algType'),
        pageNo: 1,
        pageSize: 1000,
      });

      if (ret.code != 0) {
        throw ret.message;
      }

      setAlgoVersionOption(
        ret.data.map((item) => {
          return {
            label: item.algVsn,
            value: item.algVsnId,
          };
        }),
      );
    } catch (error) {
      message.error(error + '');
    }
  };

  return (
    <>
      <Form.Item label="算法类型" rules={[{required: useRule}]} name="algType">
        <Select
          placeholder="请选择"
          style={{width: '200px'}}
          onChange={handleChangeAlgoType}
          allowClear
          options={algoTypeOption}
        ></Select>
      </Form.Item>
      <Form.Item label="算法名称" rules={[{required: useRule}]} name="algName">
        <Select placeholder="请选择" allowClear options={algoNameOption} onChange={handleChangeAlgo}></Select>
      </Form.Item>
      <Form.Item label="算法版本号" rules={[{required: useRule}]} name="algVsnId">
        <Select placeholder="请选择" allowClear options={algoVersionOption}></Select>
      </Form.Item>
    </>
  );
};
