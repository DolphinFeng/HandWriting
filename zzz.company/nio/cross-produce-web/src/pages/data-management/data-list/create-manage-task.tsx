import {Form, Input, Modal, message} from 'antd';
import {useForm} from 'antd/es/form/Form';
import {cpmService} from '../../../services/cpw-service';
import {CreateMapByModelPayload, TASK_TYPE} from '../../../models';
import {useEffect, useMemo} from 'react';
import {EditState} from '../../../hooks';

/**
 * 创建管理任务
 */
export const CreateManageTask = ({
  visible,
  onSuccess,
  onCancel,
  task_type,
  state,
}: {
  task_type?: TASK_TYPE;
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  state: EditState<Partial<CreateMapByModelPayload>>;
}) => {
  const title = useMemo(() => {
    if (task_type === TASK_TYPE.PERCEPTION) {
      return '创建模型建图任务';
    }

    if (task_type === TASK_TYPE.ANNOTATION) {
      return '创建推理任务';
    }

    return '无对应创建任务';
  }, [task_type]);
  const [form] = useForm();

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        await cpmService.createMapByModel(values);
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
    <Modal title={title} open={visible} onCancel={onCancel} onOk={handleOk}>
      <Form form={form} labelCol={{span: 5}}>
        <Form.Item label="任务ID" name="mappingResultId" rules={[{required: true}]}>
          <Input disabled></Input>
        </Form.Item>
        <Form.Item label="任务名称" name="taskName" rules={[{required: true}]}>
          <Input></Input>
        </Form.Item>
        <Form.Item label="任务描述" name="taskDesc" rules={[{required: true}]}>
          <Input.TextArea rows={5}></Input.TextArea>
        </Form.Item>
      </Form>
    </Modal>
  );
};
