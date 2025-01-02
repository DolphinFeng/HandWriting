import {Form, Select, message, Input, Button, Modal} from 'antd';
import {throttle} from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import {cpmService} from '../../services/cpw-service';
import {SelectOption} from '../../models/antd';

export const BatchSelect = ({
  required,
  project_id,
  batchIdShow,
  modalOpen,
  changeBusiness,
}: {
  required?: boolean;
  project_id?: number;
  batchIdShow?: any;
  modalOpen?: any;
  changeBusiness?: number;
}) => {
  const [option, setOption] = useState<SelectOption[]>([]);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isShow, setIsShow] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [projectIdValue, setProjectIdValue] = useState('');

  const handleSearch = async (value?: string) => {
    try {
      const ret = await cpmService.retrieveBatchList({
        pageNo: 1,
        pageSize: 1000,
        projectName: '',
        projectId: project_id,
      });

      setOption(
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

  const handleSearchProjectId = async (value?: string) => {
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
  const throttleSearchProjectId = useCallback(throttle(handleSearch, 1600, {leading: false}), []);

  const handleBatchSelectChange = (e: any) => {
    if (e !== '' && e !== undefined) {
      setIsShow(true);
    } else {
      setIsShow(false);
    }
  };

  const filterOption = (input: string, option?: any) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const showModal = () => {
    modalOpen(true);
  };

  useEffect(() => {
    handleSearch();
    handleSearchProjectId();
  }, [project_id, changeBusiness]);

  return (
    <>
      {!batchIdShow && (
        <Form.Item label="批次名称" name="batchId" rules={[{required: required}]}>
          <Form.Item name="batchId" noStyle>
            <Select
              options={option}
              placeholder="请选择"
              allowClear
              onSearch={throttleSearch}
              style={{width: '200px'}}
              onChange={handleBatchSelectChange}
              optionFilterProp="children"
              filterOption={filterOption}
              showSearch
            ></Select>
          </Form.Item>
        </Form.Item>
      )}
        <Form.Item label="项目编号" name="projectId" rules={[{required: required}]}>
          <Select
            style={{width: '200px'}}
            showSearch
            options={options}
            placeholder="请选择"
            allowClear
            filterOption={false}
            onSearch={throttleSearchProjectId}
            onChange={handleBatchSelectChange}
          ></Select>
        </Form.Item>
      {batchIdShow && (
        <Form.Item label="批次编号" name="batchIds">
          <Input.TextArea
            placeholder="请输入以英文逗号分隔的批次编号"
            rows={3}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          ></Input.TextArea>
        </Form.Item>
      )}
      {isShow && batchIdShow && (
        <Form.Item label="批次ID" name="batchId" rules={[{required: required}]}>
          <Input allowClear style={{width: '200px'}}></Input>
        </Form.Item>
      )}
    </>
  );
};
