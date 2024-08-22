import { StyleSheet } from '@mrn/react-native'

export const CommonFlexStyles = StyleSheet.create({
  flexDefault: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  flexCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  flexStart: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  flexEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  flexColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  flexColumnStart: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start'
  }
})
