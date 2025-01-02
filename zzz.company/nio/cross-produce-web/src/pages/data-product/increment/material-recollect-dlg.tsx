import {Button, DatePicker, Form, Input, Select, Space, Table, message, Modal} from 'antd';
import {useEffect, useState} from 'react';
import {cpmService} from '../../../services/cpw-service';
import {CollectMaterialQueryInList} from '../../../models/produce';

export const MaterialReCollectDlg = ({
  visible,
  onSuccess,
  onCancel,
}: {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [form] = Form.useForm();
  const [businessTypeList, setBusinessTypeList] = useState();

  const isDeprecatedOption = [
    {label: '是', value: true},
    {label: '否', value: false},
  ];

  const getBusinessTypeList = async () => {
    try {
      const businessTypeResult: any = await cpmService.getBusinessTypeList();

      setBusinessTypeList(
        businessTypeResult.data.map((item: any) => {
          return {
            label: item.name,
            value: item.value,
          };
        }),
      );
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };

  const handleCreate = () => {
    form
      .validateFields()
      .then(async (values) => {
        const res: any = await cpmService.reCreateCollectTask(form.getFieldsValue() as CollectMaterialQueryInList);
        onSuccess();
      })
      .catch((error) => {
        message.error(error + '');
        console.error(error);
      });
  };

  const handleCancel = () => {
    onCancel();
  };

  useEffect(() => {
    getBusinessTypeList();
  }, []);

  return (
    <Modal title="资料补采" open={visible} onOk={handleCreate} onCancel={handleCancel} width={800}>
      <Form form={form} labelCol={{span: 5}}>
        <Form.Item label="生产模式" name="businessType">
          <Select placeholder="请选择" style={{width: '200px'}} allowClear options={businessTypeList}></Select>
        </Form.Item>
        <Form.Item label="批次编号" name="batchIds">
          <Input.TextArea rows={5} placeholder="请输入"></Input.TextArea>
        </Form.Item>
        <Form.Item label="建图实体编号" name="crossIds">
          <Input.TextArea rows={5} placeholder="请输入"></Input.TextArea>
        </Form.Item>
        <Form.Item label="旧资料是否废弃" name="dropOldMaterial">
          <Select placeholder="请选择" style={{width: '200px'}} allowClear options={isDeprecatedOption}></Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
