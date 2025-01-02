import {Form, Select, message, Input} from 'antd';
import {throttle} from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import {cpmService} from '../../services/cpw-service';
import {SelectOption} from '../../models/antd';

export const ProjectMultiSelect = ({
  required,
  projectIdShow,
  changeBusiness,
}: {
  required?: boolean;
  projectIdShow?: any;
  changeBusiness?: number;
}) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isShow, setIsShow] = useState(false);
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
  const handleProjectSelectChange = (e: any) => {
    if (e !== '' && e !== undefined) {
      setIsShow(true);
    } else {
      setIsShow(false);
    }
  };
  useEffect(() => {
    handleSearch();
  }, [changeBusiness]);

  return (
    <>
      <Form.Item label="项目名称" name="projectIdList" rules={[{ required: required }]}>
        <Select
          style={{width: '200px'}}
          showSearch
          options={options}
          placeholder="请选择"
          allowClear
          filterOption={false}
          onSearch={throttleSearch}
          onChange={handleProjectSelectChange}
          mode="multiple"
        ></Select>
      </Form.Item>
      {isShow && projectIdShow && (
        <Form.Item label="项目ID" name="projectId" rules={[{required: required}]}>
          <Input allowClear style={{width: '200px'}}></Input>
        </Form.Item>
      )}
    </>
  );
};
