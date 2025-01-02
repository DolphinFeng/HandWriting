//必须先加载layerController.js，以初始化图层控制类
import './config.js';
import './system/layer/layerController.js';
import './system/layer/tileLayer/tileLayerController.js';
import './system/odd/oddLayer.js';
import './event/keyboard.js';
import './event/mouse.js';
import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './index.scss';
import './assets/fonts/iconfont.css';
import 'element-plus/theme-chalk/src/message.scss';
import 'element-plus/theme-chalk/base.css';
import 'element-plus/es/components/message/style/css'; //ElMessage样式
import 'element-plus/es/components/notification/style/css'; //Notification样式
import 'element-plus/es/components/message-box/style/css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(store).use(router).mount('#app');
