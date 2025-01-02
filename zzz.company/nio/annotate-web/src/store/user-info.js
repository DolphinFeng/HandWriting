export const userInfo = {
  namespaced: true,
  state() {
    return {
      realName: localStorage.getItem('realName'),
    };
  },
  getters: {},
  mutations: {},
  actions: {},
};
