// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import { isProd, isStaging } from './env';

const ssoHost = (isProd || isStaging) ? 'https://ssosv.sankuai.com/sson' : 'http://ssosv.it.test.sankuai.com/sson';
const clientId = (isProd || isStaging) ? '9504f696cb' : 'cc7fabacff';

export const getSSOLoginUrl = () => {
    const loginOrigin = `${ssoHost}/login`;
    const { origin, href } = window.location;
    const currentPath = href.replace(new RegExp(`^${origin}`), '');

    return `${loginOrigin}?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        `${origin}/sso/callback?original-url=${encodeURIComponent(currentPath)}`)}`;
};
export const getSSOLogoutUrl = () => {
    const loginOrigin = `${ssoHost}/logout`;
    const { origin, href } = window.location;
    const currentPath = href.replace(new RegExp(`^${origin}`), '');

    return `${loginOrigin}?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        `${origin}/sso/callback`)}?original-url=${encodeURIComponent(currentPath)}`;
};
