import {Button, DatePicker, Form, Input, Select, Space, Table, message} from 'antd';
import {useEffect, useState} from 'react';
import {cpmService} from '../../services/cpw-service';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import {DOMAIN_MAP} from '../../services/cpw-service';
/**
 * 登陆回调页面
 */
export const Login = () => {
  const [href, setHref] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    getURL();
    // console.log(href);
  }, []);

  const getURL = async function () {
 
    let url = window.location.href;
    try {
      if (url.indexOf('code') !== -1) {
        let arr = url.split('=');
        let result = arr[1].split('#')[0];
        setHref(result);
        let Data = null;
        let Domain = DOMAIN_MAP[window.location.hostname]
        Data = await axios.get(
          Domain+ '/cross-produce-management/user/oauth2/authorize/callback?code=' +
            result,
        );

        const cookies = document.cookie.split(';').reduce((prev: any, curr: any) => {
          const [k, v] = curr.split('=');
          prev[k.trim()] = v;
          return prev;
        }, {});
        let userName = cookies['userName4Cross'];

        navigate('/project-management/batch/list?userName=' + userName);
      } else {
        navigate('/project-management/batch/list');
      }
    } catch (error:any) {
      message.error(error.message);
    }
   
  };

  return (
    <div>
      <h1>加载中...</h1>
    </div>
  );
};
