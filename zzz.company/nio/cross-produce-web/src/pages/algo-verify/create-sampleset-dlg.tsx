import {Form, Input, Modal, message, Select} from 'antd';
import {useForm} from 'antd/es/form/Form';
import {algoService} from '../../services/algo-service';
import {useState, useEffect} from 'react';
import {UpdateBatchPayload} from '../../models';
import {EditState} from '../../hooks';

/**
 * 项目创建弹窗
 * @returns
 */
export const CreateSamplesetDlg = ({
  visible,
  state,
  onSuccess,
  onCancel,
}: {
  visible: boolean;
  state: EditState<
    Partial<{
      setId: number;
      algType: number;
      sampleList: string;
      setDesc: string;
      setName: string;
    }>
  >;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  const [algoTypeOption, setAlgoTypeOption] = useState<{label: string; value: number}[]>([]);

  //获取默认值
  const values = state.getItem();

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

  useEffect(() => {
    if (visible) {
      //设置父组件传来的默认值
      if (values) {
        Object.entries(values).forEach(([key, value]) => {
          form.setFieldValue(key, value);
        });
      }

      //存在setId，则说明是添加样本
      if (values?.setId) {
        algoService
          .querySampleListUseSetId(values.setId)
          .then((ret: any) => {
            form.setFieldValue('sampleList', ret.data?.sampleList);
          })
          .catch((error) => {
            message.error('样本列表获取失败: ' + error);
          });
      }
    } else {
      form.resetFields();
    }
  }, [values]);

  const handleCreate = () => {
    form
      .validateFields()
      .then(async (values) => {
        setLoading(true);
        try {
          await algoService.createSampleset({
            setId: values?.setId,
            sampleList: values.sampleList.trim(),
            setDesc: values.setDesc.trim(),
            algType: parseInt(values.algType),
            setName: values.setName.trim(),
          });
          message.success('创建成功');
          onSuccess();
        } catch (error: any) {
          console.error(error);
          message.error(error.message);
        } finally {
          setLoading(false);
        }

        form.resetFields();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal title="创建评测集" onOk={handleCreate} onCancel={handleCancel} open={visible} okButtonProps={{loading}}>
      <Form form={form} labelCol={{span: 5}}>
        <Form.Item label="算法类型" rules={[{required: true}]} name="algType">
          <Select placeholder="请选择" style={{width: '200px'}} allowClear options={algoTypeOption}></Select>
        </Form.Item>
        <Form.Item label="评测集名称" rules={[{required: true}]} name="setName">
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item label="样本list" rules={[{required: true}]} name="sampleList">
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item label="评测集描述" rules={[{required: true}]} name="setDesc">
          <Input.TextArea placeholder="请输入" rows={5}></Input.TextArea>
        </Form.Item>
      </Form>
    </Modal>
  );
};
