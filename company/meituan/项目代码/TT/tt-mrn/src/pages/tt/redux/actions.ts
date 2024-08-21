import { TTHomeFilterModel } from '../components/home/HomeFilter'

export const NAVIGATE_SCREEN = 'NAVIGATE_SCREEN'
export const UPDATE_FILTER_SELECTION = 'UPDATE_FILTER_SELECTION'
export const UPDATE_DETAIL_FILTER_SELECTION = 'UPDATE_DETAIL_FILTER_SELECTION'

// export const navigateScreen = (listType: PageType) => ({
//   type: NAVIGATE_SCREEN,
//   listType: listType
// })

export const updateFilterSelection = (
  filterSelection: TTHomeFilterModel,
  filterCount: number,
  confirm: boolean,
  reset?: boolean
) => ({
  type: UPDATE_FILTER_SELECTION,
  filterSelection: filterSelection,
  filterCount: filterCount,
  confirm: confirm,
  reset: reset
})

export const SET_TIME_ZONE = 'SET_TIME_ZONE';
export const SET_TIME_ZONE_LIST = 'SET_TIME_ZONE_LIST';

export const setTimeZone = (timeZone) => ({
  type: SET_TIME_ZONE,
  payload: timeZone,
});

export const setTimeZoneList = (timeZoneList) => ({
  type: SET_TIME_ZONE_LIST,
  payload: timeZoneList,
});

export const ACTION_UPDATE_USER_INFO = 'UPDATE_USER_INFO'
