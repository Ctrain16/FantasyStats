import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/player/:id',
    name: 'Player',
    props: true,
    component: () => import('../views/Player.vue')
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
