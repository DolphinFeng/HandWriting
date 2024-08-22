/**
 * 灵犀事件埋点指令
 * @author xiaokunyu
 * @date 02/14/2019
 */
import store from '@/store';
export default {
    bind (el) {
        const handler = function (e) {
            const win = (window as any);
            // 用户mis
            const username: string = store.state.cti.userInfo.username;
            // 事件类型
            const act: string = e.currentTarget.getAttribute('lxay-act') || '';
            // 事件bid
            const bid: string = e.currentTarget.getAttribute('lxay-bid') || '';
            const type: string = e.currentTarget.getAttribute('lxay-type') || '';
            win.LXAnalytics(act, bid, { custom: { type: type, mis: username } });
        };
        el.addEventListener('click', handler);
    }
};

// 灵犀通用上报方法
// 点击事件
export function lxReportClick (bid: string, otherParams: any = {}) {
    const win = (window as any);
    const userInfo: CommonTypes.mapObject = store.state.cti.userInfo;
    const baseParams = {
        mis_id: userInfo.username || '',
        tenantId: userInfo.tenantId || '0',
        bgId: userInfo.bgId || 0,
        buId: userInfo.buId || 0,
        jobFamily: userInfo.jobFamily || 0,
        jobFamilyName: userInfo.jobFamilyName || ''
    };
    win.LXAnalytics && win.LXAnalytics('moduleClick', bid, { custom: baseParams, ...otherParams }, { cid: 'c_onecloud_188uiwg3' });
};
