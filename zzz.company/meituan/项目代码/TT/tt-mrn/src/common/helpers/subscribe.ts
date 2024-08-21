import KNB from '@mrn/mrn-knb'

export enum ActionType {
  APPEAR = 'appear',
  DISAPPEAR = 'disappear',
  BACKGROUND = 'background',
  FOREGROUND = 'foreground'
}
export function subscription(handleEvent, vAction: ActionType) {
  KNB.subscribe({
    action: vAction,
    handle: function (data) {
      console.log('sub handle ', data)
      handleEvent(data)
    },
    success: function (data) {
      console.log('sub success ', data)
    }
    // fail: null
  })
}

export function unsubscription(vAction: ActionType) {
  KNB.unsubscribe({
    subId: '',
    action: vAction
    // success: null,
    // fail: null
  })
}

export function publishAction(vAction: ActionType, vData) {
  vData = 'cccc'
  console.log('publish start ', vData)
  KNB.publish({
    level: 1, // 全局广播
    action: vAction,
    data: vData,
    success: function (data) {
      console.log('publish success', data)
    }
  })
}
