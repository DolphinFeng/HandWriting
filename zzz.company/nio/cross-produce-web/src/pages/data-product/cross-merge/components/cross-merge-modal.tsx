import {Form, Input, Modal, message, Divider, Flex, theme, Space, Checkbox, Select, DatePicker, Button} from 'antd';
import {useForm} from 'antd/es/form/Form';
import {cpmService} from '../../../../services/cpw-service';
import {CreateOverWriteBatchParams} from '../../../../models';
import {ProjectMultiSelect} from '../../../project/project-multi-select';
import {useEffect, useState} from 'react';
import {omit} from 'lodash';
import {MergeBusinessType} from '../../../merge-business-type';

/**
 * 创建批次弹窗
 * @returns
 */
export const CreateModal = ({
  title,
  visible,
  disabled,
  onSuccess,
  onCancel,
}: {
  title: string;
  visible: boolean;
  disabled: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [form] = useForm();
  const [form2] = useForm();
  const [form3] = useForm();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cityName, setCityName] = useState();
  const [taskNameOption, setTaskNameOption] = useState();
  const [changeBusiness, setChangeBusiness] = useState(1);

  const [inferAlgVsnOp, setInferAlgVsnOp] = useState();
  const [evalAlgVsnListOp, setEvalAlgVsnListOp] = useState();
  const [crossTmsFields, setCrossTmsFields] = useState([]);
  const [changeBusinessValue, setChangeBusinessValue] = useState();
  const [businessType, setBusinessType] = useState({});
  const crossTypeOption = [
    {
      label: 'HIGH_LEVEL_INTER',
      value: 1,
    },
    {
      label: 'MIX_LEVEL_INTER',
      value: 2,
    },
    {
      label: 'LOW_LEVEL_INTER',
      value: 3,
    },
    {
      label: 'LR_TURN_BRANCH',
      value: 4,
    },
    {
      label: 'U_TURN_BRANCH',
      value: 5,
    },
    {
      label: 'NON_CROSS_INTER',
      value: 6,
    },
    {
      label: 'VRU_OPENING',
      value: 7,
    },
  ];

  // const handleValueChange = (changedValues: CreateOverWriteBatchParams) => {
  //   if (changedValues.projectId) {
  //     setProjectId(changedValues.projectId);
  //     form.setFieldValue('batchId', undefined);
  //   }
  // };

  const modalNameOption = [
    { label: '推理打分筛选全量路口', value: 'COMPARE_ALL' },
    { label: '推理打分筛选变好路口', value: 'COMPARE_ADD' },
    { label: '新版路口替换旧版路口', value: 'REPLACE_ALL' },
  ];

  const list2string = (params: [] | undefined | null) => {
    if (!params || params.length == 0) {
      return undefined;
    }

    let result = '';
    if(typeof(params) == 'string'){
      result = params
    }else {
      for (let param of params) {
        result += param + ',';
      }
    }    

    //去掉最后一个逗号
    return result.slice(0, -1);
  };

  const handleCreate = () => {
    form
      .validateFields()
      .then((values) => {
        form2.validateFields().then(async (formTwovalue) => {
          form3.validateFields().then(async (formThreevalue) => {
            try {
              setLoading(true);
              
              let projectIdList: any = []
              if (typeof (values['projectIdList']) == 'string'){
                if (values['projectIdList'] === '路口生产项目') {
                  projectIdList = '10068'
                } else if (values['projectIdList'] === '分合流口生产项目') {
                  projectIdList = '10069'
                } else if (values['projectIdList'] === 'PN众包生产项目') {
                  projectIdList = '10071'
                } else if (values['projectIdList'] === 'PSP众包生产项目') {
                  projectIdList = '10072'
                }
              } else {
                for (let i = 0; i < values['projectIdList'].length; i++) {
                  if (values['projectIdList'][i] === '路口生产项目') {
                    projectIdList[i] = 10068
                  } else if (values['projectIdList'][i] === '分合流口生产项目') {
                    projectIdList[i] = 10069
                  } else if (values['projectIdList'][i] === 'PN众包生产项目') {
                    projectIdList[i] = 10071
                  } else if (values['projectIdList'][i] === 'PSP众包生产项目') {
                    projectIdList[i] = 10072
                  } else {
                    projectIdList[i] = values['projectIdList'][i]
                  }
                }
                projectIdList = projectIdList.join(',')
              }
  
              const compareSelectType = formThreevalue.compareSelectType;
              const useCompare = formThreevalue.useCompare; // 提取 useCompare 的值
              values.compareSelectType = compareSelectType;
              values.useCompare = useCompare; // 将 useCompare 添加到 values 中
              
  
              await cpmService.createMergeTask({
                cityList: list2string(values['cityList']),
                subtaskName: values['subtaskName'],
                projectIdList: projectIdList,
                crossTypeList: list2string(values['crossTypeList']),
                compareSelectType: values['compareSelectType'],
                tmsConfig: JSON.stringify(formTwovalue),
                ...omit(values, ['cityList', 'subtaskName', 'crossTypeList', 'projectIdList', 'compareSelectType']),
              });
              message.success('创建成功');
              setTimeout(() => {
                // eslint-disable-next-line no-restricted-globals
                location.reload();
              }, 1000);
              onSuccess();
              form.resetFields();
              form2.resetFields();
              form3.resetFields();
            } catch (error: any) {
              console.error(error);
              message.error(error.message);
            } finally {
              setLoading(false);
            }
          })
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleCancel = () => {
    onCancel();
    form.resetFields();
    form2.resetFields();
    form3.resetFields();
  };

  const showModal = (value: any) => {
    setIsModalOpen(value);
  };

  // 动态获取 bizType
  const getMergeBusinessTypeList = async () => {
    try {
      const businessTypeResult: any = await cpmService.getMergeBusinessTypeList();
      if (businessTypeResult.code === 0) {
        const formattedBusinessType = businessTypeResult.data.reduce((acc: any, item: any) => {
          acc[item.value] = item.bizType;
          return acc;
        }, {});
        setBusinessType(formattedBusinessType);
      } else {
        console.error('Failed to fetch business types:', businessTypeResult.msg);
      }
    } catch (error) {
      console.error('Error fetching business types:', error);
    }
  };

  useEffect(() => {
    //获取城市接口
    handleCityList();
    handleTaskName();
    handleInferAlgVsnList();
    handleEvalAlgVsnList();

    getMergeBusinessTypeList();

    let bt = 'cross';
    if (changeBusinessValue) {
      bt = businessType[changeBusinessValue];
    }

    handleGetTmsFieldsList(bt);
  }, []);

  useEffect(() => {
    let bt = 'cross';
    if (changeBusinessValue) {
      bt = businessType[changeBusinessValue];
    }
    handleGetTmsFieldsList(bt);
  }, [changeBusinessValue]);

  const handleCityList = async () => {
    try {
      const result: any = await cpmService.retrieveDimCity();

      let city = result.data.filter((obj: any, index: any) => {
        return result.data.findIndex((item: any) => item.cityName === obj.cityName) === index;
      });

      let cityList = city
        .map((obj: {cityOrder: string}) => ({
          ...obj,
          cityOrder: parseInt(obj.cityOrder),
        }))
        .sort((a: any, b: any) => a.cityOrder - b.cityOrder);

      setCityName(
        cityList.map((item: any) => ({
          label: item.cityName + '-' + item.provName,
          value: item.cityName,
        })),
      );
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };

  const handleTaskName = async () => {
    try {
      const result: any = await cpmService.retrieveTaskNameList();
      debugger
      setTaskNameOption(
        result.data.map((item: any) => ({
          label: item.subtaskName,
          value: item.subtaskId,
        })),
      );
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };

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

  const handleEvalAlgVsnList = async () => {
    try {
      const result: any = await cpmService.retrieveEvalAlgVsnList();
      setEvalAlgVsnListOp(
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

  const filterCityOption = (input: string, option?: {label: string; value: string}) =>
    (option?.label ?? '').includes(input);

  const handleGetTmsFieldsList = async (pipelineType: string) => {
    try {
      const result: any = await cpmService.retrieveGetTmsFieldsList(pipelineType);
      if (result.data) {
        setCrossTmsFields(JSON.parse(result.data));
      } else {
        setCrossTmsFields([]);
      }
    } catch (error) {
      setCrossTmsFields([]);
      console.log(error);
    }
  };

  function switchItem(item: any) {
    let type = item.type;
    switch (type) {
      case 'text':
        return <Input style={{width: 150}} />;
      case 'select':
        return (
          <Select style={{width: 150}} allowClear>
            {item.value.map((option: any, index: any) => {
              return (
                <Select.Option key={index} value={option.value}>
                  {option.name}
                </Select.Option>
              );
            })}
          </Select>
        );
      default:
        return <Input />;
    }
  }
  return (
    <Modal
      width={1000}
      title={title}
      onOk={handleCreate}
      onCancel={handleCancel}
      open={visible}
      okButtonProps={{loading}}
    >
      <Form form={form}>
        <MergeBusinessType
          businessModel={false}
          city={false}
          required={true}
          changeBusiness={(e) => {
            setChangeBusinessValue(e);
            form2.resetFields(); // 切换时清空输入框
            if (e == 1) {
              form.setFieldValue("projectIdList", "路口生产项目");
            } else if (e == 2) {
              form.setFieldValue("projectIdList", "分合流口生产项目");
            } else if (e == 3) {
              form.setFieldValue("projectIdList", "PSP众包生产项目");
            } else if (e == 4) {
              form.setFieldValue("projectIdList", "PN众包生产项目");
            }
            // form.setFieldValue("projectName", "123");
            // let vars = form.getFieldsValue();
            // vars.projectId = "10068";
            // form.setFieldsValue(vars);
          }}
        ></MergeBusinessType>
        {/* <Form.Item label="融合任务名称" name="taskName" rules={[{ required: true, message: '请输入融合任务名称' }]}>
          <Select mode="tags" options={taskNameOption} placeholder="请选择" allowClear></Select>
        </Form.Item> */}
        <Form.Item label="融合任务名称" name="subtaskName" rules={[{ required: true, message: '请输入融合任务名称' }]}>
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item label="任务描述" name="subtaskDesc">
          <Input placeholder="请输入"></Input>
        </Form.Item>

        <Divider orientation="left" plain dashed>
          任务范围
        </Divider>
        <Flex wrap="wrap">
          <Space>
            <ProjectMultiSelect required={true} changeBusiness={changeBusinessValue}></ProjectMultiSelect>
            <Form.Item label="城市" name="cityList">
              <Select
                mode="multiple"
                showSearch
                options={cityName}
                placeholder="请选择"
                allowClear
                filterOption={filterCityOption}
                style={{width: '150px'}}
              ></Select>
            </Form.Item>
            <Form.Item label="批次ID" name="batchList">
              <Input placeholder="请输入" disabled={disabled}></Input>
            </Form.Item>
            <Form.Item label="路口类型" name="crossTypeList">
              <Select
                style={{width: '160px'}}
                mode="multiple"
                options={crossTypeOption}
                placeholder="请选择"
                allowClear
              ></Select>
            </Form.Item>
          </Space>
          <Space>
            <Form.Item label="推理算法版本" name="inferAlgVsn">
              <Select style={{width: '260px'}} options={inferAlgVsnOp} placeholder="请选择" allowClear></Select>
            </Form.Item>
          </Space>
          <Space>
            <Form.Item label="打分任务id" name="inferevalTaskId">
              <Input placeholder="请输入" disabled={disabled}></Input>
            </Form.Item>
          </Space>
          <Space>
            <Form.Item label="刷库任务id" name="batchMappingTaskIds">
              <Input style={{width: '200px'}} placeholder="请输入" disabled={disabled}></Input>
            </Form.Item>
          </Space>
        </Flex>
        <Form.Item label="建图实体ID" name="crossIdList">
          <Input.TextArea placeholder="请输入" rows={2}></Input.TextArea>
        </Form.Item>
        {changeBusinessValue === 1 && (
          <>
            <Divider orientation="left" plain dashed>
              任务筛选
            </Divider>
            <Form form={form3}>
              <Space align="baseline">
                <Form.Item name="useCompare" valuePropName="checked">
                  <Checkbox disabled={disabled}>是否启用推理比较</Checkbox>
                </Form.Item>
                <Form.Item label="对比后数据筛选模式" name="compareSelectType">
                  <Select
                    style={{width: '300px'}}
                    options={modalNameOption}
                    placeholder="请选择"
                    allowClear
                  ></Select>
                </Form.Item>
              </Space>
            </Form>
            <Flex wrap="wrap">
              <Space>
                <Form.Item label="base融合任务" name="baseTask">
                  <Select style={{width: '300px'}} options={taskNameOption} placeholder="请选择" allowClear></Select>
                </Form.Item>
                <Form.Item label="推理打分算法版本" name="evalAlgVsn">
                  <Select style={{width: '300px'}} options={evalAlgVsnListOp} placeholder="请选择" allowClear></Select>
                </Form.Item>
              </Space>
            </Flex>
            <Flex wrap="wrap">
              <Space>
                <Form.Item label="base版本准出但新版本未准出的路径数量<=" name="baseValidRouteNum">
                  <Input placeholder="请输入" disabled={disabled}></Input>
                </Form.Item>
                <Form.Item label="base版本准出但新版本未准出路径数量占比<=" name="baseValidRouteRate">
                  <Input placeholder="请输入" disabled={disabled}></Input>
                </Form.Item>
              </Space>
            </Flex>
            <Flex wrap="wrap">
              <Space>
                <Form.Item label="新版本准出但base版本未准出的路径数量>=" name="curValidRouteNum">
                  <Input placeholder="请输入" disabled={disabled}></Input>
                </Form.Item>
                <Form.Item label="新版本准出但base版本未准出路径数量占比>=" name="curValidRouteRate">
                  <Input placeholder="请输入" disabled={disabled}></Input>
                </Form.Item>
              </Space>
            </Flex>
          </>
        )}
      </Form>
      <Form form={form2}>
        <Divider orientation="left" plain dashed>
          融合配置
        </Divider>

        <Flex wrap="wrap">
          {crossTmsFields.length > 0 &&
            crossTmsFields.map((item: any, index: any) => {
              return (
                <Space style={{ margin: '0 20px ' }} key={index}>
                  <Form.Item key={index} name={item.name} label={item.desc} rules={[{ required: item.required }]}>
                    {switchItem(item)}
                  </Form.Item>
                </Space>
              );
            })}
        </Flex>
      </Form>
    </Modal>
  );
};
