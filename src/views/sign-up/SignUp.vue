<template>
  <div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2 mt-5">
    <div class="card">
      <div class="card-header">
        <h1>{{ $t('signUp') }}</h1>
      </div>

      <form
        class="card-body"
        @submit.prevent="submit"
        data-testid="form-sign-up"
        v-if="!successMessage"
      >
        <!-- data-testid => used for testing -->
        <AppInput
          id="username"
          v-model="formState.username"
          :label="$t('username')"
          :help="errors.username"
          type="text"
        />
        <AppInput
          id="email"
          v-model="formState.email"
          :label="$t('email')"
          :help="errors.email"
          type="email"
        />
        <AppInput
          id="password"
          v-model="formState.password"
          :label="$t('password')"
          :help="errors.password"
          type="password"
        />
        <AppInput
          id="passwordRepeat"
          v-model="formState.passwordRepeat"
          :label="$t('passwordRepeat')"
          :help="passwordMismatchError"
          type="password"
        />
        <div class="form-group">
          <button class="btn btn-primary" :disabled="disabled">
            <span
              v-if="apiProcessing"
              role="status"
              class="spinner-border spinner-border-sm"
            ></span>
            {{ $t('signUp') }}
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
import AppInput from '../../components/AppInput.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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

const passwordMismatchError = computed(() => {
  return formState.password === formState.passwordRepeat ? undefined : t('passwordMismatch')
})

watch(
  () => formState.username,
  () => {
    delete errors.value.username
  }
)

watch(
  () => formState.email,
  () => {
    delete errors.value.email
  }
)

watch(
  () => formState.password,
  () => {
    delete errors.value.password
  }
)

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
    } else errorMessage.value = t('genericError')
  } finally {
    apiProcessing.value = false
  }
}
</script>
