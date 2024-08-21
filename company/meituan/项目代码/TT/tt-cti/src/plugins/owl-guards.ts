import router from '@/router';

router.beforeEach((to, from, next) => {
    if ((to.name !== from.name) || (to.path !== from.path)) {
        window.owl && window.owl('resetPv', {
            pageUrl: location.href
        });
    }
    next();
});
