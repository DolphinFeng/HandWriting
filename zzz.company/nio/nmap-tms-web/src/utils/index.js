import map from "./map";
import { ElMessage } from "element-plus";
import _ from "lodash";

// 去除对象中属性为空字符串的属性
export function objRemoveNullAttr(obj) {
  Object.keys(obj).forEach((item) => {
    if (obj[item] === '') delete obj[item];
  });
  return obj;
}

// 去除对象中属性值为空的属性
export function objRmNullAttr(obj) {
  Object.keys(obj).forEach((item) => {
    if (obj[item] === null) delete obj[item];
  });
  return obj;
}

// 去除对象中属性为空数组的属性
export function objRmEmptyArrAttr(obj) {
  Object.keys(obj).forEach((item) => {
    if (obj[item] instanceof Array && obj[item].length === 0) {
      delete obj[item];
    }
  });
  return obj;
}

export function arrayToString(arrays, st) {
  let result = '';
  for (let i = 0, l = arrays.length; i < l; i++) {
    result += i === arrays.length - 1 ? arrays[i] : arrays[i] + st;
  }
  return result;
}

// 小数转化百分比
export function toPercent(point, num) {
  if (!point) {
    return '0%';
  }
  let str = Number(point * 100).toFixed(num);
  str += '%';
  return str;
}

// 如果为空，则返回null，好保持和后端一致
export function emptyToNull(str) {
  return str === '' ? null : str;
}

// 根据value获取label
export function getLabel(array, value) {
  const values = array.map(item => item.value);
  if (!values.includes(value)) return `${value}(未知)`;
  return array.find(item => item.value === value).label;
}

// 根据label获取value
export function getValue(array, label) {
  return array.find(item => item.label === label).value;
}

// 根据label获取color
export function getColor(array, label) {
  return array.find(item => item.label === label).color;
}

// 时间格式化为年-月-日 时-分-秒
export function getTime(time) {
  if (!time) return '';
  const [date, hms] = time.split(' ');
  return `${date}\n${hms}`;
}
// 获取数组中重复项的索引

