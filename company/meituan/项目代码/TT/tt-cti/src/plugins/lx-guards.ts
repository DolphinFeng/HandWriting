import { pvReport } from '@bfe/air-lx';
import router from '@/router';
import { lxMap } from '@/config/lx.conf';

router.beforeEach((to, from, next) => {
    if (to.path !== from.path) {
        // 灵犀上报自定义参数
        const params = {
            name: to.name || '',
            path: to.path || '',
            alias: to.meta.menuSlug || ''
        };
        // 灵犀上报pv
        pvReport(lxMap, to.name || to.path, params);
    }
    next();
});
