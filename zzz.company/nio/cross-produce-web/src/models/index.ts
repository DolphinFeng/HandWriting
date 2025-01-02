export * from './project';
export * from './produce';
export * from './data-mnm';
export * from './data-monitor';

/**
 * 时间戳："2023-08-07T10:27:44.124Z"
 */
export type RFC3339Date = string;
/**
 * 时间戳：1628326064124
 */
export type TimeStamp = number;

export type JSONString = string;

/**
 * 返回结果
 */
export interface ListResponse<T> {
  code: number;
  data: T[];
  message: string;
  totalCount: number;
}

export interface MSSListResponse<T> {
  code: number;
  data: {
    result: T[];
    pageCount: number;
    total: number;
  };
  message: string;
}
