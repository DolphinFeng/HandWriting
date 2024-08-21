import Vue from 'vue';

// @ts-ignore：element自身问题
import { Upload, CascaderPanel, Cascader, Carousel, CarouselItem, Menu, MenuItem, Loading } from 'element-ui';
Vue.use(Upload);
Vue.use(CascaderPanel);
Vue.use(Cascader);
Vue.use(Carousel);
Vue.use(CarouselItem);
Vue.use(Menu);
Vue.use(MenuItem);
Vue.use(Loading.directive);
// TODO: 会遇到 _Loading is not defined 的问题
// Vue.prototype.$loading = Loading.service;
