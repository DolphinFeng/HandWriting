/* eslint-disable @typescript-eslint/indent */
import { REG_URL, REG_URL_STR } from '@onejs/mrn'
import { warn, isStartWithProtocol } from '@onejs/mrn-utils'
import { ISchema, ETextHandlerType, IUrlInfo, ESchemaType } from './interfaces'

export const REG_SPEIL_URL = `\\[[^\\|]+\\|${REG_URL_STR}\\]`
export const REG_SPEIL = new RegExp(REG_SPEIL_URL, 'gi')

export const getUrlsByString = (
  str: string = '',
  textHandlerType: ETextHandlerType
): IUrlInfo[] => {
  const urlList: IUrlInfo[] = []
  let list: any = []
  const reg = textHandlerType === ETextHandlerType.Link ? REG_URL : REG_SPEIL
  // eslint-disable-next-line no-cond-assign
  while ((list = reg.exec(str)) !== null) {
    urlList.push({
      link: list[0],
      start: list.index,
      end: reg.lastIndex
    })
  }
  return urlList
}

const transferSpecialToContent = (specilString: string) => {
  try {
    const textArray = specilString.substr(1, specilString.length - 2).split('|')
    return [
      {
        type: ESchemaType.Link,
        content: textArray[0],
        link: isStartWithProtocol(textArray[1]) ? textArray[1] : `https://${textArray[1]}`
      }
    ]
  } catch (err) {
    warn('transferSpecialToContent', err)
    return []
  }
}

export const text2Schema = (
  text: string,
  textHandlerType = ETextHandlerType.SpecialLink
): ISchema[] => {
  const links: IUrlInfo[] = getUrlsByString(text, textHandlerType)

  let currentIndex = 0
  let textSchema: ISchema[] = []

  for (const link of links) {
    const href = text.slice(link.start, link.end)
    const hrefSchemaArr =
      ETextHandlerType.Link === textHandlerType
        ? [
            {
              type: ESchemaType.Link,
              content: href,
              link: isStartWithProtocol(href) ? href : `https://${href}`
            }
          ]
        : transferSpecialToContent(href)

    const textSchemaArr =
      ETextHandlerType.Link === textHandlerType
        ? [
            {
              type: ESchemaType.Text,
              content: text.slice(currentIndex, link.start)
            }
          ]
        : text2Schema(text.slice(currentIndex, link.start), ETextHandlerType.Link)

    textSchema = [...textSchema, ...textSchemaArr, ...hrefSchemaArr]

    currentIndex = link.end
  }

  const lastSchemaArr =
    ETextHandlerType.Link === textHandlerType
      ? [
          {
            type: ESchemaType.Text,
            content: text.slice(currentIndex)
          }
        ]
      : text2Schema(text.slice(currentIndex), ETextHandlerType.Link)
  textSchema = [...textSchema, ...lastSchemaArr]
  return textSchema
}
