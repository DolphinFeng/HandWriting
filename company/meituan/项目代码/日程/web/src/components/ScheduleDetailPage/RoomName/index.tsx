import React, { Component } from 'react';
import { RoomName } from '@/components';
import dx from '@/utils/dxCalendar';
import { isRightSideDaxiang } from '@/utils';
import { bugfixForRoomsUrl } from '@/utils/bugfix';
import allstyles from '../index.less';

export interface IRoomName {
  roomName: string;
  roomLocationUrl: string;
  locationId: string;
  roomInfo?: any;
  scheduleId?: string;
}

export default class extends Component<IRoomName> {
  openRoomMap = () => {
    const {
      roomLocationUrl,
      roomInfo: {
        buildingName, floorName, roomName, roomId
      } = {}
    } = this.props;

    if (isRightSideDaxiang) {
      const params = {
        id: roomId,
        phrase: `${buildingName} ${floorName} ${roomName}`
      };
      dx.openRoomMap(params);
    } else {
      window.open(bugfixForRoomsUrl(roomLocationUrl));
    }
  };

  render() {
    const {
      roomName, roomInfo, locationId, roomLocationUrl
    } = this.props;
    return (
      <>
        {roomName && locationId && (
          <div className={allstyles.detailShowFormItem}>
            <div className={allstyles.detailShowFormLabel}>
              <i
                className={`dxcalendar dx-calmeeting-room ${allstyles.labelFontStyle} ${allstyles.roomicon}`}
              />
            </div>
            <RoomName roomInfo={{ ...roomInfo, roomLocationUrl }} openRoomMap={this.openRoomMap} />
          </div>
        )}
      </>
    );
  }
}
