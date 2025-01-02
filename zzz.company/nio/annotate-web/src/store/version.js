import {ref, watch} from 'vue';

function sortVersion(versions) {
  versions.sort(function (a, b) {
    //如果是9位，则最高位不参与排序
    if (a.length >= 9) {
      a = a.slice(1, 10);
    }

    if (b.length >= 9) {
      b = b.slice(1, 10);
    }

    return a - b;
  });
  versions.reverse();
}

export const version = {
  namespaced: true,
  state() {
    return {
      versions: [],
      curVersion: '',
      versionsGeom2_0: [1, 2, 3],
      versionsGeom1_95: [4, 5, 6],
      versionsHd3_1: [7, 8, 9],
      versionsService: [10, 11, 12], //服务区
    };
  },
  getters: {},
  mutations: {
    //请求版本号列表初始化,或
    initVersionList(state, versions) {
      let versionsGeom2_0 = [];
      let versionsGeom1_95 = [];
      let versionsHd3_1 = [];
      let versionsService = [];

      for (let i = 0; i < versions.length; i++) {
        let version = versions[i];
        if (version.productType === 'PSP') {
          versionsService.push(parseInt(version.mapVersion));
        } else if (version.specVersion === 'NAD2.0') {
          versionsGeom2_0.push(parseInt(version.mapVersion));
        } else if (version.specVersion === 'NAD1.95') {
          versionsGeom1_95.push(parseInt(version.mapVersion));
        } else if (version.specVersion === 'TX3.1') {
          versionsHd3_1.push(parseInt(version.mapVersion));
        }
      }

      versions = versions.map((item) => item.mapVersion);
      versions = versions.map((item) => parseInt(item));

      sortVersion(versionsGeom2_0);
      sortVersion(versionsGeom1_95);
      sortVersion(versionsHd3_1);
      sortVersion(versionsService);

      state.versionsGeom2_0 = versionsGeom2_0;
      state.versionsGeom1_95 = versionsGeom1_95;
      state.versionsHd3_1 = versionsHd3_1;
      state.versionsService = versionsService;
      state.versions = versions;
      if (versionsGeom2_0.length !== 0) {
        state.curVersion = versionsGeom2_0[0];
      } else {
        state.curVersion = versions[0];
      }
    },
    resetVersionList(state) {
      state.versions = [];
      state.curVersion = '';
    },
    changeVersion(state, version) {
      if (state.versions.includes(parseInt(version))) {
        state.curVersion = parseInt(version);
      }
    },
  },
  actions: {},
};

export const layerPanelVisible = ref(false);
export const setLayerPanelVisible = function (visible) {
  layerPanelVisible.value = visible ?? !layerPanelVisible.value;
};

export const mapVersionPanelVisible = ref(false);

export const setMapVersionPanelVisible = function (visible) {
  mapVersionPanelVisible.value = visible ?? !mapVersionPanelVisible.value;
};
