import { name } from '../../../mrn.config.js'

// LocalStorageKey键值对定义
const LocalStorageKey = {
  SSOInfo: 'LOCAL_STORAGE_KEY_SSO_INFO'
}

// 添加前缀
for (const [key, value] of Object.entries(LocalStorageKey)) {
  LocalStorageKey[key] = `${name}_${value}`
}

export { LocalStorageKey }
