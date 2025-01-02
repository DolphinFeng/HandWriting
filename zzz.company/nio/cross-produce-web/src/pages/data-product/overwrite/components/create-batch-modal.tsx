import {Form, Input, Modal, message, Select, DatePicker, Button} from 'antd';
import {useForm} from 'antd/es/form/Form';
import {cpmService} from '../../../../services/cpw-service';
import {ProjectSelect} from '../../../project/project-select';
import {BatchSelect} from '../../../project/batch-select';
import {CreateOverWriteBatchParams} from '../../../../models';
import {useState} from 'react';
import {convertMomentTupleToTimestampTuple} from '../../../../utils';
import {BusinessType} from '../../../business-type';
/**
 * 创建批次弹窗
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
  const [form] = useForm();
  const [project_id, setProjectId] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectBusinessType, setSelectBusinessType] = useState();
  const [selectMode, setSelectMode] = useState();
  const [batchMappingTaskTypeOptions, setBatchMappingTaskTypeOptions] = useState<any>();
  // const [inputValue, setInputValue] = useState('');
  const handleValueChange = (changedValues: CreateOverWriteBatchParams) => {
    if (changedValues.projectId) {
      setProjectId(changedValues.projectId);
      form.setFieldValue('batchId', undefined);
    }
  };

  const handleCreate = () => {
    form
      .validateFields()
      .then(async (values) => {
        try {
          setLoading(true);
          const createTime = convertMomentTupleToTimestampTuple(values.createTime);

          let filteredObj = Object.keys(values)
            .filter((key) => key !== 'createTime')
            .reduce((result: any, key) => {
              result[key] = values[key];
              return result;
            }, {});

          filteredObj.startCreateTime = createTime[0];
          filteredObj.endCreateTime = createTime[1];
          // filteredObj.batchIds=inputValue;
          await cpmService.createOverWriteBatch(filteredObj);

          message.success('创建成功');
          onSuccess();
          form.resetFields();
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
    form.resetFields();
  };

  const showModal = (value: any) => {
    setIsModalOpen(value);
  };
  const onChangeType = (e: any) => {
    setSelectBusinessType(e);
    form.setFieldValue('batchMode', undefined);
    form.setFieldValue('batchMappingTaskType', undefined);

    if (e == 1) {
      setBatchMappingTaskTypeOptions([
        {
          label: '模型(全部)',
          value: 'MODEL_ALL',
        },
        {
          label: '模型',
          value: 'MODEL_ONLY',
        },
        {
          label: '红绿灯',
          value: 'TLD_ONLY',
        },
        {
          label: '标识牌',
          value: 'SIGN_ONLY',
        },
        {
          label: '桥上桥下',
          value: 'BRIDGE_ONLY',
        },
        {
          label: '模型数据集合并',
          value: 'MODEL_MERGE',
        },
        {
          label: '推理',
          value: 'INFERENCE',
        },
        {
          label: '推理(模型模式)',
          value: 'INFERENCE_BY_MODEL',
        },
        {
          label: '推理(矢量模式)',
          value: 'INFERENCE_BY_VECTOR',
        },
        {
          label: '推理(混合模式)',
          value: 'INFERENCE_BY_MIX',
        },
        // {
        //   label: '模型、红绿灯和推理',
        //   value: 'MODEL_TLD_INFERENCE',
        // },
      ]);
    } else if (e == 3 || e == 4 || e == 5 || e == 7 || e == 8) {
      setBatchMappingTaskTypeOptions([
        {
          label: '推理',
          value: 'INFERENCE',
        },
      ]);
    }
  };
  const onChangeMode = (e: any) => {
    setSelectMode(e);
    if (selectBusinessType == 2 && e == 1) {
      setBatchMappingTaskTypeOptions([
        {
          label: '推理',
          value: 'INFERENCE',
        },
        {
          label: '模型',
          value: 'MODEL_ONLY',
        },
      ]);
    } else if (selectBusinessType == 2 && e == 2) {
      setBatchMappingTaskTypeOptions([
        {
          label: '推理',
          value: 'INFERENCE',
        },
      ]);
    }
  };
  return (
    <Modal title="创建批次" onOk={handleCreate} onCancel={handleCancel} open={visible} okButtonProps={{loading}}>
      <Form form={form} labelCol={{span: 8}} onValuesChange={handleValueChange}>
        {/* <ProjectSelect required projectIdShow="createBatch"></ProjectSelect> */}
        <BusinessType
          businessModel={true}
          city={false}
          changeBusiness={onChangeType}
          changeMode={onChangeMode}
          required
        ></BusinessType>
        <BatchSelect
          required={false}
          project_id={project_id}
          batchIdShow="createBatch"
          modalOpen={showModal}
        ></BatchSelect>

        <Form.Item label="建图实体编号" name="crossIds">
          <Input.TextArea
            placeholder="请输入以英文逗号分隔的建图实体编号"
            rows={3}
          ></Input.TextArea>
        </Form.Item>

        <Form.Item label="刷库任务类型" rules={[{required: true}]} name="batchMappingTaskType">
          <Select
            showSearch
            style={{width: '200px'}}
            options={batchMappingTaskTypeOptions}
            placeholder="请选择"
            allowClear
            filterOption={false}
          ></Select>
        </Form.Item>
        <Form.Item label="上一个历史算法版本" name="lastAlgVsn">
          <Input placeholder="请输入" style={{width: '200px'}}></Input>
        </Form.Item>
        <Form.Item label="待刷数据时间范围" name="createTime">
          <DatePicker.RangePicker
            placeholder={['起始时间', '结束时间']}
            showTime={{format: 'HH:mm:ss'}}
            format="YYYY-MM-DD HH:mm:ss"
          ></DatePicker.RangePicker>
        </Form.Item>
        <Form.Item label="名称" rules={[{required: true}]} name="taskName">
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item label="描述" rules={[{required: true}]} name="taskDesc">
          <Input.TextArea placeholder="请输入" rows={5}></Input.TextArea>
        </Form.Item>
      </Form>
    </Modal>
  );
};
