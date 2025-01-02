import {Form, Input, Modal, Checkbox, message, Upload, Select} from 'antd';
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
export const UpdateBatchModal = ({
  modelName,
  businessTypeList,
  visible,
  onSuccess,
  onCancel,
  state,
  configParamList,
}: {
  modelName?: [];
  businessTypeList?: [];
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  state: EditState<Partial<UpdateBatchPayload>>;
  configParamList: undefined | any[];
}) => {
  const [form] = useForm();
  const [form2] = useForm();
  const [loading, setLoading] = useState(false);
  const [modeDisabled, setModeDisabled] = useState(false);
  const [publicConfigInitValue, setPublicConfigInitValue] = useState({});
  const [plainProcessOptions, setPlainProcessOptions] = useState();
  const [publicConfig, setPublicConfig] = useState([]);

  const handleUpdate = () => {
    form
      .validateFields()
      .then(async (values) => {
        form2
          .validateFields()
          .then(async (value2) => {
            try {
              setLoading(true);

              let response: any = await cpmService.updateBatch({
                batchMode: values.batchMode ? values.batchMode : null,
                businessType: values.businessType,
                batchFile: values.batchFile,
                batchId: state.getItem()?.batchId,
                batchName: values.batchName.trim(),
                batchDesc: values.batchDesc.trim(),
                processList: values.processList.length == 0 ? '[]' : JSON.stringify(values.processList).trim(),
                configParam: JSON.stringify(value2).trim(),
              });
              if (response.code !== 0) {
                message.error(response.data.msg);
              } else {
                message.success('匹配配置已更新');
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
      })
      .catch((error) => {
        console.error(error);
      });
  };
  //获取默认值
  const values = state.getItem();
  useEffect(() => {
    if (visible) {
      let type = values?.businessType;
      batchProcessList(type + '');
      getPublicConfig(type + '');
      
      form.setFieldsValue(values);
      let configParamList1 = values?.configParamList;
      if (configParamList1) {
        let paramListDefaultValue: any = {};
        for (let i = 0; i < configParamList1.length; i++) {
          const {paramName, value, paramValue} = configParamList1[i];
          paramListDefaultValue[paramName] = paramValue;
        }
        form2.setFieldsValue(paramListDefaultValue);
      }
    } else {
      form.resetFields();
      form2.resetFields();
    }
  }, [values]);

  const getPublicConfig = async (bizType: any) => {
    let res: any = await cpmService.queryConfigPublic(bizType);

    setPublicConfig(res.data);
    let initValues: any = {};

    for (let publicConfigItem of res.data) {
      const paramName = publicConfigItem.paramName;
      initValues[paramName] = publicConfigItem.paramValue;
    }
    setPublicConfigInitValue(initValues);
  };

  const batchProcessList = async (bizType: any) => {
    let res: any = await cpmService.batchProcessList(bizType);
    setPlainProcessOptions(JSON.parse(res.data));
  };

  return (
    <Modal
      title="更新批次"
      onOk={handleUpdate}
      onCancel={onCancel}
      open={visible}
      okButtonProps={{loading}}
      destroyOnClose
      width={800}
    >
      <Form form={form} labelCol={{span: 4}}>
        <Form.Item label="生产模式" name="businessType">
          <Select placeholder="请选择" style={{width: '200px'}} allowClear options={businessTypeList} disabled></Select>
        </Form.Item>
        {/* {modeDisabled && (
          <Form.Item label="产线模式" name="batchMode">
            <Select placeholder="请选择" style={{width: '200px'}} allowClear options={modelName}></Select>
          </Form.Item>
        )} */}
        <Form.Item label="批次名称" rules={[{required: true, max: 64}]} name="batchName">
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item label="批次描述" rules={[{required: true}]} name="batchDesc">
          <Input.TextArea placeholder="请输入" rows={5}></Input.TextArea>
        </Form.Item>
        <Form.Item label="相关文件" name="batchFile" getValueFromEvent={normFile} valuePropName="file">
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
        {plainProcessOptions && (
          <Form.Item label="批次环节" name="processList">
            <Checkbox.Group options={plainProcessOptions} />
          </Form.Item>
        )}
      </Form>
      <Form form={form2}>
        {configParamList &&
          configParamList.map((item: any, index: any) => {
            return (
              <Form.Item
                key={index}
                label={item.paramDesc}
                name={item.paramName}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: '不能为空',
                  },
                ]}
              >
                <Input.TextArea
                  autoSize={{
                    maxRows: 5,
                  }}
                />
              </Form.Item>
            );
          })}
      </Form>
    </Modal>
  );
};
