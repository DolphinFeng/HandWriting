import {Form, Input, Modal, message, Select} from 'antd';
import {useForm} from 'antd/es/form/Form';
import {cpmService} from '../../services/cpw-service';
import {useState} from 'react';
import {BusinessType} from '../business-type';

/**
 * 项目创建弹窗
 * @returns
 */
export const CreateModal = ({
  visible,
  onSuccess,
  onCancel,
}: {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm<{projectName: string; projectDesc: string; operator?: string}>();

  const handleCreate = () => {
    form
      .validateFields()
      .then(async (values) => {
        setLoading(true);
        try {
          await cpmService.createProject({
            projectName: values.projectName.trim(),
            projectDesc: values.projectDesc.trim(),
            operator: values.operator?.trim(),
          });
          message.success('创建成功');
          onSuccess();
        } catch (error: any) {
          console.error(error);
          message.error(error.message);
        } finally {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal title="创建项目" onOk={handleCreate} onCancel={handleCancel} open={visible} okButtonProps={{loading}}>
      <Form form={form} labelCol={{span: 5}}>
        <BusinessType businessModel={false} city={false} required={true}></BusinessType>
        <Form.Item label="项目名称" rules={[{required: true, max: 64}]} name="projectName">
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item label="项目描述" rules={[{required: true}]} name="projectDesc">
          <Input.TextArea placeholder="请输入" rows={5}></Input.TextArea>
        </Form.Item>
        <Form.Item label="操作人" rules={[{required: true}]} name="operator">
          <Input placeholder="请输入"></Input>
        </Form.Item>
      </Form>
    </Modal>
  );
};
