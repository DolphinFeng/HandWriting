import {isObject} from 'lodash';

//   删除空值
export function removeEmptyValue<T = any>(data: T, options: {[key: string]: any} = {}): T {
  const {removeEmptyValue = true, defaultRemoveTypeArray = [null, undefined, NaN]} = options;
  let rmTypeArray: any[] = [];
  if (removeEmptyValue) {
    rmTypeArray = ['', ...defaultRemoveTypeArray];
  } else {
    rmTypeArray = defaultRemoveTypeArray;
  }
  if (Array.isArray(data)) {
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
