import {
  UPDATE_ENV,
  UPDATE_TOKEN,
  UPDATE_USER,
  UPDATE_PACKAGE,
  UPDATE_USER_ORG,
  UPDATE_USER_MIS,
  UPDATE_SPACE_DOMAIN,
  UPDATE_LOGIN_TYPE
} from '../actions/types'

export const commonReducer = (state = {}, action) => {
  let {
    env,
    token,
    type,
    user,
    appName,
    userOrg,
    userMis,
    spaceDomain,
    loginType
  } = action
  switch (type) {
    case UPDATE_ENV:
      return { ...state, env: env }
    case UPDATE_TOKEN:
      return { ...state, token: token }
    case UPDATE_USER:
      return { ...state, user: user }
    case UPDATE_PACKAGE:
      return { ...state, appName: appName }
    case UPDATE_USER_ORG:
      return { ...state, userOrg: userOrg }
    case UPDATE_USER_MIS:
      return { ...state, userMis: userMis }
    case UPDATE_SPACE_DOMAIN:
      return { ...state, spaceDomain: spaceDomain }
    case UPDATE_LOGIN_TYPE:
      return { ...state, loginType: loginType }
    default:
      return state
  }
}
