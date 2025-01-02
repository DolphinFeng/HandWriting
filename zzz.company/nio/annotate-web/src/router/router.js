import {createRouter, createWebHashHistory} from 'vue-router';
import MainContainer from '../views/main-container.vue';
import login from '../views/login.vue';

export let queryClone = undefined;

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
    component: MainContainer,
    beforeEnter(to, from) {
      queryClone = undefined;
      if (!localStorage.getItem('token')) {
        router.replace({
          path: '/login',
        });
      }
    },
  },
  {
    path: '/params',
    name: 'params',
    component: MainContainer,
    beforeEnter(to, from) {
      queryClone = to.query;
      if (!localStorage.getItem('token')) {
        router.replace({
          path: '/login',
        });
      }
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
