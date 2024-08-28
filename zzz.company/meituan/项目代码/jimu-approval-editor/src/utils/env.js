const mns = require('@mtfe/mns-util');

const appEnv = mns.getAppEnvSync();
process.env.PLUS_TEMPLATE_ENV = process.env.PLUS_TEMPLATE_ENV || appEnv.env;
// 兼容npm run dev时使用local配置
const deployEnv =
  process.env.NODE_ENV === 'local' ? 'local' : process.env.PLUS_TEMPLATE_ENV;

module.exports = {
  deployEnv
};
