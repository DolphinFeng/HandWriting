import { connect, ConnectedProps } from 'react-redux'
import store, { RootState } from './store'
import { fetchUserInfo, forceFetchUserInfo } from './thunks'

export const mapStateToExternalUserProps = (state: RootState) => ({
  isExternalUser: state.userInfo?.external
})

export const mapDispatchToUserInfoProps = (
  dispatch: typeof store.dispatch
) => ({
  dispatchFetchUserInfo: (force: boolean = false) => {
    return dispatch(force ? forceFetchUserInfo : fetchUserInfo)
  }
})

export const connectExternalUser = connect(
  mapStateToExternalUserProps,
  mapDispatchToUserInfoProps,
  null,
  { forwardRef: true }
)

export type InjectedExternalUserProps = ConnectedProps<
  typeof connectExternalUser
>
