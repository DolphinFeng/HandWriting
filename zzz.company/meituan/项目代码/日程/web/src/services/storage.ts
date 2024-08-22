/**
 * 浏览器缓存storage
 */
const STORAGE_KEY = '__com_sankuai_oa_it_scheduleweb__';

// 获取页面缓存数据LocalStorage
const getLocalStorage = () => {
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
};

// 获取页面缓存数据SessionStorage
const getSessionStorage = () => {
  return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}');
};

export const StorageService = {
  // localStorage
  getItem: (key: string, defaultValue?: any) => {
    const data = getLocalStorage();
    return data[key] || defaultValue || null;
  },
  setItem: (key: string, value: any) => {
    const data = getLocalStorage();
    data[key] = value;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  removeItem: (key: string) => {
    const data = getLocalStorage();
    delete data[key];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  clear: () => {
    const data = {};
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  // sessionStorage
  getItemSession: (key: string, defaultValue?: any) => {
    const data = getSessionStorage();
    return data[key] || defaultValue || null;
  },
  setItemSession: (key: string, value: any) => {
    const data = getSessionStorage();
    data[key] = value;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  removeItemSession: (key: string) => {
    const data = getSessionStorage();
    delete data[key];
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  clearSession: () => {
    const data = {};
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

/** 会议室页面缓存 */
const ROOMS_STORAGE_KEY = '_com_sankuai_xzfe_meeting_roomsweb';

// 获取页面缓存数据LocalStorage
const getRoomsLocalStorage = () => {
  return JSON.parse(window.localStorage.getItem(ROOMS_STORAGE_KEY) || '{}');
};

export const RoomsStorageService = {
  // localStorage
  getItem: (key: string, defaultValue?: any) => {
    const data = getRoomsLocalStorage();
    return data[key] || defaultValue || null;
  },
};
