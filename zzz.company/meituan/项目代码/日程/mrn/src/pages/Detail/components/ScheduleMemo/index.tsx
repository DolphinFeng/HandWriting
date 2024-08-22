import React from 'react'
import { text2Schema } from './util'
import { MemoRenderer } from './MemoRenderer'

interface IScheduleMemoProps {
  memo: string
}

export const ScheduleMemo = (props: IScheduleMemoProps) => {
  const { memo = '' } = props
  const unshow = !memo
  if (unshow) {
    return null
  }

  const schema = text2Schema(memo)

  return <MemoRenderer schema={schema} />
}
