import {Form, Cascader, Select, message} from 'antd';
import {throttle} from 'lodash';
import {createContext, useCallback, useEffect, useState} from 'react';
import {cpmService} from '../services/cpw-service';
import {SelectOption} from '../models/antd';
import {DefaultOptionType} from 'antd/es/cascader';
import {usePageFns} from '../hooks';
//产线、产线模式、城市 子组件
export const MergeBusinessType = ({
  required,
  businessModel,
  city,
  changeBusiness,
  businessDisabled,
  businessRampDisabled,
  pnpspDisabled,
  modeDisabledType,
  changeMode,
}: {
  required?: boolean;
  businessModel: boolean;
  city: boolean;
  businessDisabled?: boolean;
  pnpspDisabled?: boolean;
  businessRampDisabled?: boolean;
  modeDisabledType?: String;
  changeBusiness?: (e: any) => void;
  changeMode?: (e: any) => void;
}) => {
  const [cityName, setCityName] = useState([]);
  //const [modelName, setModelName] = useState();
  const [businessType, setBusinessType] = useState();
  const [modeDisabled, setModeDisabled] = useState(true);
  const [cascaderValue, setCascaderValue] = useState();

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

      let cityResult = mergeCity(cityList);
      setCityName(cityResult);
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };

  function mergeCity(city: any) {
    let cityResult: any = [];
    city.forEach((item: any) => {
      const index = cityResult.findIndex((cityItem: any) => cityItem.value === item.provName);
      if (index > -1) {
        cityResult[index].children.push({value: item.cityName, label: item.cityName});
      } else {
        cityResult.push({
          label: item.provName,
          value: item.provName,
          children: [{value: item.cityName, label: item.cityName}],
        });
      }
    });
    return cityResult;
  }

  const getMergeBusinessTypeList = async () => {
    try {
      const businessTypeResult: any = await cpmService.getMergeBusinessTypeList();
      let businessResult = businessTypeResult.data.map((item: any) => {
        if (pnpspDisabled) {
          if (item.value == 3 || item.value == 4) {
            return {
              label: item.name,
              value: item.value,
              disabled: true,
            };
          } else {
            return {
              label: item.name,
              value: item.value,
            };
          }
        } else {
          return {
            label: item.name,
            value: item.value,
          };
        }
      });

      if (businessRampDisabled) {
        businessResult.forEach((element: any, index: any) => {
          if (element.value !== 2) {
            businessResult[index]['disabled'] = true;
          }
        });
        setModeDisabled(false);
      }
      setBusinessType(businessResult);

      // setBusinessType()
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
  };

  const businessTypeChange = (e: any) => {
    if (e !== '' && e == 2) {
      setModeDisabled(false);
    } else {
      setModeDisabled(true);
    }

    if (changeBusiness) {
      changeBusiness(e);
    }
  };

  const onCascaderChange = (val: any) => {
    let value: any[][] = [];
    val.forEach((item: any) => {
      value.push([item[item.length - 1]]);
    });
    //@ts-ignore
    setCascaderValue(value);
  };

  useEffect(() => {
    handleCityList();
    //getModeList();
    getMergeBusinessTypeList();
  }, []);

  const filter = (inputValue: string, path: DefaultOptionType[]) =>
    path.some((option) => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

  const changeModeType = (e: any) => {
    if (changeMode) {
      changeMode(e);
    }
  };
  return (
    <>
      <Form.Item label="融合产线" name="businessType" rules={[{required}]}>
        <Select
          placeholder="请选择"
          style={{width: '200px'}}
          allowClear
          options={businessType}
          onChange={businessTypeChange}
          disabled={businessDisabled}
        ></Select>
      </Form.Item>
      {/* {businessModel && (
        <Form.Item label="产线模式" name="batchMode">
          <Select
            placeholder="请选择"
            style={{width: '200px'}}
            allowClear
            options={modelName}
            disabled={modeDisabled}
            onChange={changeModeType}
          ></Select>
        </Form.Item>
      )} */}

      {city && (
        <Form.Item label="城市" name="cityNameList">
          <Cascader
            multiple
            value={cascaderValue}
            maxTagCount={2}
            options={cityName}
            showCheckedStrategy={Cascader.SHOW_CHILD}
            placeholder="请选择"
            style={{width: '200px'}}
            showSearch={{filter}}
            onChange={onCascaderChange}
          ></Cascader>
        </Form.Item>
      )}
    </>
  );
};
