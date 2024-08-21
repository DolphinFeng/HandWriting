import React from 'react';
import { dynamic } from 'umi';


export default dynamic({
  async loader() {
    // 这里的注释 webpackChunkName 可以指导 webpack 将该组件 HugeA 以这个名字单独拆出去
    const { default: DetailPopContent } = await import(/* webpackChunkName: "external_detailPopContent" */ './index');
    return DetailPopContent;
  },
  loading: () => <div style={{ height: '100px' }} />
});
