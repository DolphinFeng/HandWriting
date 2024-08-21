import { combineReducers } from 'redux'
import { commonReducer } from './auth'

export default combineReducers({
  dxAuth: commonReducer
})
