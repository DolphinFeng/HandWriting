import { i18nClient } from '@sailor/i18n-web';
/* eslint-disable object-curly-newline */
/*
 * @Description: 弹出窗口
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-10 15:57:56
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-03-24 19:49:08
 * @FilePath: /scheduleweb/src/components/PopUpBtn/index.tsx
 */
import React from 'react';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import dxJSSDK from '@/utils/dxJSSDK';
import { Tooltip } from '@ss/mtd-react';
import { PopoverBaseProps } from '@ss/mtd-react/types/base';

import styles from './index.less';

interface IPopUpBtn {
  global?: any;
  icon?: React.ReactNode;
  lineStyle?: React.CSSProperties;
  btnStyle?: React.CSSProperties;
  toolTipPlacement?: PopoverBaseProps['placement'];
}
@inject('global')
@observer
export default class PopUpBtn extends React.Component<IPopUpBtn> {
  popUp = async () => {
    const { setData } = this.props.global;
    const res = await dxJSSDK.popUp();
    if (res === 0) {
      // res 0 popUp操作成功 隐藏按钮
      setData({ showPopBtn: false });
    }
    console.log(res);
  };

  render() {
    const { icon, lineStyle, btnStyle, toolTipPlacement } = this.props;
    const { showPopBtn } = this.props.global;
    if (!showPopBtn) {
      return null;
    }
    return (
      <Tooltip delayHide={0} message={i18nClient.t('pop_up_btn', '用独立窗口打开')} placement={toolTipPlacement} >
        <div className={styles.container} onClick={this.popUp}>
          <div className={styles.vLines} style={lineStyle} />
          <div className={styles.popUpBtn} style={btnStyle}>
            {
              icon || (
                <i
                  className={classNames('dxcalendar dx-calindependence', {
                    [styles.popUpIcon]: true
                  })}
                />
              )
            }
          </div>
        </div>
      </Tooltip>
    );
  }
}
