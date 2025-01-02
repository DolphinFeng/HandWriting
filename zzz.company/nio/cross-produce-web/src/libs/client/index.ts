import axios, {AxiosError, AxiosRequestConfig, AxiosResponse, Method} from 'axios';
import humps from 'humps';
import qs from 'qs';
import {isArray, isObject} from './util';
import {parse as JSONParse} from 'lossless-json';
import { SSO_DOMAIN_MAP } from "../../services/sso-service"
const DEFAULT_OPTIONS = {
  underscoreRequestData: true,
  camelizeResponseData: true,
  dataType: 'json', // json ||
};


export interface Option extends AxiosRequestConfig {
  underscoreRequestData?: boolean;
  camelizeResponseData?: boolean;
  dataType?: string | 'json' | 'form' | 'multipart';
  removeEmptyValue?: boolean;
  defaultRemoveTypeArray?: any[];
  apiURLPrefix?: string;
  eventLog?: any;
}

class ResponseError extends Error {
  result_code: string;
  resultCode: string;
  code: string;
  responsed: boolean;
  config: any;
  constructor(msg: string, code: string, responsed: boolean) {
    super(msg);

    this.result_code = code;
    this.resultCode = code;
    this.code = code;
    this.responsed = responsed;
  }
}

axios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  },
);

/**
 * XClinet
 * 增加了对 19 位的时间戳的支持
 */
