<template>
  <div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2 mt-5">
    <div class="card">
      <div class="card-header">
        <h1>Sign Up</h1>
      </div>

      <form
        class="card-body"
        @submit.prevent="submit"
        data-testid="form-sign-up"
        v-if="!successMessage"
      >
        <!-- data-testid => used for testing -->
        <div class="form-group">
          <label class="form-label" for="username">Username</label>
          <input
            class="form-control"
            v-model="formState.username"
            id="username"
            placeholder="Username"
            type="text"
          />
          <div class="text-danger">{{ errors.username }}</div>
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
          <button class="btn btn-primary" :disabled="disabled">
            <span
              v-if="apiProcessing"
              role="status"
              class="spinner-border spinner-border-sm"
            ></span>
            Sign up
          </button>
        </div>
      </form>
      <div v-else class="alert alert-success">{{ successMessage }}</div>
      <div v-if="errorMessage" class="alert alert-success">{{ errorMessage }}</div>
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

const apiProcessing = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const errors = ref({})

const disabled = computed(() => {
  return (
    apiProcessing.value ||
    formState.password === '' ||
    formState.password !== formState.passwordRepeat
  )
})

const submit = async () => {
  apiProcessing.value = true
  errorMessage.value = ''

  try {
    const response = await axios.post('/api/v1/users', {
      username: formState.username,
      email: formState.email,
      password: formState.password
    })

    successMessage.value = response.data.message
  } catch (error) {
    if (error.response?.status == 400) {
      errors.value = error.response?.data?.validationErrors
    } else errorMessage.value = 'Unexpected error occurred, please try again'
  } finally {
    apiProcessing.value = false
  }
}
</script>
