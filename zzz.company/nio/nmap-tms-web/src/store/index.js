import { createStore } from 'vuex'

export default createStore({
  state() {
    return {
      menuItem: '',
      activeBreadcrumbIndex: 1,
      rowDetails: JSON.parse(localStorage.getItem('rowDetails')) || [],
      attemptedUrl: '/TaskPage'
    }
  },
  getters: {
    getRowDetailByVersion: (state) => (version) => {
      return state.rowDetails.find(detail => detail.releaseVersion === version);
    }
  },
  mutations: {
    menuChange(state, path) {
      state.menuItem = path;
    },
    breadChange(state, index) {
      state.activeBreadcrumbIndex = index;
    },
    SET_ROW_DETAIL(state, rowDetail) {
      state.rowDetails.push(rowDetail);
      localStorage.setItem('rowDetails', JSON.stringify(state.rowDetails));
    },
    setAttemptedUrl(state, url) {
      state.attemptedUrl = url;
    }
  },
  actions: {
    setRowDetail({ commit }, rowDetail) {
      commit('SET_ROW_DETAIL', rowDetail);
    }
  },
  modules: {
  }
})