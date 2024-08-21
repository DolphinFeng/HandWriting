// window环境中有dx才能跳转
export const dx = window?.dx;

// dx跳转方法
export default {
  // 跳转日程
  openSchedule(params) {
    // isOpen(jumpSchedule, params);
    if (dx) {
      try {
        dx.request('enterCalendar', params);
      } catch (error) {
        console.log('[openSchedule failed]');
      }
    }
  },
  // 分享
  openShare(): any {
    return new Promise((resolve) => {
      dx.request('forwardSelectMode', {
        filterType: ['chat', 'groupchat'],
        disableTextInput: true
      }).then((res) => {
        resolve(res);
      });
    });
  },

  // 打开地图
  openRoomMap(params) {
    try {
      if (dx) {
        dx.request('openRoomMap', {
          ...params
        });
      }
    } catch (error) {
      console.log('[openRoomMap failed]');
    }
  },

  // 关闭行事历
  close() {
    try {
      if (dx) {
        dx.request('close');
      }
    } catch (error) {
      console.log('[closeWindow failed]');
    }
  }
};
