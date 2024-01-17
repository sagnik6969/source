<template>
  <h1>Sign Up</h1>
  <div>
    <label for="username">Username</label>
    <input v-model="username" id="username" placeholder="Username" type="email" />
  </div>
  <div>
    <label for="email">E-mail</label>
    <input v-model="email" id="email" placeholder="E-mail" type="email" />
  </div>
  <div>
    <label for="password">Password</label>
    <input id="password" v-model="password" placeholder="Password" type="password" />
  </div>
  <div>
    <label for="passwordRepeat">Password Repeat</label>
    <input id="passwordRepeat" v-model="passwordRepeat" placeholder="Password" type="password" />
  </div>
  <div>
    <button :disabled="disabled" @click="submit">Sign up</button>
  </div>
</template>

<script setup>
import axios from 'axios'
import { computed, ref, watch } from 'vue'

const password = ref('')
const passwordRepeat = ref('')
const username = ref('')
const email = ref('')

const disabled = computed(() => {
  return password.value === '' || password.value !== passwordRepeat.value
})

const submit = () => {
  axios.post('api/vi/users', {
    username: username.value,
    email: email.value,
    password: password.value
  })
}
</script>
