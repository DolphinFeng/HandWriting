import {Form, Input, Modal, Select, Upload, message, Checkbox} from 'antd';
import {useForm} from 'antd/es/form/Form';
import {cpmService} from '../../services/cpw-service';
import {ProjectSelect} from './project-select';
import {InboxOutlined} from '@ant-design/icons';
import {normFile} from '../../utils/antd';
import {useEffect, useRef, useState} from 'react';
import {PublicConfig} from '../../models';
import {BusinessType} from '../business-type';

const {TextArea} = Input;

/**
 * 创建批次弹窗
 * @returns
 */
export const CreateModal = ({
  buttonType,
  businessType,
  modelName,
  visible,
  onSuccess,
  onCancel,
}: {
  buttonType?: string;
  businessType?: [];
  modelName?: [];
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [loading, setLoading] = useState(false);

  const [publicConfig, setPublicConfig] = useState<PublicConfig[]>([]);

  const [publicConfigInitValue, setPublicConfigInitValue] = useState<any>({});
  const [modeDisabled, setModeDisabled] = useState(false);
  const [plainProcessOptions, setPlainProcessOptions] = useState();
  const [title, setTitle] = useState('');
  const [form] = useForm();

  const [form2] = useForm<any>();

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

  useEffect(() => {
    if (buttonType === 'create') {
      setTitle('批次创建');
    } else if (buttonType === 'updateList') {
      setTitle('批次更新');
    }
  }, [visible]);

  const handleCreate = () => {
    form
      .validateFields()
      .then(async (values) => {
        form2.validateFields().then(async (value2) => {
          try {
            setLoading(true);
            //创建接口
            if (buttonType === 'create') {
              let response = await cpmService.createBatch({
                batchMode: values.batchMode ? values.batchMode : null,
                businessType: values.businessType,
                batchFile: values.batchFile,
                projectId: values.projectId,
                batchName: values.batchName.trim(),
                batchDesc: values.batchDesc.trim(),
                //operator: values.operator.trim(),
                processList: JSON.stringify(values.processList),
                configParam: JSON.stringify(value2).trim(),
              });
              if (response.data.code !== 0) {
                message.error(response.data.msg);
              } else {
                message.success('创建成功');
                form.resetFields();
                form2.resetFields();
              }
            } else if (buttonType === 'updateList') {
              //批量更新接口
              let response: any = await cpmService.updateBatch({
                batchMode: values.batchMode ? values.batchMode : null,
                businessType: values.businessType,
                batchFile: values.batchFile,
                batchIds: values.batchIds,
                processList: values.processList.length == 0 ? '[]' : JSON.stringify(values.processList).trim(),
                configParam: JSON.stringify(value2).trim(),
              });
              if (response.code !== 0) {
                message.error(response.data.msg);
              } else {
                message.success('更新成功');
                form.resetFields();
                form2.resetFields();
              }
            }

            onSuccess();
          } catch (error: any) {
            console.error(error);
            message.error(error.message);
          } finally {
            setLoading(false);
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleCancel = () => {
    onCancel();
  };

  function onChange(checkedValues: any) {
    console.log('checked = ', checkedValues);
  }

  let onFinish = (values: any) => {
    console.log('onFinish:', values);
  };

  let onFinishFailed = (errorInfo: any) => {
    console.log('onFinishFailed:', errorInfo);
  };

  // formItem css 样式
  const formItemLayout = {
    labelCol: {
      xs: {span: 24},
      sm: {span: 10},
    },
    wrapperCol: {
      xs: {span: 24},
      sm: {span: 14},
    },
  };

  const businessTypeChange = (e: any) => {
    getPublicConfig(e);
    batchProcessList(e);

    if (e !== '' && e == 2) {
      setModeDisabled(true);
    } else {
      setModeDisabled(false);
    }
  };

  return (
    <Modal
      title={title}
      onOk={handleCreate}
      onCancel={handleCancel}
      open={visible}
      okButtonProps={{loading}}
      destroyOnClose
      width={800}
    >
      <Form form={form} labelCol={{span: 4}}>
        <Form.Item label="生产模式" name="businessType">
          <Select
            placeholder="请选择"
            style={{width: '200px'}}
            allowClear
            options={businessType}
            onChange={businessTypeChange}
          ></Select>
        </Form.Item>
        {/* {modeDisabled && (
          <Form.Item label="产线模式" name="batchMode">
            <Select placeholder="请选择" style={{width: '200px'}} allowClear options={modelName}></Select>
          </Form.Item>
        )} */}

        {buttonType === 'create' && (
          <>
            <ProjectSelect required></ProjectSelect>
            <Form.Item label="批次名称" rules={[{required: true, max: 64}]} name="batchName">
              <Input placeholder="请输入"></Input>
            </Form.Item>
            <Form.Item label="批次描述" rules={[{required: true}]} name="batchDesc">
              <Input.TextArea placeholder="请输入" rows={5}></Input.TextArea>
            </Form.Item>
          </>
        )}
        {buttonType === 'updateList' && (
          <Form.Item label="批次编号" name="batchIds" rules={[{required: true}]}>
            <Input.TextArea placeholder="请输入以英文逗号分隔的批次编号" rows={4}></Input.TextArea>
          </Form.Item>
        )}

        <Form.Item
          label="相关文件"
          name="batchFile"
          getValueFromEvent={normFile}
          valuePropName="file"
          // rules={[{required: true, message: '请上传文件'}]}
        >
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
            {/* <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned
              files.
            </p> */}
          </Upload.Dragger>
        </Form.Item>

        {plainProcessOptions && (
          <Form.Item label="批次环节" rules={[{ required: false }]} name="processList">
            <Checkbox.Group options={plainProcessOptions} onChange={onChange} />
          </Form.Item>
        )}
      </Form>
      <Form
        form={form2}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={publicConfigInitValue}
        preserve={false}
      >
        {publicConfig.length > 0 &&
          publicConfig?.map((item: any, index: any) => {
            return (
              <Form.Item
                key={index}
                {...formItemLayout}
                label={item.paramDesc}
                name={item.paramName}
                hasFeedback
                rules={[
                  {
                    required: false,
                    message: '不能为空',
                  },
                ]}
              >
                <TextArea
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
