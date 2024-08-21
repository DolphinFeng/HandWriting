import React from 'react'
import { Image, View, StyleSheet } from '@mrn/react-native'
import { pixel } from '@onejs/mrn-utils'
import { styles } from './style'

export interface IAvatarProps {
  img: string
  width?: number
  isOrganizer?: boolean
}

export const Avatar: React.FunctionComponent<IAvatarProps> = (props: IAvatarProps): JSX.Element => {
  const { img, width = 36, isOrganizer = false } = props
  const customStyles = StyleSheet.create({
    view: {
      width: pixel.px2dp(width),
      height: pixel.px2dp(width)
    },
    icon: {
      width: pixel.px2dp(Math.floor(width / 2.5)),
      height: pixel.px2dp(Math.floor(width / 2.5))
    }
  })

  return (
    <View>
      <View style={[styles.container, { borderRadius: Math.floor(width / 2) }]}>
        <Image
          style={customStyles.view}
          source={{
            uri: img || null
          }}
        />
      </View>
      {isOrganizer && (
        <Image
          source={require('@src/assets/image/organizer.png')}
          style={[styles.organizer, customStyles.icon]}
        />
      )}
    </View>
  )
}
