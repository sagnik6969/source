<template>
  <h1 data-testid="activation-page">Activation</h1>
  <span v-if="apiProcessing" role="status" class="spinner-border spinner-border-sm"></span>
  <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
  <div v-if="errorMessage" class="alert alert-success">{{ errorMessage }}</div>
</template>

<script setup>
import http from '../../lib/http.js'
import { onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const route = useRoute()

const apiProcessing = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
// onMounted(() => {
//   axios.patch(`/api/v1/users/${route.params.token}/active`)
// })

// watch(
//   () => route.params.token,
//   () => axios.patch(`/api/v1/users/${route.params.token}/active`)
// )

watchEffect(async () => {
  apiProcessing.value = true

  try {
    const response = await http.patch(`/api/v1/users/${route.params.token}/active`)
    successMessage.value = response.data.message
  } catch (error) {
    if (error?.response?.status == 400) {
      errorMessage.value = error.response?.data?.message
      // console.log(error.response.data.message)
    } else errorMessage.value = t('genericError')
  }

  apiProcessing.value = false
})
// watchEffect => replaces onMounted and watch when thr app loads and when route.params.token changes
// the function will be reevaluated.
</script>
