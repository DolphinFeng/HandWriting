/*
 * @Description: url处理函数
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-11 21:34:38
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-01-26 11:42:58
 * @FilePath: /scheduleweb/src/utils/url.ts
 */

import {
  REG_URL,
  REG_SPEIL,
  EContentSchemaType,
  ETextHandlerType
} from '@/consts';

interface IUrlInfo {
  link: string;
  start: number;
  end: number;
}

function hasProtocol(val: string): boolean {
  return (
    val.startsWith('http://')
    || val.startsWith('https://')
    || val.startsWith('ftp://')
    || val.startsWith('mtdaxiang://')
  );
}

const transferSpecilToContent = (specilString: string) => {
  try {
    const textArray = specilString
      .substr(1, specilString.length - 2)
      .split('|');
    return [
      {
        type: EContentSchemaType.Link,
        content: textArray[0],
        link: hasProtocol(textArray[1])
          ? textArray[1]
          : `https://${textArray[1]}`
      }
    ];
  } catch (err) {
    console.error(err);
    return [];
  }
};
const getUrlListInString = (
  str = '',
  eHandlerType: ETextHandlerType
): IUrlInfo[] => {
  const urlList: IUrlInfo[] = [];
  let list: any = [];
  const reg = eHandlerType === ETextHandlerType.LINK ? REG_URL : REG_SPEIL;
  // eslint-disable-next-line
  while ((list = reg.exec(str)) !== null) {
    urlList.push({
      link: list[0],
      start: list.index,
      end: reg.lastIndex
    });
  }
  return urlList;
};

/**
 *
 * @param buffer
 * @param eHandlerType
 * 渲染带[|]的链接和正常链接 递归处理
 */
export const linkHandler = (
  buffer: string,
  eHandlerType: ETextHandlerType
): IContentSchema[] => {
  const links: IUrlInfo[] = getUrlListInString(buffer, eHandlerType);
  let currentIndex = 0;
  let textSchema: IContentSchema[] = [];

  for (const link of links) {
    const href = buffer.slice(link.start, link.end);
    const hrefSchemaArr = ETextHandlerType.LINK === eHandlerType
      ? [
        {
          type: EContentSchemaType.Link,
          content: href,
          link: hasProtocol(href) ? href : `https://${href}`
        }
      ]
      : transferSpecilToContent(href);

    const textSchemaArr = ETextHandlerType.LINK === eHandlerType
      ? [
        {
          type: EContentSchemaType.Text,
          content: buffer.slice(currentIndex, link.start)
        }
      ]
      : linkHandler(
        buffer.slice(currentIndex, link.start),
        ETextHandlerType.LINK
      );

    textSchema = [...textSchema, ...textSchemaArr, ...hrefSchemaArr];

    currentIndex = link.end;
  }

  const lastSchemaArr = ETextHandlerType.LINK === eHandlerType
    ? [
      {
        type: EContentSchemaType.Text,
        content: buffer.slice(currentIndex)
      }
    ]
    : linkHandler(buffer.slice(currentIndex), ETextHandlerType.LINK);
  textSchema = [...textSchema, ...lastSchemaArr];
  return textSchema;
};
