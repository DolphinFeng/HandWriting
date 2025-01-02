import {Form, Input, Modal, Select, message} from 'antd';
import {useForm} from 'antd/es/form/Form';
import {cpmService} from '../../../services/cpw-service';
import {useCallback, useEffect, useState} from 'react';
import {EditState} from '../../../hooks';

/**
 * 创建送标任务
 */
export const CreateDeliveryTask = ({
  visible,
  onSuccess,
  onCancel,
  state,
  deliverySelect,
}: {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  state: EditState;
  deliverySelect: any;
}) => {
  const [form] = useForm();
  const [options, setOptions] = useState([]);
  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        let createValue = {...deliverySelect, ...values};
        await cpmService.createBatchAnnotationTask(createValue);
        message.success('创建成功');

        console.log(deliverySelect);
        onSuccess();
      } catch (error: any) {
        console.error(error);
        message.error(error.message);
      }
    });
  };

  const sourceUuidList = async () => {
    try {
      let res: any = await cpmService.streamSourceUuidList();
      setOptions(
        res.data.map((item: any) => ({
          label: item,
          value: item,
        })),
      );
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    }
  };
  useEffect(() => {
    if (visible) {
      sourceUuidList();
    } else {
      form.resetFields();
    }
  }, [visible]);
  return (
    <Modal title="创建送标任务" open={visible} onCancel={onCancel} onOk={handleOk}>
      <Form form={form} labelCol={{span: 6}}>
        <Form.Item label="送标数据集" name="labelingTaskId">
          <Select showSearch options={options} placeholder="请选择" allowClear filterOption={false}></Select>
        </Form.Item>
        <Form.Item label="描述" name="taskDesc">
          <Input.TextArea rows={4}></Input.TextArea>
        </Form.Item>
      </Form>
    </Modal>
  );
};
