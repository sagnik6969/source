import SignUp from '@/views/sign-up/SignUp.vue'
import Home from '@/views/home/Home.vue'
import Activation from '@/views/activation/Activation.vue'
import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/signup',
      component: SignUp
    },
    {
      path: '/activation/:token',
      component: Activation
    }
  ]
})

export default router
