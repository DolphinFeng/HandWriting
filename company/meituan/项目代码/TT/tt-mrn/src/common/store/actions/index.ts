import {
  UPDATE_ENV,
  UPDATE_TOKEN,
  UPDATE_USER,
  UPDATE_PACKAGE,
  UPDATE_USER_ORG,
  UPDATE_USER_MIS,
  UPDATE_SPACE_DOMAIN,
  UPDATE_LOGIN_TYPE
} from './types'
import { UserInfo } from '../ServiceModule'

export const updateEnv = (env: string) => ({
  type: UPDATE_ENV,
  env
})

export const updateToken = (token: string) => ({
  type: UPDATE_TOKEN,
  token
})

export const updateUser = (user: UserInfo) => ({
  type: UPDATE_USER,
  user: user
})

export const updateUserOrg = (userOrg: string) => ({
  type: UPDATE_USER_ORG,
  userOrg: userOrg
})

export const updateUserMis = (userMis: string) => ({
  type: UPDATE_USER_MIS,
  userMis: userMis
})

export const updatePackage = (appName: string) => ({
  type: UPDATE_PACKAGE,
  appName: appName
})

export const updateSpaceDomain = (spaceDomain: string) => ({
  type: UPDATE_SPACE_DOMAIN,
  spaceDomain: spaceDomain
})

export const updateLoginType = (loginType: string) => ({
  type: UPDATE_LOGIN_TYPE,
  loginType: loginType
})
