import React, { createContext } from 'react'
import { CustomFieldModel } from '../../constants/TTServiceModule'
import { noop } from '@ss/mtd-react-native/lib/common/utils/fns'

export interface IState {
  isCustom: boolean
  customFieldList: CustomFieldModel[]
  updateCustom: (isCustom: boolean, list: CustomFieldModel[]) => void

  // updateCustomFieldList: (list: CustomFieldModel[]) => void
}

export const CreateNewTTContext = createContext<IState>({
  isCustom: false,
  customFieldList: [],
  updateCustom: noop
  // updateCustomFieldList: noop
})

interface CreateNewTTState {
  isCustom: boolean
  customFieldList: CustomFieldModel[]
}

export class CreateNewTTProvider extends React.Component<
  any,
  CreateNewTTState
> {
  // constructor(props: Readonly<any>) {
  //   super(props);
  //   this.state = {
  //     isCustom: false,
  //     customFieldList: []
  //   }
  // }

  state = {
    isCustom: false,
    customFieldList: []
  }

  updateCustom = (isCustom: boolean, list: CustomFieldModel[]) => {
    this.setState({ isCustom: isCustom, customFieldList: list })
  }

  render() {
    const { isCustom, customFieldList } = this.state
    return (
      <CreateNewTTContext.Provider
        value={{
          isCustom: isCustom,
          customFieldList: customFieldList,
          updateCustom: this.updateCustom
        }}
      >
        {this.props.children}
      </CreateNewTTContext.Provider>
    )
  }
}
