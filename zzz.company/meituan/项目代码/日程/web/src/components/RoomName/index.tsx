import { i18nClient } from '@sailor/i18n-web';
import React from 'react';
import { Tooltip, Icon } from '@ss/mtd-react';
import styles from './index.less';
import classnames from 'classnames';
import { addModuleClick } from '@/services/lxService';
import { bugfixForRoomsUrl } from '@/utils/bugfix';

interface IRoomNameProps {
  roomInfo: any;
}

export default (props: IRoomNameProps) => {
  const {
    roomName,
    floorName,
    buildingName,
    roomLocationUrl,
    openRoomMap
  } = props.roomInfo;

  const handleClick = () => {
    if (roomLocationUrl) {
      addModuleClick('b_oa_wrwxgpjw_mc');
      if (typeof openRoomMap === 'function') {
        openRoomMap();
        return;
      }
      window.open(bugfixForRoomsUrl(roomLocationUrl));
    }
  };

  const renderContent = () => {
    return (
      <div
        className={classnames(styles.roomNameWrapper, {
          [styles.couldClick]: roomLocationUrl
        })}
        onClick={handleClick}
      >
        {`${roomName || ''} ${floorName || ''} ${buildingName || ''}`}
        {roomLocationUrl ? (
          <Icon type="right-thick" className={styles.icon} />
        ) : null}
      </div>
    );
  };

  return roomLocationUrl ? (
    <Tooltip
      delayShow={300}
      delayHide={0}
      message={i18nClient.t('room_name_view_map', '查看地图')}
    >
      {renderContent()}
    </Tooltip>
  ) : (
    renderContent()
  );
};
