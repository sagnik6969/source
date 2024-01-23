<template>
  <h1 data-testid="activation-page">Activation</h1>
</template>

<script setup>
import axios from 'axios'
import { onMounted } from 'vue'

onMounted(() => {
  axios.patch('/api/v1/users/:token/active')
})
</script>
