<template>
  <div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2 mt-5">
    <div class="card">
      <div class="card-header">
        <h1>Sign Up</h1>
      </div>

      <form class="card-body" @submit.prevent="submit">
        <div class="form-group">
          <label class="form-label" for="username">Username</label>
          <input
            class="form-control"
            v-model="formState.username"
            id="username"
            placeholder="Username"
            type="text"
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="email">E-mail</label>
          <input
            class="form-control"
            v-model="formState.email"
            id="email"
            placeholder="E-mail"
            type="email"
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input
            class="form-control"
            id="password"
            v-model="formState.password"
            placeholder="Password"
            type="password"
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="passwordRepeat">Password Repeat</label>
          <input
            class="form-control"
            id="passwordRepeat"
            v-model="formState.passwordRepeat"
            placeholder="Password"
            type="password"
          />
        </div>
        <div class="form-group">
          <button class="btn btn-primary" :disabled="disabled">Sign up</button>
        </div>
      </form>
    </div>
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
  axios.post('/api/v1/users', {
    username: formState.username,
    email: formState.email,
    password: formState.password
  })
}
</script>