export class Client {
  apiURLPrefix: string = '';
  options: Option = {};
  /**
   * @param {String} [apiURLPrefix]
   * @param {Object} [options]
   */
  constructor(apiURLPrefix = '', options = {}) {
    this.apiURLPrefix = apiURLPrefix;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  /**
   * request by GET
   * @param url [string] relative url
   * @param data [object] query data
   * @param options [object] request options
   * @returns {*}
   */
  get<T>(url: string, data?: {}, options?: Option): Promise<T> {
    return this._request(url, 'get', data, options);
  }

  /**
   * request by POST
   * @param url [string] relative url
   * @param data [object] request body
   * @param options [object] request options
   * @returns {*}
   */
  post<T>(url: string, data?: {}, options?: Option): Promise<T> {
    return this._request(url, 'post', data, options);
  }

  /**
   * request by PUT
   * @param url [string] relative url
   * @param data [object] request body
   * @param options [object] request options
   * @returns {*}
   */
  put<T>(url: string, data?: {}, options?: Option): Promise<T> {
    return this._request(url, 'put', data, options);
  }

  /**
   * request by DELETE
   * @param url [string] relative url
   * @param data [object] query data
   * @param options [object] request options
   * @returns {*}
   */
  delete<T>(url: string, data?: {}, options?: Option): Promise<T> {
    return this._request(url, 'delete', data, options);
  }

  // _handleSuccess(o: [{ data: any } | void, any, any]) { }
  // _handleFail(error: { response: any, request: any, config: any }) { }
  // _request(url: string, method: string, data?: {}, options?: Option): Promise<any> { }
  //  }

  // get<T>(url: string, params?: {}, options?: Option): Promise<T> { }
  // post<T>(url: string, data?: {}, options?: Option): Promise<T> { }
  //  }

  createRequestConfig(method: Method, url: string, params: {}, data: {}, options: Option): Option {
    // 将驼峰转换成下划线格式
    if (this._shouldUnderscoreData(options)) {
      params = humps.decamelizeKeys(params || {});
      data = humps.decamelizeKeys(data || {});
    }
    const config: Option = {
      method,
      url,
      params,
      data,
      transformResponse: [
        function transformResponse(data) {
          /*eslint no-param-reassign:0*/
          if (typeof data === 'string') {
            try {
              data = JSONParse(data, (_key: string, value: any) => {
                if (value && value.isLosslessNumber) {
                  if (value.value.length < 19) {
                    return Number(value.value);
                  }

                  return value.value;
                }
                return value;
              });
            } catch (e) {
              /* Ignore */
            }
          }

          return data;
        },
      ],
      ...options,
    };
    return config;
  }

  //   删除空值
  removeEmptyValue<T = any>(data: T, options: Option = {}): T {
    const {removeEmptyValue = true, defaultRemoveTypeArray = [null, undefined, NaN]} = options;
    let rmTypeArray: any[] = [];
    if (removeEmptyValue) {
      rmTypeArray = ['', ...defaultRemoveTypeArray];
    } else {
      rmTypeArray = defaultRemoveTypeArray;
    }
    if (isArray(data)) {
      // eslint-disable-next-line no-param-reassign
      data = data.reduce((r, val) => {
        if (!rmTypeArray.includes(val)) {
          // eslint-disable-next-line no-param-reassign
          r.push(val);
        }
        return r;
      }, []);
    } else if (isObject(data)) {
      // eslint-disable-next-line no-param-reassign
      // @ts-ignore
      data = Object.keys(data).reduce(
        (r, key) => {
          // @ts-ignore
          const val = data[key];
          if (!rmTypeArray.includes(val)) {
            // eslint-disable-next-line no-param-reassign
            r[key] = val;
          }
          return r;
        },
        {} as {[key: string]: any},
      );
    }
    return data;
  }

  async _request(url: string, method: Method, data?: {}, options: Option = {}): Promise<any> {
    // eslint-disable-next-line no-param-reassign
    method = method.toUpperCase() as Method;
    let query = {};
    let body = {};

    // eslint-disable-next-line default-case
    switch (method) {
      case 'GET':
      case 'DELETE':
        // @ts-ignore
        query = data;
        break;
      case 'PUT':
      case 'POST':
        // @ts-ignore
        body = data;
        break;
    }
    const apiURLPrefix = options?.apiURLPrefix || this.apiURLPrefix;
    const config = this.createRequestConfig(method, `${apiURLPrefix}${url}`, query, body, options);
    config.params = this.removeEmptyValue(config.params, options);
    config.data = this.removeEmptyValue(config.data, options);
    const dataType = options.dataType || this.options.dataType;

    if (dataType === 'json') {
      config.headers = {
        ...(config.headers || {}),
        'Content-Type': 'application/json',
      };
    }
    if (dataType === 'form') {
      config.headers = {
        ...(config.headers || {}),
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      config.data = qs.stringify(config.data);
    }
    if (dataType === 'multipart') {
      config.headers = {
        ...(config.headers || {}),
        'Content-Type': 'multipart/form-data',
      };
    }
    if (config.data && isObject(config.data) && !Object.keys(config.data).length) {
      delete config.data;
    }

    try {
      const resp = await axios(config);
      const {eventLog} = options;
      return this._handleSuccess([resp, config, eventLog]);
    } catch (error: any | Error | AxiosError) {
      if (error instanceof Error) {
        if ((error as AxiosError).isAxiosError) {
          this._handleFail(error as AxiosError);
        } else {
          throw error;
        }
      } else {
        // @ts-ignore
        this._handleFail(error);
      }
    }
  }

  _shouldCamelizeResponse(config: Option) {
    if (typeof config.camelizeResponseData === 'boolean') {
      return config.camelizeResponseData;
    }
    return this.options.camelizeResponseData;
  }

  _shouldUnderscoreData(config: Option) {
    if (typeof config.underscoreRequestData === 'boolean') {
      return config.underscoreRequestData;
    }
    return this.options.underscoreRequestData;
  }

  _handleSuccess([resp, config, eventLog]: [void | AxiosResponse, any, any]) {
    // TODO 处理 void
    // @ts-ignore
    const {data} = resp;
    if (this._shouldCamelizeResponse(config)) {
      // 下划线转驼峰
      data.data = humps.camelizeKeys(data.data);
    }

    if (data.code.toString() === '301') {
      let prefix = SSO_DOMAIN_MAP[window.location.hostname];
      let hostname=window.location.hostname
      window.location.href =
        prefix + 'oauth2/authorize?client_id=101817&redirect_uri=http://'+hostname+'/%23/login&response_type=code';
    }

    if (!(data.result_code === 'success' || data.code.toString() === '200' || data.code?.toString() === '0')) {
      const error = new Error(data.display_msg || data.message || data.msg || '未知错误');
      throw error;
    }

    if (eventLog) {
      return {
        data: data,
        request: config,
        requestId: data.request_id,
        resultCode: data.result_code,
        eventLog,
      };
    }

    return data;
  }

  _handleFail(error: any) {
    const {response, request, config} = error;
    let message = '内部错误，请稍候再试！',
      code = 'internal_error';
    let err: ResponseError | undefined;
    if (response) {
      const {data} = response;
      if (!data) {
        message = '网络请求失败，请稍后重试';
        code = 'network_error';
      } else {
        const {result_code, display_msg, message: msg} = data;
        message = display_msg || msg || '内部错误，请稍候再试！';
        code = result_code;
      }
      err = new ResponseError(message, code, true);
      throw err;
    }
    if (request) {
      message = '网络请求失败，请稍后重试';
      code = 'network_error';
      err = new ResponseError(message, code, true);
      throw err;
    }
    if (!err) {
      throw error;
    } else {
      err.config = config;
    }
    throw err;
  }
}

export {Client as XClient};
