import React from 'react'
import {
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  ViewProps
} from '@mrn/react-native'
import { modalMarginTop } from '@src/pages/tt/components/common/TTHelper'

const { height: screenHeight } = Dimensions.get('screen')
const { softMenuBarHeight } = Dimensions.get('window')

const SafeModalContainer = (props: React.PropsWithChildren<ViewProps>) => {
  const { children, ...resetProps } = props
  return (
    <SafeAreaView
      {...resetProps}
      style={[
        { height: screenHeight - modalMarginTop - (softMenuBarHeight ?? 0) },
        resetProps.style
      ]}
    >
      <KeyboardAvoidingView
        style={styles.fill}
        keyboardVerticalOffset={modalMarginTop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {props.children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default SafeModalContainer

const styles = StyleSheet.create({
  fill: {
    flex: 1
  }
})
