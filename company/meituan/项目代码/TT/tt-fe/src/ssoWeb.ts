// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import SSOWeb from '@mtfe/sso-web';
import { isProd, isStaging } from './env';

// 接入SSO websdk
let ssoWeb = (isProd || isStaging) ? SSOWeb({
    clientId: '9504f696cb',
    accessEnv: 'product',
    schema: '',
    sameSite: false
}) : SSOWeb({
    clientId: 'cc7fabacff',
    accessEnv: 'test',
    schema: ''
});

export default ssoWeb;
