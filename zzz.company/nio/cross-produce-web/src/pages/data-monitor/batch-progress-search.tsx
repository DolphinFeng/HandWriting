import {Form, Input, Select, message} from 'antd';
import {throttle} from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import {cpmService} from '../../services/cpw-service';
import {SelectOption} from '../../models/antd';

export const BatchProgressSelect = ({ required, changeProjectId }: { required?: boolean; changeProjectId?: number }) => {
  const [batchOptions, setBatchOptions] = useState<SelectOption[]>([]);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isBatchDisabled, setIsBatchDisabled] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [cityName, setCityName] = useState();

  useEffect(() => {
    handleBatchSearch();
    handleCityList();
    handleSearch();
  }, [changeProjectId]);
  const handleBatchSearch = async (value?: string) => {
    try {
      const ret = await cpmService.retrieveBatchList({
        pageNo: 1,
        pageSize: 100,
        projectName: value,
        projectId: changeProjectId,
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

  const handleSearch = async (value?: string) => {
    try {
      const ret = await cpmService.retrieveProjectList({
        startIndex: 0,
        pageSize: 100,
        projectName: value,
        projectId: changeProjectId,
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

  const handleBatchInputChange = (e: any) => {
    // console.log(e)
    // if (e.target.value !== '') {
    //   setIsDisabled(true);
    // } else {
    //   setIsDisabled(false);
    // }
  };

  const handleBatchSelectChange = (e: any) => {
    // console.log(e)
    // if (e.length>0 && e !== undefined) {
    //   setIsDisabled(true);
    // } else {
    //   setIsDisabled(false);
    // }
  };

  const handleProjectInputChange = (e: any) => {
    // if (e.target.value !== '') {
    //   setIsBatchDisabled(true);
    // } else {
    //   setIsBatchDisabled(false);
    // }
  };
  const handleProjectSelectChange = (e: any) => {
    // if (e !== '' && e !== undefined) {
    //   setIsBatchDisabled(true);
    // } else {
    //   setIsBatchDisabled(false);
    // }
  };

  const filterCityOption = (input: string, option?: {label: string; value: string}) =>
    (option?.label ?? '').includes(input);

  const cityLevel = [
    {
      value: 1,
      label: 'TOP30城市',
    },
    {
      value: 2,
      label: 'TOP30-50城市',
    },
    {
      value: 3,
      label: 'TOP50-100城市',
    },
    {
      value: 4,
      label: '其他城市',
    },
  ];

  return (
    <>
      <Form.Item label="项目ID" name="projectId" rules={[{ required: required }]}>
        <Input placeholder="请输入" allowClear disabled={isDisabled} onChange={handleProjectInputChange} defaultValue={changeProjectId}></Input>
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
          defaultValue={changeProjectId}
        ></Select>
      </Form.Item>
      <Form.Item label="批次ID" name="batchIdList" rules={[{required: required}]}>
        <Input placeholder="请输入" allowClear onChange={handleBatchInputChange} disabled={isBatchDisabled}></Input>
      </Form.Item>
      <Form.Item label="批次名称" name="batchNameList" rules={[{ required: required }]}>
        <Select
          mode="multiple"
          showSearch
          options={batchOptions}
          placeholder="请选择"
          allowClear
          filterOption={false}
          onSearch={throttleBatchSearch}
          style={{width: '200px'}}
          onChange={handleBatchSelectChange}
          disabled={isBatchDisabled}
        ></Select>
      </Form.Item>
      <Form.Item label="城市" name="cityNameList" rules={[{required: required}]}>
        <Select
          mode="multiple"
          showSearch
          options={cityName}
          placeholder="请选择"
          allowClear
          filterOption={filterCityOption}
          style={{width: '200px'}}
        ></Select>
      </Form.Item>
      <Form.Item label="TOP城市" name="cityLevel" rules={[{required: required}]}>
        <Select showSearch options={cityLevel} placeholder="请选择" allowClear style={{width: '200px'}}></Select>
      </Form.Item>
    </>
  );
};
