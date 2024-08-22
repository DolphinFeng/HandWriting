import { chatService } from '../utils';
// BASE_URL
const prodHost = 'tt.sankuai.com';
const stHost = 'tt.fetc.st.sankuai.com';
const host = window.location.host;
const env = host.includes(prodHost) ? 'prod' : (host.includes(stHost) ? 'staging' : 'test');
const chatUrl = env === 'test' ? '//chat.inf.test.sankuai.com' : (env === 'staging' ? 'https://chat.inf.st.sankuai.com' : 'https://chat.meituan.com');

// 考虑到安全问题，不再使用单独的chat域名，为了快速上线先继续使用chatService，之后使用统一的service

// 创建群
export const createGroup = (params: {
    objectId?: number,
    name: string,
    memberIds: string[]
}) => {
    return chatService.post(`/im/1.0/group/create`, params);
};
// 解散群聊
export const disbandGroup = (groupId: number) => {
    return chatService.delete(`/im/1.0/group/disband?groupId=${groupId}`);
};
// 添加群成员
export const addMember = (params: {
    groupId: number,
    memberIds: any
}) => {
    return chatService.put(`/im/1.0/group/member/add`, params);
};

// 获取大象群信息：创建状态、群成员、是否为外部群等
export const getGroupInfo = (objectId: number) => {
    return chatService.get(`/im/1.0/group/info?objectId=${objectId}`);
};

// 更新用户在线状态
export const updateUserState = (groupId: number, status: string) => {
    return chatService.put(`/im/1.0/group/connect/status?groupId=${groupId}&status=${status}`);
};
