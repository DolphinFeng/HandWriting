/* eslint-disable implicit-arrow-linebreak */
import {
  createStackNavigator,
  NavigationRouteConfigMap,
  StackNavigatorConfig
} from '@mrn/react-navigation'
// 懒加载提升首屏性能
import lazy from '@src/components/Lazy'

const routers: NavigationRouteConfigMap = {
  Home: {
    screen: lazy({
      loader: () => import('@src/pages/Home')
    }),
    navigationOptions: {
      header: null
    }
  },
  Detail: {
    screen: lazy({
      loader: () => import('@src/pages/Detail')
    }),
    navigationOptions: {
      header: null
    }
  },
  Busy: {
    screen: lazy({
      loader: () => import('@src/pages/Busy')
    }),
    navigationOptions: {
      header: null
    }
  },
  Edit: {
    screen: lazy({
      loader: () => import('@src/pages/Edit')
    }),
    navigationOptions: {
      header: null
    }
  },
  NoticePicker: {
    screen: lazy({
      loader: () => import('@src/pages/NoticePicker')
    }),
    navigationOptions: {
      header: null
    }
  },
  RecurrencePicker: {
    screen: lazy({
      loader: () => import('@src/pages/RecurrencePicker')
    }),
    navigationOptions: {
      header: null
    }
  },
  AddAttendee: {
    screen: lazy({
      loader: () => import('@src/pages/AddAttendee')
    }),
    navigationOptions: {
      header: null
    }
  },
  SearchAttendee: {
    screen: lazy({
      loader: () => import('@src/pages/SearchAttendee')
    }),
    navigationOptions: {
      header: null
    }
  },
  DeleteAttendee: {
    screen: lazy({
      loader: () => import('@src/pages/DeleteAttendee')
    }),
    navigationOptions: {
      header: null
    }
  },
  CustomRecurrence: {
    screen: lazy({
      loader: () => import('@src/pages/CustomRecurrence')
    }),
    navigationOptions: {
      header: null
    }
  },
  AttendeeList: {
    screen: lazy({
      loader: () => import('@src/pages/AttendeeList')
    }),
    navigationOptions: {
      header: null
    }
  }
}

export const createRootStack = (stackConfig?: StackNavigatorConfig) =>
  createStackNavigator(routers, stackConfig)
