import { createStore } from 'vuex'

export default createStore({
  state() {
    return {
      menuItem: '',
      activeBreadcrumbIndex: 1,
    }
  },
  getters: {
  },
  mutations: {
    menuChange(state, path) {
      state.menuItem = path;
    },
    //切换当前面包屑。很不流畅的切换方法。。。历史遗留问题，改起来麻烦现在就这样做
    breadChange(state, index) {
      state.activeBreadcrumbIndex = index;
    }
  },
  actions: {
  },
  modules: {
  }
})
