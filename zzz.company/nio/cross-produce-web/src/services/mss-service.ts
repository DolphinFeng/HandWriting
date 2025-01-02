import axios from 'axios';
import {Client} from '../libs/client';
import {CrossInList, CrossListQuery} from '../models/cross';
import {MSSListResponse} from '../models';

const DOMAIN_MAP: {[key: string]: string} = {
  'cross-produce-web-dev.nioint.com': 'http://nmap-mss.tencent-dev.nioint.com',
  'cross-produce-web.idc-uat.nioint.com': 'http://nmap-mss.idc-stg.nioint.com',
  'cross-produce-web-stg.nioint.com': 'http://nmap-mss.idc-stg.nioint.com',
  'cross-produce-web.idc-prod.nioint.com': 'http://nmap-mss.idc-prod.nioint.com',
};

let Domain = 'http://nmap-mss.idc-stg.nioint.com';

if (process.env.NODE_ENV === 'production') {
  Domain = DOMAIN_MAP[window.location.hostname];
}

/**
 * CPM Service
 * http://nmap-mss.idc-stg.nioint.com
 */
class MSSService {
  client = new Client(Domain, {underscoreRequestData: false});

  constructor() {}

  /**
   * 获取路口列表
   */
  retrieveIntersectionList(payload: CrossListQuery) {
    return this.client.post<MSSListResponse<CrossInList>>('/mss/site/list', payload);
  }

  /**
   * 下载路口数据
   */
  async downloadIntersectionData(payload: Omit<CrossListQuery, 'pageNo' | 'pageSize' | 'types'>) {
    const ret = await axios.post<string | {msg: string}>(`${Domain}/mss/site/export`, payload);

    if (ret.status === 200) {
      if (typeof ret.data === 'string') {
        return ret.data;
      }

      throw new Error(ret.data.msg);
    } else {
      throw new Error('下载失败');
    }
  }
}

export const mssService = new MSSService();
