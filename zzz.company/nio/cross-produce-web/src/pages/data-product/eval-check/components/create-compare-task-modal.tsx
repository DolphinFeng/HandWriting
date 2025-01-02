import { Form, Input, Modal, message, Select, DatePicker, Button } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { cpmService } from '../../../../services/cpw-service';
import { ProjectSelect } from '../../../project/project-select';
import { BatchSelect } from '../../../project/batch-select';
import { CreateOverWriteBatchParams } from '../../../../models';
import { useEffect, useState } from 'react';
import { convertMomentTupleToTimestampTuple } from '../../../../utils';
import { BusinessType } from '../../../business-type';
/**
 * 创建对比任务弹窗
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
  const crossScopeOp = [
    { label: '全量路口对比', value: 1 },
    { label: '路口筛选后未回退路口对比', value: 2 },
    { label: '不回退筛选路口', value: 3 }
  ]
  const routeScopeOp = [
    { label: '全量路径对比', value: 1 },
    { label: '目标路径对比', value: 2 },
  ]


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
          await cpmService.createEvalTaskResult(filteredObj);

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

  //获取推理打分算法版本列表（旧接口-retrieveEvalAlgVsnList）
  const handleEvalAlgVsnList = async () => {
    try {
      const result: any = await cpmService.retrieveEvalAlgVsnList();
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
    handleInferAlgVsnList();
    handleEvalAlgVsnList();
    handleMergeTaskList();
  }, []);

  return (
    <Modal title="创建打分结果对比任务" onOk={handleCreate} onCancel={handleCancel} open={visible} okButtonProps={{ loading }}>
      <Form form={form} labelCol={{ span: 8 }} onValuesChange={handleValueChange}>
        <ProjectSelect changeBusiness={changeBusiness}></ProjectSelect>

        <Form.Item label="城市列表" name="cityList">
          <Input placeholder="请输入以英文逗号分隔的城市"></Input>
        </Form.Item>
        <Form.Item label="建图实体编号" name="crossList">
          <Input.TextArea placeholder="请输入" rows={5}></Input.TextArea>
        </Form.Item>
        <Form.Item label="目标路径编号" name="routeList">
          <Input.TextArea placeholder="请输入" rows={5}></Input.TextArea>
        </Form.Item>
        <Form.Item label="推理打分算法版本" name="evalAlgVsn">
          <Select options={evalAlgVsnOp} placeholder="请选择" allowClear></Select>
        </Form.Item>
        <Form.Item label="新版推理算法版本" name="newInferAlgVsn">
          <Select options={inferAlgVsnOp} placeholder="请选择" allowClear></Select>
        </Form.Item>
        <Form.Item label="旧版推理算法版本" name="oldInferAlgVsn">
          <Select options={inferAlgVsnOp} placeholder="请选择" allowClear></Select>
        </Form.Item>
        <Form.Item label="新版融合任务" name="newMergeSubtaskId">
          <Select options={mergeTaskOp} placeholder="请选择" allowClear></Select>
        </Form.Item>
        <Form.Item label="旧版融合任务" name="oldMergeSubtaskId">
          <Select options={mergeTaskOp} placeholder="请选择" allowClear></Select>
        </Form.Item>
        <Form.Item label="路口统计范围" name="crossScopeType">
          <Select options={crossScopeOp} placeholder="请选择" allowClear></Select>
        </Form.Item>
        <Form.Item label="路径统计范围" name="routeScopeType">
          <Select options={routeScopeOp} placeholder="请选择" allowClear></Select>
        </Form.Item>
        <Form.Item label="任务名称" name="inferEvalCompareTaskName">
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item label="描述" name="inferEvalCompareTaskDesc">
          <Input.TextArea placeholder="请输入" rows={5}></Input.TextArea>
        </Form.Item>
      </Form>
    </Modal>
  );
};
