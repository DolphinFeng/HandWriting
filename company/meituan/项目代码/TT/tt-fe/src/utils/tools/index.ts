import linkifyHtml from 'linkifyjs/html';
import { TimeTypes } from '@/config/map.conf';
import store from '@/store';
import * as api from '@/api';
import axios from 'axios';
export function markHyperLink (htmlString) {
    return linkifyHtml(htmlString, {
        target: '_blank',
        validate: {
            url: function (value) {
                return /^(http|ftp)s?:\/\//.test(value);
            }
        }
    });
}
// 中文2字符 英文1字符 计算长度
export function getStringLength (str) {
    let length = 0;
    for (let i = 0; i < str.length; i++) {
        let char = str.charCodeAt(i);
        if ((char >= 0x0001 && char <= 0x007e) || (0xff60 <= char && char <= 0xff9f)) {
            length ++;
        } else {
            length += 2;
        }
    }
    return length;
}

// 为减少对用户信息接口的请求次数 Vuex中保存的用户信息 直接读取
export async function submitAndGetUserInfo (currentUserDisplay: CommonTypes.userDisplayItem[], username: string) {
    if (!currentUserDisplay || !username) {
        return ;
    }
    let vuexArr = currentUserDisplay.map((currentUser) => {
        return currentUser.username;
    });
    let newVuexArr = currentUserDisplay.concat();
    if (vuexArr.includes(username)) {
        let resultArr = currentUserDisplay.filter(user => user.username === username);
        return resultArr[0] || {};
    } else {
        const res: Ajax.AxiosResponse = await api.ctiApi.searchDisplayNameList([username]);
        let result = res.data && res.data[username] || {};
        result['username'] = username || '';
        result && newVuexArr.push(result);
        store.commit('GET_USER_DISPLAY', newVuexArr);
        return result;
    }
}
// 当遇到数组时 先将Vuex中不存在的用户名 获取到并提交至Vuex
export async function submitUserArrToVuex (currentUserDisplay: CommonTypes.userDisplayItem[], username: string[]) {
    if (!currentUserDisplay || !username) {
        return ;
    }
    let vuexArr = currentUserDisplay.map((currentUser) => {
        return currentUser.username;
    });
    let newVuexArr = currentUserDisplay.concat();
    if (username instanceof Array) {
        // 求两个数组username的差集
        let unionSet = new Set([...vuexArr, ...username]);
        let diffSet = new Set(Array.from(unionSet).filter(user => !new Set(vuexArr).has(user)));
        let diffArr = Array.from(diffSet);
        // 请求不存在的username 并保存到vuex中
        if (diffArr.length > 0) {
            const res: Ajax.AxiosResponse = await api.ctiApi.searchDisplayNameList(diffArr);
            let result = res.data || {};
            for (let user in result) {
                result[user]['username'] = user;
                newVuexArr.push(result[user]);
            }
            store.commit('GET_USER_DISPLAY', newVuexArr);
        }
    }
}
export function formatTimeStr (time: number, unit: string) {
    let result = '';
    if (unit === 'HOUR') {
        let day = Math.floor(time / 24);
        let hour = time % 24;
        if (day > 0) {
            result = `${day}天`;
        }
        if (hour > 0) {
            result += `${hour}小时`;
        }
    } else if (unit === 'MINUTE') {
        let day = Math.floor(time / (24 * 60));
        let hour = Math.floor(time / 60);
        let min = time % (24 * 60);
        if (day > 0) {
            result = `${day}天`;
            hour = Math.floor((time % (24 * 60)) / 60);
        }
        if (hour > 0) {
            result += `${hour}小时`;
            min = time % 60;
        }
        if (min > 0) {
            result += `${min}分钟`;
        }
    } else {
        result = time + TimeTypes[unit];
    }
    return result;
}
// 批量注册组件
export const importComponents: (
    componentsField: any,
    components: CommonTypes.mapObject
) => void = async (componentsField: any, components: CommonTypes.mapObject) => {
    componentsField.keys().forEach((url: string) => {
        let name = url.substring(2, url.length - 4);
        components[name] = componentsField(url).default;
    });
};
// 首字母大写
export function firstUpperCase (str: string) {
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L: string) => L.toUpperCase());
}
// html剔除富文本标签，留下纯文本
export function getSimpleText (html: string) {
    let reg = new RegExp('<.+?>', 'g');
    let msg = html.replace(reg, '');
    return msg;
}
// 搜索结果高亮
export function highlightMatch (val, str) {
    let reg = new RegExp(val, 'gi');
    return str.replace(reg, `<span style='color: #FF8800'>${val}</span>`);
}
let hasLoadScript = false;
// 动态加载javascript文件
export const loadScriptDynamic = (src: string, cb?: Function) => {
    if (hasLoadScript) {
        return ;
    }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    document.body.appendChild(script);
    return new Promise((resolve, reject) => {
        script.onload = () => {
            if (cb) cb();
            hasLoadScript = true;
            resolve();
        };
        script.onerror = reject;
    });
};

// 转换文件大小
export function getFileSize (size: number) {
    if (!size) return '';
    const num = 1024.00;
    if (size < num) return size + 'B';
    if (size < Math.pow(num, 2)) return (size / num).toFixed(2) + 'KB';
    if (size < Math.pow(num, 3)) return (size / Math.pow(num, 2)).toFixed(2) + 'MB';
    if (size < Math.pow(num, 4)) return (size / Math.pow(num, 3)).toFixed(2) + 'G';
    return (size / Math.pow(num, 4)).toFixed(2) + 'T';
}
// 某块是否展示是否可编辑
export function itemPermission (key: string) {
    const permissionMap = store.getters.detailOperatePermission;
    let state = permissionMap[key];
    return {
        visible: state && state !== 'disabled',
        editable: state === 'editable' || !state
    };
}

export function uniqueObject (arr: [], key: string) {
    const res = new Map();
    return arr.filter(item => !res.has(item[key]) && res.set(item[key], 1));
}

export async function downloadS3File (fileUrl: string, fileName: string) {
    const requestBody = await axios(fileUrl, {
        method: 'get',
        withCredentials: true,
        responseType: 'arraybuffer',
        headers: {
            'Response-Content-Disposition': 'attachment'
        }
    });
    if (!requestBody || !requestBody.data) {
        return;
    }
    const url = URL.createObjectURL(new Blob([requestBody['data']]));
    let a = document.createElement('a');
    a.download = fileName;
    a.style.display = 'none';
    a.href = url;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url); // 销毁
    document.body.removeChild(a);
}
