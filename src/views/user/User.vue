<template>
  <div data-testid="user-page">
    <Card>
      <template v-slot:header> User Page </template>
      <template v-slot:default> <img src="@/assets/profile.png" alt="" /> </template>
      <template v-slot:footer> {{ user.username }}</template>
    </Card>
    <div v-if="apiProcessing">
      <span role="status" class="spinner-border spinner-border-sm"></span>
    </div>
    <div v-if="error" class="alert alert-success">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import Card from '@/components/Card.vue'
import http from '@/lib/http'
import axios from 'axios'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()
const error = ref('')

const user = ref({})
const apiProcessing = ref(false)

const loadUser = async () => {
  apiProcessing.value = true
  try {
    const response = await http.get(`/api/v1/users/${route.params.id}`)
    user.value = response.data
  } catch (e) {
    if (e.response?.status == 404) error.value = e.response?.data?.message
    else error.value = t('genericError')
  }
  apiProcessing.value = false
}

onMounted(() => {
  loadUser()
})

watch(
  () => route.params.id,
  () => loadUser()
)
</script>
