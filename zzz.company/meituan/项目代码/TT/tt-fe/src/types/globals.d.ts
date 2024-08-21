/**
 * @author mamengguang
 * @description 声明 window 上的全局变量
 * @see https://mariusschulz.com/blog/declaring-global-variables-in-typescript
 */
import G2Lib from '@antv/g2';

// 灵犀 SDK
declare var LXAnalytics: any;

// Owl SDK (CAT 前端采集)
declare var owl: any;

// 通过 CDN 引入 antv/g2 组件库
declare var G2: G2Lib;

declare global {
    interface Window {
        LXAnalytics: any;

        owl: any;

        G2: typeof G2Lib;
    }
}
