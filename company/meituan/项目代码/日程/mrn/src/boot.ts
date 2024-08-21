import { Text, TextInput } from '@mrn/react-native'
import { logger } from '@onejs/mrn-utils'

const boot = () => {
  // 日志信息
  logger.config({ debug: __DEV__ })

  // 调试信息
  // eslint-disable-next-line no-console
  console.disableYellowBox = true

  // @ts-ignore
  Text.defaultProps = { allowFontScaling: false }

  // @ts-ignore
  TextInput.defaultProps = { allowFontScaling: false }
}

export default boot
