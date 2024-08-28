/**
 * schema 刷数据
 */

import { IJMLayout, IJMSchema, IJMComponent } from '@jimu/types';
import { captureSchemaError } from './errorManager';

const migration201 = (schema: IJMSchema): string => {
  const dfs = (node: IJMComponent): void => {
    if (!node) {
      return;
    }

    /**
     * 卡片组件删除layoutMOBILE 和 layoutPC
     */
    if (node.componentName === 'Card') {
      delete node.props.layoutMOBILE;
      delete node.props.layoutPC;
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach((childNode) => {
        dfs(childNode);
      });
    }

    if (node.props.layout === IJMLayout.vertical) {
      node.props.layout = IJMLayout.horizontal;
    }
  };

  schema.pages[0]?.layout?.children.forEach((node) => {
    dfs(node);
  });

  return JSON.stringify(schema);
};

export const schemaMigration = (schemaString: string): string => {
  try {
    const schema: IJMSchema = JSON.parse(schemaString);

    /**
     * 只有 2.0.0 的版本才需要处理
     */
    if (schema.schemaVersion === '2.0.0') {
      return migration201(schema);
    }

    return schemaString;
  } catch (err) {
    captureSchemaError(`${err}`);
    return schemaString;
  }
};
