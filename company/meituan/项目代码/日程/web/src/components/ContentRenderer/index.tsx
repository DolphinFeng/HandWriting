/*
 * @Description: 描述内容渲染 支持链接
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-11 21:53:24
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-11-05 13:31:32
 * @FilePath: /scheduleweb/src/components/ContentRenderer/index.tsx
 */

import React from 'react';
import { linkHandler } from '@/utils';
import { IContentSchema, EContentSchemaType, ETextHandlerType } from '@/consts';

interface IContentRendererProps {
  text: string;
}

export default function ContentRenderer(
  props: IContentRendererProps = {
    text: ''
  }
): JSX.Element {
  const { text } = props;
  const list: IContentSchema[] = linkHandler(text, ETextHandlerType.SPECILLINK);

  return (
    <div>
      {list.map((item, index) => {
        if (item.type === EContentSchemaType.Text) {
          return (
            <span
              key={index}
              style={{
                wordBreak: 'break-all',
                whiteSpace: 'pre-wrap'
              }}
            >
              {item.content}
            </span>
          );
        }
        return (
          <a
            style={{
              wordBreak: 'break-all'
            }}
            key={index}
            target="_blank"
            rel="noopener noreferrer"
            href={item.link}
          >
            {item.content}
          </a>
        );
      })}
    </div>
  );
}
