import {Form, Input, Modal, message, Select} from 'antd';
import {useForm} from 'antd/es/form/Form';
import {algoService} from '../../services/algo-service';
import {useState, useEffect} from 'react';

/**
 * 项目创建弹窗
 * @returns
 */
export const CreateAlgoDlg = ({
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

  const [bizTypeOption, setBizTypeOption] = useState<
    {value: number; label: string; algoTypeOption: {label: string; value: number}[]}[]
  >([]);
  const [algoTypeOption, setAlgoTypeOption] = useState<{label: string; value: number}[]>([]);

  const getBizAlgoType = async () => {
    try {
      const ret = await algoService.queryBizAndAlgoType();
      let bizTypeOption: any = ret.data.map((item) => {
        let algoTypeOption = item.bizTypeAlgTypeList.map((subItem) => {
          return {
            label: subItem.algTypeDesc,
            value: subItem.algTypeValue,
          };
        });

        return {
          label: item.bizTypeDesc,
          value: item.bizTypeValue,
          algoTypeOption: algoTypeOption,
        };
      });

      setBizTypeOption(bizTypeOption);
    } catch (error) {
      message.error(error + '');
    }
  };

  useEffect(() => {
    getBizAlgoType();
  }, []);

  const handleCreate = () => {
    form
      .validateFields()
      .then(async (values) => {
        setLoading(true);
        try {
          await algoService.createAlgo({
            bizType: values.bizType,
            algName: values.algName.trim(),
            algType: values.algType,
            evalWorkflow: values.evalWorkflow.trim(),
            prodWorkflow: values.prodWorkflow.trim(),
            algDesc: values.algDesc.trim(),
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

  const handleChangeBisType = (e: any) => {
    for (let item of bizTypeOption) {
      if (item.value == e) {
        setAlgoTypeOption(item.algoTypeOption);
        break;
      }
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal title="创建算法" onOk={handleCreate} onCancel={handleCancel} open={visible} okButtonProps={{loading}}>
      <Form form={form} labelCol={{span: 5}}>
        <Form.Item label="算法名称" rules={[{required: true, max: 64}]} name="algName">
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item label="生产模式" rules={[{required: true}]} name="bizType">
          <Select
            placeholder="请选择"
            style={{width: '200px'}}
            allowClear
            options={bizTypeOption}
            onChange={handleChangeBisType}
          ></Select>
        </Form.Item>
        <Form.Item label="算法类型" rules={[{required: true}]} name="algType">
          <Select placeholder="请选择" style={{width: '200px'}} allowClear options={algoTypeOption}></Select>
        </Form.Item>
        <Form.Item label="评测workflow" rules={[{required: true}]} name="evalWorkflow">
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item label="生产workflow" rules={[{required: true}]} name="prodWorkflow">
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item label="算法描述" rules={[{required: true}]} name="algDesc">
          <Input.TextArea placeholder="请输入" rows={5}></Input.TextArea>
        </Form.Item>
      </Form>
    </Modal>
  );
};
