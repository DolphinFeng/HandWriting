import * as React from 'react'
import { openURL } from '@onejs/mrn-utils'
import { Text } from '@mrn/react-native'
import { ESchemaType, ISchema } from './interfaces'
import { styles } from './styles'

interface IMemoRendererProps {
  schema: ISchema[]
}

export const MemoRenderer: React.FC<IMemoRendererProps> = ({ schema }) => (
  <Text style={styles.text}>
    {schema.map((item, index) => {
      if (item.type === ESchemaType.Text) {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Text key={index} style={styles.text}>
            {item.content}
          </Text>
        )
      } else if (item.type === ESchemaType.Link) {
        return (
          <Text
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            numberOfLines={1}
            style={[styles.text, styles.link]}
            onPress={() => {
              openURL(item.link)
            }}
          >
            {item.content}
          </Text>
        )
      }

      return null
    })}
  </Text>
)
