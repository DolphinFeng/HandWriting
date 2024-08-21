/**
 * 灵犀事件埋点指令
 * @author xiaokunyu
 * @date 02/14/2019
 */
import store from '@/store';

const userInfo: string = store.state.tt.userInfo;
const loginType: string = store.state.tt.loginType;
const spaceDomain: string = store.state.tt.spaceDomain;
const ticketUserInfo = localStorage.getItem('ticketUserInfo');
const ticketUser = ticketUserInfo ? JSON.parse(ticketUserInfo) : {};
const baseParams = {
    mis_id: userInfo.username || ticketUser.username || '',
    tenantId: userInfo.tenantId || ticketUser.tenantId || '0',
    bgId: userInfo.bgId || ticketUser.bgId || 0,
    buId: userInfo.buId || ticketUser.buId || 0,
    loginType: loginType,
    spaceDomain: spaceDomain
};
const win = (window as any);

export function lxanalyMethod (el) {
    const handler = function (e) {
        const win = (window as any);
        // 事件类型
        const act: string = e.currentTarget.getAttribute('lxay-act') || '';
        // 事件bid
        const bid: string = e.currentTarget.getAttribute('lxay-bid') || '';
        const type: string = e.currentTarget.getAttribute('lxay-type') || '';
        win.LXAnalytics(act, bid, { custom: { ...baseParams, type: type } }, { cid: 'c_onecloud_pr0rfh0o' });
    };
    el.addEventListener('click', handler);
}

// 灵犀通用上报方法
// 点击事件
export function lxReportClick (bid: string, otherParams: any = {}) {
    win.LXAnalytics && win.LXAnalytics('moduleClick', bid, { custom: baseParams, ...otherParams }, { cid: 'c_onecloud_pr0rfh0o' });
}
// 模块曝光
export function lxReportView (bid: string) {
    win.LXAnalytics && win.LXAnalytics('moduleView', bid, { custom: baseParams }, { cid: 'c_onecloud_pr0rfh0o' });
}

export function lxReportPV (route) {
    win.LXAnalytics && win.LXAnalytics('pageView', { custom: {
        name: route.name,
        alias: route.meta.alias, // 保留yuntu配置
        routeName: route.meta.alias,
        title: route.meta.alias,
        ...baseParams
    }}, null, 'c_onecloud_pr0rfh0o');
}
