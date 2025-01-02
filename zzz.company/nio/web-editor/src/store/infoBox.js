//弹框设置
export const infoBox = {
  namespaced: true,
  state() {
    return {
      show: false, //弹框开关
      data: {},
      title: '',
    };
  },
  getters: {},
  mutations: {
    //改变弹窗信息
    turnInfoBox(state, {data, show, title}) {
      if (show === true) {
        state.data = data;
      }
      state.title = title;
      state.show = show;
    },
  },
  actions: {},
};
