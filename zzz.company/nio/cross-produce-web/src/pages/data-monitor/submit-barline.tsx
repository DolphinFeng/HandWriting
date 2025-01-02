import {useEffect, useRef, useState} from 'react';
import {barChart, barChart2} from './submit-charts';
import {Button, Form, Space, Table, message, Tooltip, Radio, RadioChangeEvent} from 'antd';
import {useLocation, useNavigate} from 'react-router-dom';
import {cpmService} from '../../services/cpw-service';
import {GetCityCrossNumList, GetCityCrossNumQuery} from '../../models';
import * as echarts from 'echarts';
export const SubmitBarLine = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<GetCityCrossNumList[]>([]); // 项目列表

  type SearchParams = GetCityCrossNumQuery;
  const phase_barline_ref = useRef<HTMLDivElement>(null);
  const phase_barline2_ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useEffect(() => {
    if (phase_barline_ref.current) {
      let chart = echarts.getInstanceByDom(phase_barline_ref.current);
      if (chart === undefined) {
        getAllList();
      }
    }
  }, [phase_barline_ref.current]);
  useEffect(() => {
    if (phase_barline2_ref.current) {
      let chart = echarts.getInstanceByDom(phase_barline2_ref.current);
      if (chart === undefined) {
        getWishList();
      }
    }
  }, [phase_barline2_ref.current]);

  const getAllList = async () => {
    try {
      const ret = await cpmService.retrieveGetCityCrossNum({bizType: location.state.bizType});
      let createData: (number | undefined)[] = [];
      let mergeData: (number | undefined)[] = [];
      let yData: (string | undefined)[] = [];

      let result = ret.data;
      if (result.length > 0) {
        let res = result.sort((a: any, b: any) => a.createCrossNum - b.createCrossNum);
        res.forEach((item) => {
          createData.push(item.createCrossNum);
          mergeData.push(item.mergeCrossNum);
          yData.push(item.cityName);
        });
        barChart(createData, mergeData, yData);
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    }
  };

  const getWishList = async () => {
    try {
      const ret = await cpmService.retrieveGetCityCrossNum({projectId: 10003, bizType: location.state.bizType});
      let createData: (number | undefined)[] = [];
      let mergeData: (number | undefined)[] = [];
      let yData: (string | undefined)[] = [];

      let result = ret.data;
      if (result.length > 0) {
        let res = result.sort((a: any, b: any) => a.createCrossNum - b.createCrossNum);
        res.forEach((item) => {
          createData.push(item.createCrossNum);
          mergeData.push(item.mergeCrossNum);
          yData.push(item.cityName);
        });
        barChart2(createData, mergeData, yData);
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.message);
    }
  };
  return (
    <div>
      <div style={{textAlign: 'right', marginBottom: '10px'}}>
        <Button
          type="primary"
          onClick={() => {
            navigate('/data-monitor/submitProgress');
          }}
        >
          返回
        </Button>
      </div>
      <div style={{fontSize: '20px', color: '#1677FF', background: '#fff'}}>分城市交付量排名</div>

      <div style={{display: 'flex', width: '100%', marginTop: '20px', background: '#fff'}}>
        <div style={{width: '50%', height: '1000px'}}>
          <div style={{textAlign: 'left', fontSize: '18px', margin: '20px'}}>全量路口交付量级分布（实体）</div>
          <div id="barchart" style={{width: '95%', height: '900px'}} ref={phase_barline_ref}></div>
        </div>
        <div style={{width: '50%', height: '1000px'}}>
          <div style={{textAlign: 'left', fontSize: '18px', margin: '20px'}}>心愿单相关交付量级分布（实体）</div>
          <div id="barchart2" style={{width: '95%', height: '900px'}} ref={phase_barline2_ref}></div>
        </div>
      </div>
    </div>
  );
};
