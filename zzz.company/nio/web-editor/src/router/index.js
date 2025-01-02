import { createRouter, createWebHashHistory } from 'vue-router'
import RoadContainer from "../views/map/RoadContainer.vue";
import login from "../views/login/login.vue";

const routes = [
  {
    path: '/',
    name: 'app',
    redirect: '/login',
  },
  {
    path: '/login',
    async beforeEnter(to, from) {
      if (from.path === '/' && localStorage.getItem('token')) {
        await router.replace({
          path: '/home',
        });
      }
    },
    component: login,
  },
  {
    path: '/home',
    name: 'home',
    component: RoadContainer,
    beforeEnter(to, from) {
      if (!localStorage.getItem('token')) {
        router.replace({
          path: '/login',
        });
      }
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router
