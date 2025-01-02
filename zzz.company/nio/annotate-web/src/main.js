//必须先加载layerController.js，以初始化图层控制类
import './config/config.js';
import {createViewer} from './cesium/create-viewer.js';
import {createInputAction} from './system/event.js';
import {toolManager} from './system/tool.ts';
import {createApp} from 'vue';
import App from './App.vue';
import router from './router/router.js';
import store from './store/store.js';
import './index.scss';
import './assets/fonts/iconfont.css';
import 'element-plus/theme-chalk/src/message.scss';
import 'element-plus/theme-chalk/base.css';
import 'element-plus/es/components/message/style/css'; //ElMessage样式
import 'element-plus/es/components/notification/style/css'; //Notification样式
import 'element-plus/es/components/message-box/style/css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import './system/keyboard.js';

createViewer();
createInputAction();

toolManager.setDefaultTool();

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(store).use(router).mount('#app');
