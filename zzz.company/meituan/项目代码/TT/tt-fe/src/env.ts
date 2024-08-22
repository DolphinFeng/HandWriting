import store from './store';
import { passportLoginUrl, passportEnvUrl } from '@/config/baseurl.conf.ts';

const host = window.location.host;
// 外部用户 - passport方式
const passportDomain: string = 'meituan.com';
const passportTestDomain: string = 'tt-meituan';
let loginType = (host.indexOf(passportDomain) > -1 || host.indexOf(passportTestDomain) > -1) ? 'PASSPORT' : 'SSO';
store.commit('LOGIN_TYPE', loginType);

// 获取私有空间前缀（泛域名模式，废弃）
// let hostPrefix = host && host.split('.')[0];
// let normalPrefixs = ['tt', 'tt-meituan', 'localhost:3002']; // 调试空间模式时删除localhost
// const spaceDomain = normalPrefixs.includes(hostPrefix) ? '' : hostPrefix;

let pathname = window.location.pathname;
let pathArr = pathname.split('/');
const spaceDomain = pathArr[1];
store.commit('SPACE_DOMAIN', spaceDomain || 'ticket');

const ONLINE_ENV: string = 'tt.sankuai.com';
const PASSPORT_ONLINE_ENV: string = 'tt.meituan.com';
let isProd: Boolean = (host.indexOf(ONLINE_ENV) > -1) || (host.indexOf(PASSPORT_ONLINE_ENV) > -1);
const STAGING_ENV: string = 'tt.fetc.st';
const PASSPORT_STAGING_ENV: string = 'tt.st';
let isStaging: Boolean = (host.indexOf(STAGING_ENV) > -1) || (host.indexOf(PASSPORT_STAGING_ENV) > -1);

let env: string = isProd ? 'prod' : (isStaging ? 'staging' : 'test');
store.commit('GET_ENV', env);

let pathName = `${location.pathname}${location.search}`;
let continueUrl = passportEnvUrl[env] + pathName;

let passportContinue = process.env.NODE_ENV === 'development' ? 'http://tt-meituan-local.sankuai.com' : continueUrl;
const passportLogin = `${passportLoginUrl[env]}/account/unitivelogin?service=d5953136&continue=${passportContinue}`;
const passportLogout = `${passportLoginUrl[env]}/account/signout?service=d5953136&continue=`;

export {
    loginType,
    env,
    isProd,
    isStaging,
    passportLogin,
    passportLogout,
    spaceDomain
};
