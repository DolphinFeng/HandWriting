import Vue from 'vue';
import http from '../utils/http';

const Plugin = {
    install(_Vue: typeof Vue) {
    // alias
        _Vue.$http = http;
        _Vue.prototype.$http = http;
    }
};

Vue.use(Plugin);

export default Plugin;
