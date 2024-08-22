/**
 * services/x.ts 基于 api/*.ts 中的接口实现的 service 全部封装成函数
 */
import * as api from '@/api';

type UserInfoItemForDisplay = Omit<CommonTypes.userDisplayItem, 'username'>;
const userInfoMapCache: Record<string, UserInfoItemForDisplay> = {};

export const getUserInfoMapByMisIds = async (misIds: string[]): Promise<Record<string, UserInfoItemForDisplay>> => {
    if (!misIds.length) {
        return {};
    }
    // 过滤掉已经在 UserInfoMap 中的缓存项目，只查询未查询过的项目
    const result = {};
    const freshIds = [];
    const cachedIds = Object.keys(userInfoMapCache);
    for (const id of misIds) {
        if (cachedIds.includes(id)) {
            result[id] = userInfoMapCache[id];
        } else {
            freshIds.push(id);
        }
    }

    const res = await api.ctiApi.searchDisplayNameList(misIds);
    const { code, data } = res;
    if (code === 200) {
        Object.entries(data).forEach(([misId, userInfo]) => {
            result[misId] = userInfo;
            userInfoMapCache[misId] = userInfo;
        });
    }
    return result;
};

export const clearUserInfoMapCache = () => {
    Object.keys(userInfoMapCache).forEach((k) => {
        delete userInfoMapCache[k];
    });
};
