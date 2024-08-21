import { TimeTypes } from '@/config/map.conf';
import * as api from '@/api';
import store from '@/store';

export function getStringLength (str) {
    let length = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        if ((char >= 0x0001 && char <= 0x007e) || (char >= 0xff60 && char <= 0xff9f)) {
            length++;
        } else {
            length += 2;
        }
    }
    return length;
}

export function formatTimeStr (time: number, unit: string) {
    let result = '';
    if (unit === 'HOUR') {
        const day = Math.floor(time / 24);
        const hour = time % 24;
        if (day > 0) {
            result = `${day}天`;
        }
        if (hour > 0) {
            result += `${hour}小时`;
        }
    } else if (unit === 'MINUTE') {
        const day = Math.floor(time / (24 * 60));
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
        const name = url.substring(2, url.length - 4);
        components[name] = componentsField(url).default;
    });
};
// 首字母大写
export function firstUpperCase (str: string) {
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L: string) => L.toUpperCase());
}
// 当遇到数组时 先将Vuex中不存在的用户名 获取到并提交至Vuex
export async function submitUserArrToVuex (currentUserDisplay: CommonTypes.userDisplayItem[], username: string[]) {
    if (!currentUserDisplay || !username) {
        return;
    }
    const vuexArr = currentUserDisplay.map((currentUser) => {
        return currentUser.username;
    });
    const newVuexArr = currentUserDisplay.concat();
    if (username instanceof Array) {
        // 求两个数组username的差集
        const unionSet = new Set([...vuexArr, ...username]);
        const diffSet = new Set(Array.from(unionSet).filter(user => !new Set(vuexArr).has(user)));
        const diffArr = Array.from(diffSet);
        // 请求不存在的username 并保存到vuex中
        if (diffArr.length > 0) {
            const res = await api.ctiApi.searchDisplayNameList(diffArr);
            const result = res.data || {};
            for (const user in result) {
                (result[user] as any).username = user;
                newVuexArr.push(result[user] as any);
            }
            store.commit('GET_USER_DISPLAY', newVuexArr);
        }
    }
}
export function highlightMatch (val, str) {
    const reg = new RegExp(val, 'gi');
    return str.replace(reg, `<span style='color: #FF8800'>${val}</span>`);
}
