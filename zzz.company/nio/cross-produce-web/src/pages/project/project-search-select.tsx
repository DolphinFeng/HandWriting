import {Form, Input, Select, message} from 'antd';
import {throttle} from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import {cpmService} from '../../services/cpw-service';
import {SelectOption} from '../../models/antd';

export const ProjectSearchSelect = ({required}: {required?: boolean}) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [select_type, setSelectType] = useState<'id' | 'name'>('id');

  const handleSearch = async (value?: string) => {
    try {
      const ret = await cpmService.retrieveProjectList({
        startIndex: 0,
        pageSize: 100,
        projectName: value,
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

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <>
      <Select
        style={{width: '120px'}}
        value={select_type}
        options={[
          {label: '项目ID', value: 'id'},
          {label: '项目名称', value: 'name'},
        ]}
        onSelect={setSelectType}
      ></Select>
      {select_type === 'id' && (
        <Form.Item label="项目ID" name="projectId" rules={[{required: required}]}>
          <Input placeholder="请输入" allowClear></Input>
        </Form.Item>
      )}
      {select_type === 'name' && (
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
      )}
    </>
  );
};
