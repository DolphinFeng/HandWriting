// 如果删除这一行，会导致项目中用到 axios 的地方只有一个 AxiosResponse 而没有其他类型
import { AxiosInstance, AxiosPromise, AxiosRequestConfig } from 'axios';

export interface AjaxResponse<T = any> {
    /**
     * 状态码
     * @type { number }
     */
    code: number;

    /**
     * 数据
     * @type { T }
     */
    data: T;

    /**
     * 消息
     * @type { string }
     */
    message: string;

    ret?: string;
}

declare module 'axios' {
    /**
     * 覆盖 axios 默认的 AxiosResponse 类型
     * @see https://github.com/axios/axios/issues/1510#issuecomment-448201698
     * @example service.get<MosesSetting>(`/cti/1.0/rg/moses/${rgId}`)
     */
    export interface AxiosResponse<T = any> extends Promise<AjaxResponse<T>> {}

    /**
     * 覆盖 @bfe/air-request/types/ajax.d.ts 中的类型声明
     * @see @bfe/air-request/types/ajax.d.ts:3:5
     */
    export interface AxiosInstance {
        request<T = any>(config: AxiosRequestConfig): AxiosPromise<T>;
        get<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;
        delete(url: string, config?: AxiosRequestConfig): AxiosPromise;
        head(url: string, config?: AxiosRequestConfig): AxiosPromise;
        post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>;
        put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>;
        patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>;
    }
}

/**
 * @see https://vuejs.org/v2/guide/typescript.html#Augmenting-Types-for-Use-with-Plugins
 */
declare module 'vue/types/vue' {
    interface VueConstructor {
        $http: AxiosInstance;
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $http: AxiosInstance;
    }
}
