import {createApp} from 'vue'
import * as Vue from 'vue';
import App from './App.vue';
import './style.css';
import './assets/font/iconfont.css';
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import 'animate.css'
import router from "@/router";
import store from "@/store";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import JsonViewer from 'vue-json-viewer';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/es/components/message/style/css'
// import 'element-plus/theme-chalk/dark/css-vars.css';

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.directive('test', {
    mounted(el, binding, vnode) {
        console.log('自定义指令');
    }
});
// let t = app.directive('test');
// console.log(t);

app.use(router).use(store).use(JsonViewer).use(ElementPlus);
app.mount('#app');
