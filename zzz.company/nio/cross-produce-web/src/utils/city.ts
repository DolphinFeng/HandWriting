import {message} from 'antd';
import {cpmService} from '../services/cpw-service';
import {useEffect, useState} from 'react';

//将cityNameList转化为只传入 市 给后端
export function convertCityForm(cityNameList: any) {
  let value: any[][] = [];
  if (cityNameList && cityNameList.length > 0 && cityNameList !== undefined) {
    cityNameList.forEach((item: any) => {
      value.push([item[item.length - 1]]);
    });
  }
  return value;
}

export function convertCityForm2(cityNameList: any) {
  let value: any[] = [];
  if (cityNameList && cityNameList.length > 0 && cityNameList !== undefined) {
    cityNameList.forEach((item: any) => {
      value.push(item[item.length - 1]);
    });
  }
  return value;
}

let cityProvList: any[] = [];

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

    cityProvList = cityList;
  } catch (err: any) {
    console.error(err);
    message.error(err.message);
  }
};
//获取全部的省市数据

export function convertCityback(city: any) {
  //  handleCityList();
  let result: any[] = [];
  city &&
    city.forEach((item: string | any[]) => {
      cityProvList.forEach((cityProvItem) => {
        if (item === cityProvItem.cityName) {
          result.push([cityProvItem.provName, cityProvItem.cityName]);
        } else {
        }
      });
    });
  return result;
}
