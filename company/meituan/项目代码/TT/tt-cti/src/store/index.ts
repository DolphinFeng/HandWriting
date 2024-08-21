import Vue from 'vue';
import Vuex from 'vuex';
import cti from './modules/cti';

Vue.use(Vuex);

// 开发模式下严格一些
const strict = process.env.VUE_APP_VUEX_STORE_STRICT === 'true';

const store = new Vuex.Store({
    modules: {
        cti
    },
    strict
});

export default store;
