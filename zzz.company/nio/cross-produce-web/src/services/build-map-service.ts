import axios from 'axios';
import {Client} from '../libs/client';
import {ListResponse} from '../models';
import {components} from '../models/openapi-build-map';

type DemandInfoQuery = components['schemas']['DemandInfoQuery'];

export const DOMAIN_MAP: {[key: string]: string} = {
  'cross-produce-web-dev.nioint.com': 'http://produce-demand-management.idc-dev.nioint.com',
  'cross-produce-web.idc-uat.nioint.com': 'http://produce-demand-management.idc-dev.nioint.com',
  'cross-produce-web-stg.nioint.com': 'http://produce-demand-management.idc-stg.nioint.com',
  'cross-produce-web.idc-prod.nioint.com': 'http://produce-demand-management.idc-prod.nioint.com',
  'cross-produce-web.nioint.com': 'http://produce-demand-management.idc-prod.nioint.com',
};

let Domain = DOMAIN_MAP[window.location.hostname];
if (!Domain) Domain = 'http://produce-demand-management.idc-dev.nioint.com';

//本地调试
if (window.location.port == '3000') {
  Domain = 'http://produce-demand-management.idc-dev.nioint.com';
}

class BuildMapService {
  client = new Client(Domain, {underscoreRequestData: false});

  constructor() {}

  getSiteById(siteId: string) {
    return this.client.get<components['schemas']['ResponseVo«SiteInfo»']>(
      `/produce-demand-management/site/byId/${siteId}`
    );
  }

  createSite(payload: components['schemas']['SiteCreateReq']) {
    return this.client.post<components['schemas']['ResponseVo«SiteInfo»']>(
      '/produce-demand-management/site/create',
      payload
    );
  }

  deleteSite(siteId: string) {
    return this.client.get<components['schemas']['ResponseVo«SiteInfo»']>(
      '/produce-demand-management/site/delete',
      {
        params: {
          siteId
        }
      }
    );
  }

  deleteSitePost(siteId: string) {
    return this.client.post<components['schemas']['ResponseVo«SiteInfo»']>(
      '/produce-demand-management/site/delete',
      {
        params: {
          siteId
        }
      }
    );
  }

  getSiteOptLog(logId: number) {
    return this.client.get<components['schemas']['ResponseVo«object»']>(
      `/produce-demand-management/site/optlog/byId/${logId}`
    );
  }

  querySiteOptLog(payload: components['schemas']['SiteOptLogQuery']) {
    return this.client.post<components['schemas']['PageVo«SiteOptLog»']>(
      '/produce-demand-management/site/optlog/query',
      payload
    );
  }

  querySite(payload: components['schemas']['场景查询条件实体类']) {
    return this.client.post<components['schemas']['PageVo«SiteInfo»']>(
      '/produce-demand-management/site/query',
      payload
    );
  }

  querySiteList(payload: components['schemas']['场景查询条件实体类']) {
    return this.client.post<components['schemas']['PageVo«SiteInfo»']>(
      '/produce-demand-management/site/queryList',
      payload
    );
  }

  queryRoute(payload: components['schemas']['RouteInfoQuery']) {
    return this.client.post<components['schemas']['PageVo«RouteInfo»']>(
      '/produce-demand-management/site/queryRoute',
      payload
    );
  }

  updateSite(payload: components['schemas']['SiteUpdateReq']) {
    return this.client.post<components['schemas']['ResponseVo«SiteInfo»']>(
      '/produce-demand-management/site/update',
      payload
    );
  }

  getBizType() {
    return this.client.get<components['schemas']['ResponseVo«Map«string,int»»']>(
      '/produce-demand-management/common/bizType'
    );
  }

  getSiteKind(bizType: number) {
    return this.client.get<components['schemas']['ResponseVo«Map«string,int»»']>(
      `/produce-demand-management/common/siteKind/${bizType}`
    );
  }

  getP2pSiteType() {
    return this.client.get<components['schemas']['ResponseVo«Map«string,int»»']>(
      '/produce-demand-management/common/p2pSiteType'
    );
  }

  getSiteStatus() {
    return this.client.get<components['schemas']['ResponseVo«Map«string,int»»']>(
      '/produce-demand-management/common/siteStatus'
    );
  }

  getSiteType(bizType: number) {
    return this.client.get<components['schemas']['ResponseVo«Map«string,int»»']>(
      `/produce-demand-management/common/siteType/${bizType}`
    );
  }

