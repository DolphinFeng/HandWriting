import {
  NAVIGATE_SCREEN,
  UPDATE_FILTER_SELECTION,
  UPDATE_DETAIL_FILTER_SELECTION,
  ACTION_UPDATE_USER_INFO,
  SET_TIME_ZONE,
  SET_TIME_ZONE_LIST 
} from './actions'
import { combineReducers, Reducer } from 'redux'
import { commonReducer } from '@src/common/store/reducers/auth'
import { TTUserInfo } from '../constants/TTServiceModule'

export const templateReducer = (state = {}, action) => {
  let { type, listType, filterSelection, filterCount, confirm, reset } = action
  switch (type) {
    // case NAVIGATE_SCREEN:
    //   return { ...state, listType: listType }
    case UPDATE_FILTER_SELECTION:
      return {
        ...state,
        filterSelection: filterSelection,
        filterCount: filterCount,
        confirm: confirm,
        reset: reset
      }
    default:
      return state
  }
}

export const templateDetailReducer = (state = {}, action) => {
  let { type, listType, filterSelection, filterCount, confirm } = action
  switch (type) {
    case UPDATE_DETAIL_FILTER_SELECTION:
      return {
        ...state,
        filterSelection: filterSelection,
        filterCount: filterCount,
        confirm: confirm
      }
    default:
      return state
  }
}

const userInfoReducer: Reducer<null | TTUserInfo> = (state = null, action) => {
  const { type, data } = action
  switch (type) {
    case ACTION_UPDATE_USER_INFO: {
      return data
    }
  }
  return state
}


const initialState = {
  timeZone: 'Asia/Shanghai',  // 默认时区
  timeZoneList: new Map([
      ['GMT+08:00', 'Asia/Shanghai'],
      ['GMT+03:00', 'Asia/Riyadh'],
  ]),
};

const timeZoneReducer = (state = initialState, action) => {
  switch (action.type) {
      case SET_TIME_ZONE:
          return {
              ...state,
              timeZone: action.payload,
          };
      case SET_TIME_ZONE_LIST:
          return {
              ...state,
              timeZoneList: action.payload,
          };
      default:
          return state;
  }
};

export default combineReducers({
  dxAuth: commonReducer,
  ttHomeReducer: templateReducer,
  ttDetailReducer: templateDetailReducer,
  userInfo: userInfoReducer,
  timeZone: timeZoneReducer
})
