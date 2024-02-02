<template>
  <div data-testid="user-page">
    <Card>
      <template v-slot:header> User Page </template>
      <template v-slot:default> <img src="@/assets/profile.png" alt="" /> </template>
      <template v-if="status === 'success'" v-slot:footer>
        {{ data.username }}
        <button v-if="auth.id === data.id" @click="deleteUser" :disabled="apiProcessing">
          Delete
        </button>
        <span v-if="apiProcessing" role="status" class="spinner-border spinner-border-sm"></span>
      </template>
    </Card>
    <div v-if="status === 'loading'">
      <span role="status" class="spinner-border spinner-border-sm"></span>
    </div>
    <div v-if="status === 'fail'" class="alert alert-success">
      {{ error }}
    </div>
    <div v-if="deleteUserError" class="alert alert-success">
      {{ deleteUserError }}
    </div>
  </div>
</template>

<script setup>
import Card from '@/components/Card.vue'
import http from '@/lib/http'
const { auth, logout } = useAuthStore()
const getUserById = async (id) => {
  return await http.get(`/api/v1/users/${id}`)
}

import useRouteParamApiRequest from '@/shared/useRouteParamApiRequest.js'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
// import { router } from '../../../test/helper'
const { status, data, error } = useRouteParamApiRequest(getUserById, 'id')
const { t } = useI18n()
const router = useRouter()
const apiProcessing = ref(false)
const deleteUserError = ref('')
const deleteUser = async () => {
  if (confirm('are you sure')) {
    apiProcessing.value = true
    deleteUserError.value = ''

    try {
      await http.delete(`/api/v1/users/${data.value.id}`)
      logout()
      router.push('/')
    } catch (error) {
      deleteUserError.value = t('genericError')
    }

    apiProcessing.value = false
  }
}
</script>
