<template>
  <nav class="navbar navbar-expand bg-body-tertiary shadow-sm">
    <div class="container">
      <router-link class="navbar-brand" data-testid="link-home-page" to="/">
        <!-- <img src="@/assets/hoaxify.png" alt="Hoaxify logo" width="60" /> -->
        Hoaxify
      </router-link>
      <ul class="navbar-nav" v-if="!auth.id">
        <li class="nav-item">
          <router-link class="nav-link" data-testid="link-signup-page" to="/signup">{{
            $t('signUp')
          }}</router-link>
          <router-link class="nav-link" data-testid="link-login-page" to="/login">{{
            $t('LogIn')
          }}</router-link>
        </li>
      </ul>
      <li class="nav-item" v-if="auth.id">
        <router-link
          class="nav-link"
          :to="'/user/' + auth.id"
          data-testid="link-my-profile"
        ></router-link>
      </li>
      <li>
        <span class="nav-link" data-testid="link-logout" role="button" @click="logout">
          Log Out
        </span>
      </li>
      <li v-if="auth.id != 0" data-testid="user-nav">
        {{ auth.username }}
      </li>
      <li v-if="auth.id != 0" data-testid="profile-img-nav">
        <img src="@/assets/profile.png" alt="" />
      </li>
    </div>
  </nav>
</template>

<script setup>
import http from '@/lib/http'
import { useAuthStore } from '@/stores/auth'

const { auth, logout: logoutStore } = useAuthStore()

const logout = async () => {
  logoutStore()

  try {
    await http.post('/api/v1/logout')
  } catch {}
}
</script>
