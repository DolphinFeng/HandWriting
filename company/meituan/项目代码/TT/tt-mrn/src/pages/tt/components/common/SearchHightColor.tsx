import React from 'react'
import { Text } from '@mrn/react-native'

/**
 * 关键字高亮
 * 核心思想：将 ‘搜索的关键字’ 替换成，空格 + 关键字 + 空格 的字符串，在使用 ‘空格’ 将字符串分割成数组形式
 * 如果忽略大小写则regExp 改为“gi”
 * @param searchText
 * @param originText
 */
export function _searchHightColor(searchText, originText) {
  let reg1 = new RegExp(searchText, 'g')
  return (
    <Text>
      {('' + originText + '')
        .replace(reg1, ' ' + searchText + ' ')
        .split(' ')
        .map((item, index) => {
          if (reg1.test(item) && searchText !== '') {
            return (
              <Text key={index} style={{ color: '#FF8800' }}>
                {item}
              </Text>
            )
          } else {
            return <Text key={index}>{item}</Text>
          }
        })}
    </Text>
  )
}
