import {Form, Input, Modal, message, Select, Button} from 'antd';
import {useForm} from 'antd/es/form/Form';
import {algoService} from '../../services/algo-service';
import {useState, useEffect} from 'react';
import JsonViewDlg from '../json-view';
import {useEditState, usePageFns, useQuery} from '../../hooks';

/**
 * 项目创建弹窗
 * @returns
 */
export const CreateAlgoVersionDlg = ({
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

  const [stepConf, setStepConf] = useState<any>('');

  const [algoNameOption, setAlgoNameOption] = useState<any>([]);

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
          await algoService.createAlgoVersion({
            algId: values.algId,
            algVsn: values.algVsn.trim(),
            algVsnDesc: values.algVsnDesc.trim(),
            stepConf: values.stepConf.trim(),
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

    setAlgoNameOption([]);
  };

  const handleChangeAlgoType = async (e: any) => {
    const ret = await algoService.queryAlgoList({
      algType: form.getFieldValue('algType'),
      bizType: form.getFieldValue('bizType'),
      pageNo: 1,
      pageSize: 1000,
    });

    setAlgoNameOption(
      ret.data.map((item) => {
        return {
          label: item.algName,
          value: item.algId,
        };
      }),
    );
  };

  const handleChangeAlgo = async (e: any) => {
    const ret: any = await algoService.queryAlgoStepConfig(form.getFieldValue('algId'));
    setStepConf(JSON.stringify(ret.data.stepConfList));
    form.setFieldValue('stepConf', JSON.stringify(ret.data.stepConfList));
  };

  const handleCancel = () => {
    form.resetFields();
    setAlgoNameOption([]);
    setAlgoTypeOption([]);
    onCancel();
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [record, setRecord] = useState();

  const showContent = () => {
    let content = form.getFieldValue('stepConf');
    if (!content) {
      message.info('空');
      return;
    }
    setRecord(JSON.parse(content));
    setIsModalOpen(true);
  };

  const modifyStepConfig = () => {
    let content = form.getFieldValue('stepConf');
    if (!content) {
      message.info('空');
      return;
    }

    let inputList = JSON.parse(content).map((item: any) => {
      form2.setFieldValue(item.stepId, item.image);
      return item;
    });

    setInputStepList(inputList);
    create_state.show();
  };

  //修改对话框的数据
  const [form2] = useForm();
  const [inputStepList, setInputStepList] = useState<{stepId: number; stepName: string; image: string}[]>([]);
  const create_state = useEditState();
  const handleStepOk = () => {
    for (let item of inputStepList) {
      item.image = form2.getFieldValue(item.stepId);
    }

    form.setFieldValue('stepConf', JSON.stringify(inputStepList));
    setInputStepList([]);
    create_state.hide();
  };
  const handleStepCancel = () => {
    setInputStepList([]);
    create_state.hide();
  };

  return (
    <div>
      <Modal title="创建算法版本" onOk={handleCreate} onCancel={handleCancel} open={visible} okButtonProps={{loading}}>
        <Form form={form} labelCol={{span: 7}}>
          <Form.Item label="生产模式" rules={[{required: true}]} name="bizType">
            <Select placeholder="请选择" allowClear options={bizTypeOption} onChange={handleChangeBisType}></Select>
          </Form.Item>
          <Form.Item label="算法类型" rules={[{required: true}]} name="algType">
            <Select placeholder="请选择" allowClear options={algoTypeOption} onChange={handleChangeAlgoType}></Select>
          </Form.Item>
          <Form.Item label="算法名称" rules={[{required: true}]} name="algId">
            <Select placeholder="请选择" allowClear options={algoNameOption} onChange={handleChangeAlgo}></Select>
          </Form.Item>
          <Form.Item label="算法版本号" rules={[{required: true}]} name="algVsn">
            <Input placeholder="请输入"></Input>
          </Form.Item>
          <Form.Item label="生产workflow配置" rules={[{required: true}]}>
            <Form.Item style={{display: 'inline-flex', width: 'calc(55% - 4px)'}} name="stepConf">
              <Input disabled></Input>
            </Form.Item>
            <Form.Item style={{display: 'inline-flex', width: 'calc(40% - 4px)', marginLeft: '10px'}}>
              <Button onClick={showContent}>查看</Button>
              <Button type="primary" onClick={modifyStepConfig}>
                修改
              </Button>
            </Form.Item>
          </Form.Item>

          <Form.Item label="算法版本号描述" rules={[{required: true}]} name="algVsnDesc">
            <Input.TextArea placeholder="请输入" rows={5}></Input.TextArea>
          </Form.Item>
        </Form>
        <JsonViewDlg visible={isModalOpen} closeDialog={() => setIsModalOpen(false)} content={record}></JsonViewDlg>
      </Modal>
      <Modal
        title="算法版本step"
        onOk={handleStepOk}
        onCancel={handleStepCancel}
        open={create_state.visible}
        width={1000}
      >
        <Form form={form2}>
          {inputStepList.map((input, index) => (
            <Form.Item
              key={input.stepId}
              label={input.stepId + ': ' + input.stepName}
              rules={[{required: true}]}
              name={input.stepId}
            >
              <Input placeholder="请输入"></Input>
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
};
