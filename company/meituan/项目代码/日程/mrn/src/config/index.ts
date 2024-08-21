// 该配置文件不需要修改
import { EEnv } from '@onejs/mrn'
import { app } from '../../mrn.config'

export const getEnv = () => {
  if (__DEV__) {
    return EEnv.Dev
  }

  return app.env
}

export default {
  env: getEnv(),
  clientId: app.clientId[getEnv()],
  log: {
    debug: __DEV__ // 只有在dev环境下才会打印debug日志
  }
}
