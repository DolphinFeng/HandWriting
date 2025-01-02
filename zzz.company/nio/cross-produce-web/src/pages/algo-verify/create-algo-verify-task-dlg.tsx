import {Form, Input, Modal, message, Select} from 'antd';
import {useForm} from 'antd/es/form/Form';
import {algoService} from '../../services/algo-service';
import {useState, useEffect} from 'react';
import {AlgoInfoSelect} from './algo-info'

/**
 * 项目创建弹窗
 * @returns
 */
export const CreateAlgoTaskDlg = ({
  visible,
  onSuccess,
  onCancel,
}: {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm();
  
  useEffect(() => {
    if(!visible){
      form.resetFields();
    }
  }, [visible])

  const handleCreate = () => {
    form
      .validateFields()
      .then(async (values) => {
        setLoading(true);
        try {
          await algoService.createAlgoVerifyTask({
            algVsnId: values.algVsnId,
            setId: values.setId.trim(),
            taskDesc: values.taskDesc.trim(),
            taskName: values.taskName.trim(),
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
    <Modal title="创建评测任务" onOk={handleCreate} onCancel={handleCancel} open={visible} okButtonProps={{loading}}>
      <Form form={form} labelCol={{span: 5}}>
        <Form.Item label="任务名称" rules={[{required: true, max: 64}]} name="taskName">
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <AlgoInfoSelect visible={visible} useRule={true}></AlgoInfoSelect>
        <Form.Item label="评测集" rules={[{required: true}]} name="setId">
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item label="任务描述" rules={[{required: true}]} name="taskDesc">
          <Input.TextArea placeholder="请输入" rows={5}></Input.TextArea>
        </Form.Item>
      </Form>
    </Modal>
  );
};
