import React from 'react'
import { ERROR_CODE } from '@src/common/consts'
import { Exception } from './Exception'

interface IErrorCodeExceptionProps {
  errorCode: string
}

export const ErrorCodeException: React.FC<IErrorCodeExceptionProps> = ({ errorCode }) => {
  let error = ERROR_CODE.find(item => item.code === errorCode)
  if (!error) {
    error = ERROR_CODE[0]
  }

  return <Exception text={error.message} icon={error.icon || 'dx-callock'} />
}
