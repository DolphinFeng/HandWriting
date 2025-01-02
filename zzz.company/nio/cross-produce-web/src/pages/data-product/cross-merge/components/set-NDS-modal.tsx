import { Form, Input, Modal, Checkbox, message, Upload, Select } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { cpmService } from '../../../../services/cpw-service';
import { useEffect, useState } from 'react';
import { EditState } from '../../../../hooks';
import axios from 'axios';
/**
 * 更新issue
 */
export const SetNDSModal = ({
  modelName,
  list,
  visible,
  onSuccess,
  onCancel,
  state,
  //configParamList,
}: {
  modelName?: [];
  list?: any;
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  state: EditState<Partial<any>>;
  //configParamList: undefined | any[];
}) => {
  const [form] = useForm();
  const [loading, setLoading] = useState(false);

  const handleUpdate = () => {
    form
      .validateFields()
      .then(async (values) => {
        try {
          setLoading(true);
          let response: any = await cpmService.setNdsVsn({
            subtaskId: values.subtaskId,
            ndsVsn: values.ndsVsn
          });
          if (response.code !== 0 && response.code !== 200) {
            message.error(response.data.msg);
          } else {
            message.success('NDS版本已更新');
            setTimeout(() => {
              // eslint-disable-next-line no-restricted-globals
              location.reload();
            }, 1000);
          }
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
  //获取默认值
  const values = state.getItem();

  useEffect(() => {
    if (visible) {
      // let issueId = values?.issueId;
      // batchProcessList(issueId + '');
      // getPublicConfig(issueId + '');

      form.setFieldsValue(values);

    } else {
      form.resetFields();
    }
  }, [values]);

  return (
    <Modal
      title="追加NDS版本"
      onOk={handleUpdate}
      onCancel={onCancel}
      open={visible}
      okButtonProps={{ loading }}
      destroyOnClose
      width={800}
    >
      <Form form={form} labelCol={{ span: 4 }}>
        <Form.Item label="融合任务ID" name="subtaskId">
          <Input disabled={true}></Input>
        </Form.Item>
        <Form.Item label="NDS版本" name="ndsVsn">
          <Input placeholder='请输入' required></Input>
        </Form.Item>
      </Form>
    </Modal>
  );
};
