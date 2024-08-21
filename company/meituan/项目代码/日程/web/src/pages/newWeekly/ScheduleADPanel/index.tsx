import React from 'react';
import { Icon } from '@ss/mtd-react';
import { StorageService } from '@/services/storage';
import { getADInfo } from '@/services/apis';
import { safeParse } from '@/utils';
import { addModuleClick, addModuleView } from '@/services/lxService';
import styles from './index.less';

const { useState, useEffect, useCallback } = React;

interface IADInfo{
  bgImgUrl?: string; // 背景图片 url
  adHref?: string; // 问卷 href
  visible?: boolean;
}

interface IADPanelStorage{
  hasClosed?: boolean;
  adHref?: string;
  bgImgUrl?: string;
}

const getADPanelStorage = (): IADPanelStorage => {
  return StorageService.getItem('adPanelStorage', {});
};

/**
 * 广告位
 */
const ScheduleADPanel = React.memo(
  () => {
    const [adInfo, setQsInfo] = useState<IADInfo>({});
    const [hasClosed, setHasClosed] = useState(!!getADPanelStorage().hasClosed);

    const getIsShow = useCallback(() => {
      return !hasClosed && adInfo.visible && adInfo.bgImgUrl;
    }, [hasClosed, adInfo?.visible, adInfo?.bgImgUrl]);

    const initADInfo = useCallback(() => {
      getADInfo().then((res) => {
        const info: IADInfo = safeParse(res, {});
        setQsInfo(info);
        const adPanelStorage = getADPanelStorage();
        // 如果要跳转的 href 发生了变化，则认为是新的广告位
        if (info.adHref !== adPanelStorage.adHref || info.bgImgUrl !== adPanelStorage.bgImgUrl) {
          setHasClosed(false);
          StorageService.setItem('adPanelStorage', { hasClosed: false, adHref: info.adHref, bgImgUrl: info.bgImgUrl });
          return;
        }
        StorageService.setItem('adPanelStorage', { ...adPanelStorage, adHref: info.adHref, bgImgUrl: info.bgImgUrl });
      }).catch(() => {
        setQsInfo({});
      });
    }, []);

    useEffect(() => {
      // 获取 adInfo 相关配置
      initADInfo();
    }, [initADInfo]);

    useEffect(() => {
      // 展示埋点
      if (getIsShow()) {
        const { bgImgUrl, adHref } = adInfo || {};
        addModuleView('b_oa_dwq0uk9i_mv', { bgImgUrl, adHref });
      }
    }, [getIsShow, adInfo]);

    const onClickADPanel = () => {
      // 点击埋点
      const { bgImgUrl, adHref } = adInfo || {};
      addModuleClick('b_oa_1l3aopdb_mc', { bgImgUrl, adHref });
      if (adHref) {
        window.open(adHref, '_blank');
      }
    };

    const hideADPanel = (e) => {
      const { bgImgUrl, adHref } = adInfo || {};
      addModuleClick('b_oa_n0fx1t0o_mc', { bgImgUrl, adHref });
      setHasClosed(true);
      StorageService.setItem('adPanelStorage', { ...getADPanelStorage(), hasClosed: true });
      e.stopPropagation();
    };

    return (
      getIsShow()
        ? <div className={styles.container} onClick={onClickADPanel}>
        <img src={adInfo?.bgImgUrl} alt=" " className={styles['bg-img']}/>
        <Icon type='closemini' className={styles.close} onClick={hideADPanel}/>
      </div> : null
    );
  }
);

export default ScheduleADPanel;
