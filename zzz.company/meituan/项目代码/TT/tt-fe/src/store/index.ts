import Vue from 'vue';
import Vuex from 'vuex';
import tt from './modules/tt';

Vue.use(Vuex);
const debug: boolean = process.env.NODE_ENV !== 'production';

const store = new Vuex.Store({
    modules: {
        tt
    },
    strict: debug
});

export default store;
