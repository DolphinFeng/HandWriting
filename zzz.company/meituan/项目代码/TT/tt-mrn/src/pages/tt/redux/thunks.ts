import { Action } from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { getUserInfo, getTimeZoneOptions } from '../constants/TTApi'
import { TTUserInfo } from '../constants/TTServiceModule'
import { ACTION_UPDATE_USER_INFO, setTimeZone, setTimeZoneList } from './actions'
import { RootState } from './store'

export type AppThunk<R> = ThunkAction<R, RootState, unknown, Action<string>>
export type AppDispatch = ThunkDispatch<RootState, unknown, Action<string>>

export const fetchUserInfo: AppThunk<Promise<TTUserInfo>> = async (
  dispatch,
  getState
) => {
  const userInfo = getState().userInfo
  if (userInfo) {
    return userInfo
  }
  return await forceFetchUserInfo(dispatch, getState, undefined)
}

export const forceFetchUserInfo: AppThunk<
  Promise<TTUserInfo>
> = async dispatch => {
  try {
    const resp = await getUserInfo()
    if (resp?.code === 200 && resp?.data) {
      const data = resp.data
      dispatch({ type: ACTION_UPDATE_USER_INFO, data })
      return data
    }
  } catch (e) {}
}

export const dispatchSetTimeZone = (selectedTimeZone) => async (dispatch) => {
  dispatch(setTimeZone(selectedTimeZone));
};