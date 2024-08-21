import { i18nClient } from '@sailor/i18n-mrn'
import React from 'react'
import { ImageBackground, StyleSheet, Text, TouchableHighlight, View } from '@mrn/react-native'
import { MWSStyle } from '@src/common/styles/MWSCommonStyle'
import theme from '@src/common/styles/MWSStyle'
import defaultAvatar from '@images/default-avator.png'

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
})

export interface CommentBarCollapsedProps {
  avatarUri?: string
  onPressInput: () => void
}

const CommentBarCollapsed: React.FC<CommentBarCollapsedProps> = ({ avatarUri, onPressInput }) => {
  return (
    <View style={[MWSStyle.rowWrapper, MWSStyle.white, { height: 62, paddingHorizontal: 16 }]}>
      <ImageBackground
        source={{ uri: avatarUri }}
        defaultSource={defaultAvatar}
        style={{
          height: 30,
          width: 30,
          borderRadius: 15,
          marginRight: 12,
          overflow: 'hidden',
        }}
      />

      <TouchableHighlight
        activeOpacity={0.6}
        underlayColor="#DDDDDD"
        style={[styles.textInput, { flex: 1 }]}
        onPress={onPressInput}
      >
        <Text style={{ color: theme.gray36 }}>
          {i18nClient.t('components_comment_21e8e0', { defaultValue: '@提醒TA看评论' })}
        </Text>
      </TouchableHighlight>
    </View>
  )
}

export default CommentBarCollapsed
