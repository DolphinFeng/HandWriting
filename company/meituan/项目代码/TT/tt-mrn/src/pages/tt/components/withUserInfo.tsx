import React from 'react'
import { connect } from 'react-redux';
import {
  connectExternalUser,
  InjectedExternalUserProps
} from '../redux/connectors'
import { Dispatch } from 'redux';
import { getUserLanguage, getTimeZoneOptions } from '../constants/TTApi';
import { i18nClient } from '@sailor/i18n-mrn';
import KNB from '@mrn/mrn-knb'
import { RootState } from '../redux/store';
import { setTimeZone } from '../redux/actions';
import { dispatchSetTimeZone } from '../redux/thunks';


const mapDispatchToProps = (dispatch) => ({
  dispatchSetTimeZone: (timeZone) => dispatch(setTimeZone(timeZone)),
});

import { customInfo } from '@src/common/helpers/customError';

export function withUserInfo<P extends { [key: string]: any }>(
  WrappedComponent: React.ComponentType<P>
) {
  return connectExternalUser(
    connect(null, mapDispatchToProps)(

    class extends React.Component<P & InjectedExternalUserProps> {
      constructor(props) {
        super(props);
        // 获取语言信息并set
        customInfo('页面打开')
      }

      async init() {
        let lang = 'zh'
        // 优先获取大象语言设置
        // const dx_la = await this.getLang()
        // console.log('==== dx_la ====', dx_la)
        // const validLang = ['zh', 'en', 'zh-HK']
        // if (dx_la && validLang.indexOf(dx_la) >= 0) {
        //   lang = dx_la
        // } else {
        // 大象语言不支持，则获取tt语言
        const res = await getUserLanguage()
        const tt_la = res?.data?.locale
        if (tt_la) lang = tt_la
        // }
        // 设置当前时区
        const selectedTimeZone = res?.data?.timeZone || 'GMT+08:00'; // 默认时区
        this.props.dispatchSetTimeZone(selectedTimeZone);

        i18nClient.changeLanguage(lang, (err, t) => {
          console.log('语言设置成功', lang)
          if (err) {
            console.error("语言切换失败");
            return
          }
        })
        const ops = await getTimeZoneOptions()
        // this.props.dispatchFetchTimeZoneOptions(ops?.data);
      }

      getLang = async (): Promise<string> =>
        new Promise((resolve, reject) => {
          KNB.use('getAppInfo', {
            success: res => {
              console.log(res, '------resfee----')
              resolve(res?.extras?.dx_la)
            },
            fail: err => {
              reject(err)
            }
          })
        })

      async componentDidMount() {
        this.init()
        this.props.dispatchFetchUserInfo()
      }

      render() {
        return <WrappedComponent {...this.props} />
      }
    }
  )
)
}