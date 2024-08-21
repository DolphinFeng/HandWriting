import React from 'react'
import { Text, View } from '@mrn/react-native'
import styles from './style'

interface IDemoComponentProps {
  desc: string
}

export const DemoComponent = (props: IDemoComponentProps) => {
  const { desc } = props
  return (
    <View style={styles.container}>
      <Text>{desc}</Text>
      <Text>Demo Component</Text>
    </View>
  )
}

// export class DemoComponent extends React.Component<IDemoComponentProps> {
//   render() {
//     console.log('===>', this.props)
//     return <View>
//       <Text>Demo Component</Text>
//       <Text>{this.props.desc}</Text>
//     </View>
//   }
// }