// 表格数据通过表格列配置生成csv文件内容
// 格式：[{ prop: "字段属性名"，label: "字段名称" ...}...]
export function tableDataToCsvContent(data, columns) {
  const propList = [];
  const headerList = [];
  columns.map(item => {
    if (!item.prop) {
      return;
    }
    propList.push(item.prop);
    headerList.push(escapeCSVField(item.label ?? item.prop));
  });
  const listRow = [headerList.join(",")];
  data.map((row) => {
    const line = [];
    propList.map((prop) => {
      if (typeof row[prop] === 'undefined' || row[prop] === null) {
        line.push('');
      } else {
        line.push(escapeCSVField(row[prop]));
      }
    });
    listRow.push(line.join(','));
  });
  return listRow.join('\n');
}
// 下载CSV文件
export function exportCSV(res) {
  const blob = new Blob([res.data], { type: res.data.type });
  let fileName = res.headers['content-disposition']
    .split(';')[1]
    .split('filename=')[1];
  fileName = window.decodeURI(fileName);
  // const fileName = '任务信息列表'
  const downloadElement = document.createElement('a');
  const href = window.URL.createObjectURL(blob); // 创建下载的链接
  downloadElement.href = href;
  downloadElement.download = fileName; // 下载后文件名
  document.body.appendChild(downloadElement);
  downloadElement.click(); // 点击下载
  document.body.removeChild(downloadElement); // 下载完成移除元素
  window.URL.revokeObjectURL(href); // 释放blob
}
// 处理csv每个字段的特殊字符
export function escapeCSVField(field, delimiter = ",") {
  if (typeof field === 'undefined' || field === null) {
    return '';
  }
  if (typeof field !== 'string') {
    field = field + '';
  }
  if (field.indexOf(delimiter) >= 0 || field.indexOf('\n') >= 0 || field.indexOf('"') >= 0) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function downloadFileByContent(fileName, content) {
  let type = 'text/plain;charset=utf-8;';
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
  const blob = new Blob([bom, content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

// 将请求到的tile数据格式化
// eslint-disable-next-line no-unused-vars
export function toTileData(tile) {
  let { task_info } = tile;
  const { tile_info } = tile;
  let { version } = tile_info;
  const { tile_id, status, waiting_info } = tile_info;
  if (version.length === 0) {
    version = [];
  }
  task_info = task_info || [];
  const len = task_info.length;
  const taskInfo = {};
  for (let i = 0; i < len; i++) {
    const item = task_info[i];
    if ((item.workShop === 3 && item.taskType === 1) || (item.workShop === 3 && item.taskType === 6) || (item.workShop === 3 && item.taskType === 9)) {
      taskInfo.lane = item;
    } else if (item.workShop === 4 && item.taskType === 1) {
      taskInfo.obj = item;
    } else if (item.workShop === 5 && item.taskType === 1) {
      taskInfo.pole = item;
    } else if (item.workShop === 4 && item.taskType === 8) {
      taskInfo.property = item;
    } else if (item.workShop === 4 && item.taskType === 2) {
      taskInfo.associate = item;
    } else if (item.workShop === 1 && item.taskType === 3) {
      taskInfo.edge = item;
    } else if (item.workShop === 2 && item.taskType === 4) {
      taskInfo.blocked = item;
    }
  }
  return {
    tile_id,
    state: status,
    materialVersions: version,
    taskInfo,
    waitingInfo: waiting_info || [],
  };
}

// 请求成功失败提示
export function operationTip(operation, status, resultMsg) {
  if (status) {
    ElMessage.success({
      message: `${operation}成功`
    })
  } else {
    ElMessage.error({
      message: resultMsg ? resultMsg : `${operation}失败`
    })
  }
}

// 多选bit位十进制转换为数组
export function bitToArr(bit, length, options) {
  if (bit) {
    let bitString = bit.toString(2).padStart(length, '0');
    bitString = bitString.split('').reverse();
    const bitArr = [];
    const result = [];
    bitString.map((item, index) => +item ? bitArr.push(index) : '');
    if (options) {
      bitArr.map(element => result.push(options.find(item => item.value === element).label));
    }
    return [bitArr, result];
  }
  return '';
}

// Date对象转化为"YYYY-MM-DD HH:MM:SS"字符串,日期转化
export function dateToString(format) {
  const date = new Date(format);
  const YY = `${date.getFullYear()}-`;
  const MM = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-`;
  const DD = (date.getDate() < 10 ? `0${date.getDate()}` : date.getDate());
  const hh = `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}:`;
  const mm = `${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}:`;
  const ss = (date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds());
  return `${YY + MM + DD} ${hh}${mm}${ss}`;
}

// 获取新旧对象数组被修改的元素
export function getModifyElementObjArr(newArr, oldArr) {
  let result = [];
  result = newArr.filter((item, index) => item.status !== oldArr[index]);
  return result;
}

export default {
  map
};

function oldCopyTextToClipboard(text) {
  let textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.classList.add('text-copy-board');
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    return document.execCommand('copy');
  } catch (e) {
    return e
  }
}

//复制文字到粘贴板
export async function copyTextToClipboard(text, duration = 3000) {
  let result;
  if (!navigator.clipboard) {
    result = oldCopyTextToClipboard(text);
  } else {
    await navigator.clipboard.writeText(text).then(res => {
      result = true;
    }).catch(e => {
      result = e;
    });
  }
  if (result === true) {
    ElMessage.success({
      message: '已将内容复制到粘贴板',
      showClose: false,
      customClass: 'high-index-message',
      grouping: true,
      duration: duration,
    });
  } else {
    ElMessage.warning({
      message: '您的浏览器不支持复制',
      showClose: false,
      grouping: true,
    });
  }
  document.body.click();
}

//判断对象是否为空
export function isNullObject(obj) {
  for (let key in obj) {
    return false;
  }
  return true;
}

// 节流
export function throttle(fn, delay = 100) {
  let timer;
  return function () {
    if (timer) return;
    timer = setTimeout(() => {
      fn.apply(this, arguments);
      timer = null;
    }, delay);
  }
}

// 防抖
export function debounce(fn, delay = 100) {
  let timeout = null;
  return function () {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, arguments);
    }, delay);
  };
}

// 对象转化为字典，以便快速索引
export const objToDict = (array, keyName = 'value', valName = 'label') => {
  return _.mapValues(_.keyBy(array, keyName), valName);
}

// 通过options的value获取label。mapOptions为options通过objToMap转换的内容
export const getOptionLabel = (mapOptions, value) => {
  if (!value) {
    return '';
  }
  if (!mapOptions || typeof mapOptions[value] === 'undefined') {
    return '';
  }
  return mapOptions[value];
}

export const openInNewTab = (relativePath) => {
  // 使用 window.location 来获取当前页面的完整基础URL
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const fullUrl = new URL(relativePath, baseUrl).href;

  window.open(fullUrl, '_blank');
}
