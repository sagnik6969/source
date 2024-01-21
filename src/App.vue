<script setup>
import SignUp from './views/sign-up/SignUp.vue'
import LanguageSelector from './components/LanguageSelector.vue'
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <NavBar />
  <main class="container">
    <RouterView />
    <LanguageSelector />
  </main>
</template>

<style scoped></style>
