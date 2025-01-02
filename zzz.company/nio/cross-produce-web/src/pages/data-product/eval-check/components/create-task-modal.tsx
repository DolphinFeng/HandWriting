import {Form, Input, Modal, message, Select, DatePicker, Button} from 'antd';
import {useForm} from 'antd/es/form/Form';
import {cpmService} from '../../../../services/cpw-service';
import {ProjectSelect} from '../../../project/project-select';
import {BatchSelect} from '../../../project/batch-select';
import {CreateOverWriteBatchParams} from '../../../../models';
import {useEffect, useState} from 'react';
import {convertMomentTupleToTimestampTuple} from '../../../../utils';
import {BusinessType} from '../../../business-type';
/**
 * 创建任务弹窗
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
  const [changeBusiness, setChangeBusiness] = useState();
  const [inferAlgVsnOp, setInferAlgVsnOp] = useState();
  const [evalAlgVsnOp, setEvalAlgVsnOp] = useState();
  const [mergeTaskOp, setMergeTaskOp] = useState(); 

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
          await cpmService.createEvalTask(filteredObj);

          message.success('创建成功');
          onSuccess();
          setTimeout(() => {
            // eslint-disable-next-line no-restricted-globals
            location.reload();
          }, 1000);
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

  //获取推理算法版本列表
  const handleInferAlgVsnList = async () => {
    try {
      const result: any = await cpmService.retrieveInferAlgVsnList();
      setInferAlgVsnOp(
        result.data.map((item: any) => ({
          label: item,
          value: item,
        })),
      );
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };

  //获取融合任务列表
  const handleMergeTaskList = async () => {
    try {
      const result: any = await cpmService.retrieveTaskNameList();
      setMergeTaskOp(
        result.data.map((item: any) => ({
          label: item.subtaskName,
          value: item.subtaskId.toString(),
        })),
      );
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };

  //获取打分算法版本列表
  const handleEvalAlgVsnList = async () => {
    try {
      const result: any = await cpmService.getCurrentEvalAlgVsn();
      setEvalAlgVsnOp(
        result.data.map((item: any) => ({
          label: item,
          value: item,
        })),
      );
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };


  useEffect(() => {
    //获取城市接口
    // handleCityList();
    // handleTaskName();
    handleInferAlgVsnList();
    handleMergeTaskList();
    handleEvalAlgVsnList();

    // let bt = 'cross';
    // if (changeBusinessValue) {
    //   bt = businessType[changeBusinessValue];
    // }

    // handleGetTmsFieldsList(bt);
  }, []);

  
  return (
    <Modal title="创建批量打分任务" onOk={handleCreate} onCancel={handleCancel} open={visible} okButtonProps={{loading}}>
      <Form form={form} labelCol={{span: 8}} onValuesChange={handleValueChange}>
        <ProjectSelect changeBusiness={changeBusiness}></ProjectSelect>

        <Form.Item label="城市列表" name="cityList">
          <Input placeholder="请输入以英文逗号分隔的城市"></Input>
        </Form.Item>
        <Form.Item label="融合任务" name="mergeSubtaskId">
          <Select options={mergeTaskOp} placeholder="请选择" allowClear></Select>
        </Form.Item>
        <Form.Item label="推理算法版本" name="inferAlgVsn">
          <Select options={inferAlgVsnOp} placeholder="请选择" allowClear></Select>
        </Form.Item>
        <Form.Item label="打分算法版本" name="evalAlgVsn">
          <Select options={evalAlgVsnOp} placeholder="请选择" allowClear></Select>
        </Form.Item>
        <Form.Item label="名称" name="batchInferEvalTaskName">
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item label="描述" name="batchInferEvalTaskDesc">
          <Input.TextArea placeholder="请输入" rows={5}></Input.TextArea>
        </Form.Item>
      </Form>
    </Modal>
  );
};
