import '@bfe/air-request';

/**
 * OVERRIDE: 为 init() 方法的第一个参数指定类型为 AxiosRequestConfig 提供更好的类型声明
 * @description air-request 包的 init() 方法签名中第一个参数的类型声明是一个没啥用的 object
 */
declare module '@bfe/air-request' {
    export declare function init(config?: AxiosRequestConfig, _options?: OptionConfigOptional): AxiosInstance;
}
