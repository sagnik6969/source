<template>
  <h1>Sign Up</h1>
  <div>
    <label for="username">Username</label>
    <input v-model="formState.username" id="username" placeholder="Username" type="email" />
  </div>
  <div>
    <label for="email">E-mail</label>
    <input v-model="formState.email" id="email" placeholder="E-mail" type="email" />
  </div>
  <div>
    <label for="password">Password</label>
    <input id="password" v-model="formState.password" placeholder="Password" type="password" />
  </div>
  <div>
    <label for="passwordRepeat">Password Repeat</label>
    <input
      id="passwordRepeat"
      v-model="formState.passwordRepeat"
      placeholder="Password"
      type="password"
    />
  </div>
  <div>
    <button :disabled="disabled" @click="submit">Sign up</button>
  </div>
</template>

<script setup>
import axios from 'axios'
import { computed, reactive, ref, watch } from 'vue'

// const password = ref('')
// const passwordRepeat = ref('')
// const username = ref('')
// const email = ref('')

const formState = reactive({
  password: '',
  passwordRepeat: '',
  username: '',
  email: ''
})

const disabled = computed(() => {
  return formState.password === '' || formState.password !== formState.passwordRepeat
})

const submit = () => {
  axios.post('/api/vi/users', {
    username: formState.username,
    email: formState.email,
    password: formState.password
  })
}
</script>
