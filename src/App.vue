<script setup>
import SignUp from './views/sign-up/SignUp.vue'
import LanguageSelector from './components/LanguageSelector.vue'
</script>

<template>
  <main class="container">
    <LanguageSelector />
    <router-link data-testid="link-home-page" to="/">Hoaxify</router-link>
    <router-link data-testid="link-signup-page" to="/signup">{{ $t('signUp') }}</router-link>
    <!-- <SignUp /> -->
    <RouterView />
  </main>
</template>

<style scoped></style>
