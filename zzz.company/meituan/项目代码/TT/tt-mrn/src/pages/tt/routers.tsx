import {
  createStackNavigator,
  createSwitchNavigator
} from '@mrn/react-navigation'
import HeaderRightBtn from '@src/components/NavRightButton'
import React from 'react'
import HomeList from '@src/pages/tt/components/home/HomeList'
import Detail from '@src/pages/tt/components/detail/Detail'
import Comment from '@src/pages/tt/components/comment/Comment'
import { getKey } from '@src/common/helpers/api'
import HeaderLeftBtn from '@src/components/NavLeftButton'
import { MWSStyle } from '@src/common/styles/MWSCommonStyle'
import CreateNewTT from './components/create/CreateNewTT'
import Home from './components/home/Home'
import { Platform, View, TouchableOpacity } from '@mrn/react-native'
import HomeExternal from './components/home/HomeExternal'
import MyCreatedList from './components/home/MyCreatedList'
import MyTodoList from './components/home/MyTodoList'
import HomeSpace from './components/home/HomeSpace'
import RGHome from './components/home/RGHome'
import { withUserInfo } from './components/withUserInfo'
import { i18nClient } from '@sailor/i18n-mrn'
import { Icon } from '@ss/mtd-react-native'
import { getTTlinkByEnv, isXiaoXiang } from '../tt/components/common/TTHelper'

const testHomeLink = 'http://tt.cloud.test.sankuai.com/'
const onlineHomeLink = 'https://tt.sankuai.com/'


const HomeStack = createSwitchNavigator(
  {
    Home: {
      screen: Home
    }
  },
  {
    initialRouteName: 'Home'
  }
)

const routeMap = {
  Home: {
    screen: HomeStack,
    navigationOptions: () => ({
      title: 'TT',
      headerStyle: MWSStyle.headerStyle,
      headerTitleStyle: MWSStyle.headerTitleStyle,
      headerLeft:
        Platform.OS === 'ios' ? null : <View style={{ marginLeft: 16 }} />,
      headerBackTitle: null,

      headerRight: (
        <HeaderRightBtn
          pageType={1}
          pageInfo={{
            name: 'TT',
            brief: 'TT',
            listLink: getKey('env') === 'test' ? testHomeLink : onlineHomeLink,
            detailLink: '',
            lxCopyKey: '',
            lxShareListKey: '',
            lxShareDetailKey: ''
          }}
        />
      )
    })
  },
  HomeList: {
    screen: HomeList
  },
  HomeExternal: {
    screen: HomeExternal
  },
  HomeSpace: {
    screen: HomeSpace
  },
  Detail: {
    screen: Detail,
    navigationOptions: ({ navigation }) => ({
      title: isXiaoXiang()
        ? i18nClient.t('components_detail_f26225', { defaultValue: '详情' })
        : i18nClient.t('components_detail_ab47e6', { defaultValue: 'TT详情' }),
      headerStyle: MWSStyle.headerStyle,
      headerTitleStyle: MWSStyle.headerTitleStyle,
      gesturesEnabled: true,
      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            console.log('1111mmmmm')
  
            const { state, goBack } = navigation
            // TODO: 判断处理过以后才去刷新
            state.params?.refresh && state.params?.refresh()
  
            if (state.params?.goBackKey != null) {
              goBack(state.params?.goBackKey)
            } else {
              navigation.back()
            }
          }}
        >
          <Icon type="left" style={{ height: 20, width: 20, marginLeft: 12 }} />
        </TouchableOpacity>
      ),
  
      headerBackTitle: null,
      headerRight: (
        <HeaderRightBtn
          pageType={2}
          pageInfo={{
            name: 'TT',
            brief: navigation.getParam(
              'name',
              i18nClient.t('components_detail_ab47e6', { defaultValue: 'TT详情' }),
            ),
            listLink: '',
            detailLink: getTTlinkByEnv(navigation.state?.params?.ticketId ?? 0),
            lxCopyKey: '',
            lxShareListKey: '',
            lxShareDetailKey: '',
          }}
          navigation={navigation}
        />
      ),
    })
  },
  CreateNewTT: {
    screen: CreateNewTT
  },
  Comment: {
    screen: Comment,
    navigationOptions: ({ navigation }) => ({
      title: navigation.getParam(
        '__title__',
        i18nClient.t('components_comment_55374d', { defaultValue: '评论' }),
      ),
      headerStyle: MWSStyle.headerStyle,
      headerTitleStyle: MWSStyle.headerTitleStyle,
      gesturesEnabled: true,
      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Detail', {})
          }}
        >
          <Icon type="left" style={{ height: 20, width: 20, marginLeft: 12 }} />
        </TouchableOpacity>
      ),
    
      headerBackTitle: null,
      headerRight: (
        <HeaderRightBtn
          pageType={2}
          pageInfo={{
            name: 'TT',
            brief: i18nClient.t('components_detail_ab47e6', { defaultValue: 'TT详情' }),
            listLink: '',
            detailLink:
              getKey('env') === 'test'
                ? `http://tt.cloud.test.sankuai.com/ticket/detail?id=${navigation.getParam(
                  'ticketId',
                  0,
                )}`
                : `https://tt.sankuai.com/ticket/detail?id=${navigation.getParam('ticketId', 0)}`,
            lxCopyKey: '',
            lxShareListKey: '',
            lxShareDetailKey: '',
          }}
        />
      ),
    })
  },
  MyCreatedList: {
    screen: MyCreatedList
  },
  MyTodoList: {
    screen: MyTodoList
  },
  RGHome: {
    screen: RGHome
  }
}

export let RootStack = withUserInfo(
  createStackNavigator(routeMap, {
    initialRouteName: 'Home'
  })
)

export let HomeExternalStack = withUserInfo(
  createStackNavigator(routeMap, {
    initialRouteName: 'HomeExternal'
  })
)

export let HomeSpaceStack = withUserInfo(
  createStackNavigator(routeMap, {
    initialRouteName: 'HomeSpace'
  })
)

export let HomeListStack = withUserInfo(
  createStackNavigator(routeMap, {
    initialRouteName: 'HomeList'
  })
)

export let DetailRootStack = withUserInfo(
  createStackNavigator(routeMap, {
    initialRouteName: 'Detail'
  })
)

export let CreateNewTTFromUrl = withUserInfo(
  createStackNavigator(routeMap, {
    initialRouteName: 'CreateNewTT'
  })
)

export let RGStack = withUserInfo(
  createStackNavigator(routeMap, {
    initialRouteName: 'RGHome'
  })
)
