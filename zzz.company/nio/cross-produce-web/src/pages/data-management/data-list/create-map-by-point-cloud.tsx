import {Form, Input, Modal, message} from 'antd';
import {useForm} from 'antd/es/form/Form';
import {cpmService} from '../../../services/cpw-service';
import {useEffect} from 'react';
import {CreateMapByPointCloudPayload} from '../../../models';
import {EditState} from '../../../hooks';

/**
 * 点云建图
 */
export const CreateMapByPointCloud = ({
  visible,
  onSuccess,
  onCancel,
  state,
}: {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  state: EditState<Partial<CreateMapByPointCloudPayload>>;
}) => {
  const [form] = useForm();

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        await cpmService.createMapByPointCloud(values);
        message.success('操作成功');
        onSuccess();
      } catch (error: any) {
        console.error(error);
        message.error(error.message);
      }
    });
  };

  useEffect(() => {
    if (visible) {
      const values = state.getItem();
      form.setFieldsValue(values);
    } else {
      form.resetFields();
    }
  }, [visible]);

  return (
    <Modal title="点云建图" open={visible} onCancel={onCancel} onOk={handleOk}>
      <Form form={form} labelCol={{span: 6}}>
        <Form.Item label="Project ID" name="projectId">
          <Input disabled></Input>
        </Form.Item>
        <Form.Item label="Batch ID" name="batchId">
          <Input disabled></Input>
        </Form.Item>
        <Form.Item label="Cross ID" name="crossId">
          <Input disabled></Input>
        </Form.Item>
        <Form.Item label="Cross ID" name="materialIds">
          <Input disabled></Input>
        </Form.Item>
        <Form.Item label="任务名称" name="taskName">
          <Input></Input>
        </Form.Item>
      </Form>
    </Modal>
  );
};
