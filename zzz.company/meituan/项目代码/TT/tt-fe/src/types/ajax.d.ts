declare namespace Ajax {

    // axios 返回数据
    export interface AxiosResponse {
      data: AjaxResponse,
      code?: number
    }
  
    // 请求接口数据
    export interface AjaxResponse<T = any> {
      items: any;
      /**
       * 状态码
       * @type { number }
       */
      code: number,
  
      /**
       * 数据
       * @type { any }
       */
      data: T,
  
      /**
       * 消息
       * @type { string }
       */
      msg: string

      message: string
    }
  }