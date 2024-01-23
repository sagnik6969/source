<template>
  <h1 data-testid="activation-page">Activation</h1>
</template>

<script setup>
import axios from 'axios'
import { onMounted, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// onMounted(() => {
//   axios.patch(`/api/v1/users/${route.params.token}/active`)
// })

// watch(
//   () => route.params.token,
//   () => axios.patch(`/api/v1/users/${route.params.token}/active`)
// )

watchEffect(() => axios.patch(`/api/v1/users/${route.params.token}/active`))
// watchEffect => replaces onMounted and watch when thr app loads and when route.params.token changes
// the function will be reevaluated.
</script>
