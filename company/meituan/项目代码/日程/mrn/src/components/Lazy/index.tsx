/* eslint-disable react/jsx-props-no-spreading */
// 包装一个简单的 Lazy Load Component 的方法
import React, { Suspense, lazy } from 'react'
import { DefLoading } from './DefLoading'

function Lazy({ loader, loading }: { loader: Function; loading?: any }): React.ComponentClass {
  const Loading = loading || DefLoading
  const LazyComp = lazy(async () => /* await */ loader())
  class LazyReactComponentScreen extends React.PureComponent {
    render() {
      return (
        <Suspense fallback={<Loading />}>
          <LazyComp {...this.props} />
        </Suspense>
      )
    }
  }

  return LazyReactComponentScreen
}

export default Lazy
