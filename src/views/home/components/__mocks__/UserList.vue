<template>
  <div class="card">
    <div class="card-header text-center">
      <h3>User List</h3>
    </div>
  </div>
  <UserItem v-for="user in pageData.content" :user="user" :key="user.id" />
</template>

<script setup>
import { reactive } from 'vue'
import UserItem from '../UserItem.vue'
const pageData = reactive({
  content: [
    {
      id: 1,
      username: 'user1'
    }
  ],
  page: 0,
  size: 0,
  totalPages: 0
})
</script>
