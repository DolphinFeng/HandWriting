import { StyleSheet } from '@mrn/react-native'

export default StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    flex: 1
  },
  watermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
    height: '100%',
    width: '100%'
  }
})
