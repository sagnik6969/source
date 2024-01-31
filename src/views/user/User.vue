<template>
  <div data-testid="user-page">
    <Card>
      <template v-slot:header> User Page </template>
      <template v-slot:default> <img src="@/assets/profile.png" alt="" /> </template>
      <template v-if="status === 'success'" v-slot:footer> {{ data.username }}</template>
    </Card>
    <div v-if="status === 'loading'">
      <span role="status" class="spinner-border spinner-border-sm"></span>
    </div>
    <div v-if="status === 'fail'" class="alert alert-success">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import Card from '@/components/Card.vue'
import http from '@/lib/http'

const getUserById = async (id) => {
  return await http.get(`/api/v1/users/${id}`)
}

import useRouteParamApiRequest from '@/shared/useRouteParamApiRequest.js'
const { status, data, error } = useRouteParamApiRequest(getUserById, 'id')
</script>