  queryDemand(payload: components['schemas']['DemandInfoQuery']) {
    return this.client.post<components['schemas']['PageVo«DemandInfo»']>(
      '/produce-demand-management/demand/query',
      payload
    );
  }

  getRouteDirection() {
    return this.client.get<components['schemas']['ResponseVo«Map«string,int»»']>(
      '/produce-demand-management/common/routeDirection'
    );
  }

  getDemandType(bizType: number) {
    return this.client.get<components['schemas']['ResponseVo«Map«string,int»»']>(
      `/produce-demand-management/common/demandType/${bizType}`
    );
  }

  queryDetail(payload: components['schemas']['DemandDetailQuery']) {
    return this.client.post<components['schemas']['PageVo«DemandDetailVo»']>(
      '/produce-demand-management/demand/queryDetail',
      payload
    );
  }

  queryOptLog(payload: components['schemas']['SiteOptLogQuery']) {
    return this.client.post<components['schemas']['PageVo«SiteOptLog»']>(
      '/produce-demand-management/optlog/query',
      payload
    );
  }

  syncMapSite(bizType: number, mapSiteFile: string, name: string, operator: string) {
    return this.client.post<components['schemas']['ResponseVo«int»']>(
      '/produce-demand-management/demand/syncMapSite',
      undefined,
      {
        params: {
          bizType,
          mapSiteFile,
          name,
          operator,
        },
      }
    );
  }

  upsertDemand(payload: components['schemas']['DemandInfoReq']) {
    return this.client.post<components['schemas']['ResponseVo«DemandInfo»']>(
      '/produce-demand-management/demand/upsert',
      payload
    );
  }

  addSites(formData: FormData) {
    return axios.post(`${Domain}/produce-demand-management/demand/addSites`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }


  downloadRoute(payload: components['schemas']['RouteInfoQuery']) {
    return this.client.post<string>(
      '/produce-demand-management/site/downloadRoute',
      payload
    );
  }

  downloadDetail(params: any) {
    return this.client.post('/produce-demand-management/demand/downloadDetail', params, {
      responseType: 'blob',
    });
  }

  getSiteOptLogUsingGET(logId: number) {
    return this.client.get<components['schemas']['ResponseVo«object»']>(
      `/produce-demand-management/optlog/byId/${logId}`
    );
  }

  checkOptLogUsingPOST(payload: components['schemas']['SyncLogCheckReq']) {
    return this.client.post<components['schemas']['ResponseVo«Void»']>(
      '/produce-demand-management/optlog/check',
      payload
    );
  }

  getSiteTypeUsingGET(bizType: number) {
    return this.client.get<components['schemas']['ResponseVo«Map«string,int»»']>(
      `/produce-demand-management/common/siteType/${bizType}`
    );
  }

  downloadList(payload: components['schemas']['场景查询条件实体类']) {
    return this.client.post<string>(
      '/produce-demand-management/site/downloadList',
      payload
    );
  }

  applySyncLogUsingPOST(demandId: number) {
    return this.client.post<components['schemas']['ResponseVo«Void»']>(
      '/produce-demand-management/demand/applySyncLog',
      { demandId },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  verifyPnPspSite(formData: FormData) {
    return axios.post(`${Domain}/produce-demand-management/demand/verifyPnPspSite`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  checkLocationPointUsingGET(locationPoint: string) {
    return this.client.get<components['schemas']['ResponseVo«CheckLocationPointVO»']>(
      '/produce-demand-management/common/checkLocationPoint?locationPoint=' + locationPoint
    );
  }

  getDemandDetailStatusUsingGET() {
    return this.client.get<components['schemas']['ResponseVo«Map«string,int»»']>(
      '/produce-demand-management/common/demandDetailStatus'
    );
  }

  nearbyListUsingPOST(payload: components['schemas']['NearbyListReq']) {
    return this.client.post<components['schemas']['ResponseVo«List«场景实体类»»']>(
      '/produce-demand-management/site/nearbylist',
      payload
    );
  }

  querySyncTaskUsingPOST(payload: components['schemas']['DemandInfoQuery']) {
    return this.client.post<components['schemas']['PageVo«SyncDemandInfoVo»']>(
      '/produce-demand-management/demand/querySyncTask',
      payload
    );
  }
}

export const buildMapService = new BuildMapService();
