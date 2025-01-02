import {Form, Input, Select, message} from 'antd';
import {throttle} from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import {cpmService} from '../../services/cpw-service';
import {SelectOption} from '../../models/antd';

export const BatchSearchSelect = ({
  required,
  changeBusiness,
}: {
  required?: boolean;
  changeBusiness?: number | undefined;
}) => {
  const [batchOptions, setBatchOptions] = useState<SelectOption[]>([]);
  const [options, setOptions] = useState<SelectOption[]>([]);
  // const [select_type, setSelectType] = useState<'batchId' | 'batchName' |'projectId' |'projectName'>('projectId');
  const [isBatchDisabled, setIsBatchDisabled] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const handleBatchSearch = async (value?: string) => {
    try {
      const ret = await cpmService.retrieveBatchList({
        pageNo: 1,
        pageSize: 100,
        projectName: value,
        businessType: changeBusiness,
      });
      setBatchOptions(
        ret.data.map((item) => ({
          label: item.batchName,
          value: item.batchId,
        })),
      );
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    }
  };

  const throttleBatchSearch = useCallback(throttle(handleBatchSearch, 1600, {leading: false}), []);

  useEffect(() => {
    if (changeBusiness != null) {
      handleBatchSearch();
      handleSearch();
    }
  }, [changeBusiness]);

  const handleSearch = async (value?: string) => {
    try {
      const ret = await cpmService.retrieveProjectList({
        startIndex: 0,
        pageSize: 100,
        projectName: value,
        businessType: changeBusiness,
      });

      setOptions(
        ret.data.map((item) => ({
          label: item.projectName,
          value: item.projectId,
        })),
      );
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    }
  };

  const throttleSearch = useCallback(throttle(handleSearch, 1600, {leading: false}), []);

  const handleBatchInputChange = (e: any) => {
    if (e.target.value !== '') {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  };

  const handleBatchSelectChange = (e: any) => {
    if (e !== '' && e !== undefined) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  };

  const handleProjectInputChange = (e: any) => {
    if (e.target.value !== '') {
      setIsBatchDisabled(true);
    } else {
      setIsBatchDisabled(false);
    }
  };
  const handleProjectSelectChange = (e: any) => {
    if (e !== '' && e !== undefined) {
      setIsBatchDisabled(true);
    } else {
      setIsBatchDisabled(false);
    }
  };

  return (
    <>
      {/* <Select
        style={{width: '120px'}}
        value={select_type}
        options={[
          {label: '项目ID', value: 'projectId'},
          {label: '项目名称', value: 'projectName'},
          {label: '批次ID', value: 'batchId'},
          {label: '批次名称', value: 'batchName'},
        ]}
        onSelect={setSelectType}
      ></Select>
      {select_type === 'batchId'  && (
        <Form.Item label="批次ID" name="batchId" rules={[{required: required}]}>
          <Input placeholder="请输入" allowClear></Input>
        </Form.Item>
      )}
      {select_type === 'batchName' && (
        <Form.Item label="批次名称" name="batchId" rules={[{required: required}]}>
          <Select
            showSearch
            options={batchOptions}
            placeholder="请选择"
            allowClear
            filterOption={false}
            onSearch={throttleBatchSearch}
            style={{width: '200px'}}
          ></Select>
        </Form.Item>
      )}
       {select_type === 'projectId' && (
        <Form.Item label="项目ID" name="projectId" rules={[{required: required}]}>
          <Input placeholder="请输入" allowClear ></Input>
        </Form.Item>
      )}
      {select_type === 'projectName' && (
        <Form.Item label="项目名称" name="projectId" rules={[{required: required}]}>
          <Select
            style={{width: '200px'}}
            showSearch
            options={options}
            placeholder="请选择"
            allowClear
            filterOption={false}
            onSearch={throttleSearch}
          ></Select>
        </Form.Item>
      )} */}

      <Form.Item label="项目ID" name="projectId" rules={[{required: required}]}>
        <Input placeholder="请输入" allowClear disabled={isDisabled} onChange={handleProjectInputChange}></Input>
      </Form.Item>
      <Form.Item label="项目名称" name="projectId" rules={[{required: required}]}>
        <Select
          disabled={isDisabled}
          style={{width: '200px'}}
          showSearch
          options={options}
          placeholder="请选择"
          allowClear
          filterOption={false}
          onSearch={throttleSearch}
          onChange={handleProjectSelectChange}
        ></Select>
      </Form.Item>
      <Form.Item label="批次ID" name="batchId" rules={[{required: required}]}>
        <Input placeholder="请输入" allowClear onChange={handleBatchInputChange} disabled={isBatchDisabled}></Input>
      </Form.Item>
      {/* <Form.Item label="批次名称" name="batchName" rules={[{ required: required }]}>
        <Select
          showSearch
          options={batchOptions}
          placeholder="请选择"
          allowClear
          filterOption={false}
          onSearch={throttleBatchSearch}
          style={{ width: '200px' }}
          onChange={handleBatchSelectChange}
          disabled={isBatchDisabled}
        ></Select>
      </Form.Item> */}
    </>
  );
};