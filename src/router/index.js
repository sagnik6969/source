import SignUp from '@/views/sign-up/SignUp.vue'
import Home from '@/views/home/Home.vue'
import Activation from '@/views/activation/Activation.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Request from '@/views/password-reset/request/Request.vue'
import Set from '@/views/password-reset/set/Set.vue'
// import HomeView from '../views/HomeView.vue'
import User from '@/views/user/User.vue'
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
    },
    {
      path: '/password-reset/request',
      component: Request
    },
    {
      path: '/password-reset/set',
      component: Set
    },
    {
      path: '/user/:id',
      component: User
    }
  ]
})

export default router
