import {Form, Input, Modal, Checkbox, message, Upload} from 'antd';
import {useForm} from 'antd/es/form/Form';
import {cpmService} from '../../services/cpw-service';
import {useEffect, useState} from 'react';
import {UpdateBatchPayload} from '../../models';
import {EditState} from '../../hooks';
import {InboxOutlined} from '@ant-design/icons';
import {normFile} from '../../utils/antd';
/**
 * 更新批次
 */
export const UpdateBatchList = ({
  visible,
  onSuccess,
  onCancel,
}: {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [form] = useForm();
  const [form2] = useForm();
  const [loading, setLoading] = useState(false);

  const handleUpdate = () => {
    form
      .validateFields()
      .then(async (values) => {
        form2
          .validateFields()
          .then(async (value2) => {
            try {
              setLoading(true);
              // let response = await cpmService.updateBatch({
              //   batchFile: values.batchFile,
              //   batchIds: values.batchIds,
              //   processList: values.processList.length == 0 ? '[]' : JSON.stringify(values.processList).trim(),
              //   configParam: JSON.stringify(value2).trim(),
              // });
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
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    form.resetFields();
    form2.resetFields();
  }, [visible]);

  const plainProcessOptions = [
    'COLLECT',
    'PERCEPTION',
    'PERCEPTION_VERIFY',
    'MODEL',
    'ANNOTATION',
    'INFERENCE',
    'PRODUCE',
  ];

  return (
    <Modal
      title="批量更新批次"
      onOk={handleUpdate}
      onCancel={onCancel}
      open={visible}
      okButtonProps={{loading}}
      destroyOnClose
      width={800}
    >
      <Form form={form} labelCol={{span: 4}}>
        <Form.Item label="批次编号" name="batchIds" rules={[{required: true}]}>
          <Input.TextArea placeholder="请输入以英文逗号分隔的批次编号" rows={4}></Input.TextArea>
        </Form.Item>
        <Form.Item label="批次文件" name="batchFile" getValueFromEvent={normFile} valuePropName="file">
          <Upload.Dragger
            maxCount={1}
            customRequest={(options) => {
              const {file, onSuccess} = options;
              onSuccess && onSuccess(file);
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">拖拽上传</p>
          </Upload.Dragger>
        </Form.Item>
        <Form.Item label="批次环节" name="processList" rules={[{required: true}]}>
          <Checkbox.Group options={plainProcessOptions} />
        </Form.Item>
        <Form.Item label="批次配置参数列表"></Form.Item>
      </Form>
      <Form form={form2}>
        <Form.Item
          label="建图结果最少成功路径数："
          name="perception.mapping.route.success.least"
          rules={[{required: true}]}
        >
          <Input.TextArea autoSize={{maxRows: 5}} />
        </Form.Item>
        <Form.Item
          label="初次建图路径百分比阈值："
          name="perception.mapping.first.percent.least"
          rules={[{required: true}]}
        >
          <Input.TextArea autoSize={{maxRows: 5}} />
        </Form.Item>
        <Form.Item
          label="相同的路口任务推送时间最小间隔，单位=小时："
          name="perception.mapping.interval.hour.least"
          rules={[{required: true}]}
        >
          <Input.TextArea autoSize={{maxRows: 5}} />
        </Form.Item>
        <Form.Item
          label="建图质检最少有效路径数："
          name="perception.verify.route.success.least"
          rules={[{required: true}]}
        >
          <Input.TextArea autoSize={{maxRows: 5}} />
        </Form.Item>
        <Form.Item
          label="增量建图新增路径数："
          name="perception.mapping.increment.route.count"
          rules={[{required: true}]}
        >
          <Input.TextArea autoSize={{maxRows: 5}} />
        </Form.Item>
        <Form.Item label="送标预算UUID：" name="annotation.budget.uuid">
          <Input.TextArea autoSize={{maxRows: 5}} />
        </Form.Item>
        <Form.Item label="批次优先级：" name="batch.priority">
          <Input.TextArea autoSize={{maxRows: 5}} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
