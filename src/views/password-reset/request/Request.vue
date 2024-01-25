<template>
  <div
    class="col-lg-6 offset-lg-3 col-md-8 offset-md-2 mt-5"
    data-testid="password-reset-request-page"
  >
    <div class="card">
      <div class="card-header">
        <h1>Password Reset</h1>
      </div>

      <form @submit.prevent="submit" class="card-body" data-testid="form-sign-up">
        <AppInput
          :help="errors.email"
          v-model="email"
          id="email"
          :label="$t('email')"
          type="text"
        />

        <div class="form-group">
          <!-- <button class="btn btn-primary" :disabled="disabled">Password Reset</button> -->
          <AppButton :is-disabled="disabled">Password Reset</AppButton>
        </div>
      </form>
      <div v-if="errorMessage" class="alert alert-success">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import AppButton from '@/components/AppButton.vue'
import http from '@/lib/http'
import { computed, ref, watch } from 'vue'
import AppInput from '../../../components/AppInput.vue'
import { useI18n } from 'vue-i18n'
const email = ref('')
const errors = ref({})
const errorMessage = ref('')
const successMessage = ref('')

const { t } = useI18n()

const disabled = computed(() => {
  return email.value == ''
})

watch(
  () => email.value,
  () => {
    errors.value = {}
  }
)

const submit = async () => {
  errorMessage.value = ''
  try {
    const response = await http.post('/api/v1/users/password-reset', { email: email.value })
    successMessage.value = response.data.message
  } catch (error) {
    if (error.response?.status == 400) {
      errors.value = error.response?.data?.validationErrors
    } else if (error.response?.status == 404) {
      errorMessage.value = error.response?.data?.message
    } else errorMessage.value = t('genericError')
  }
}
</script>
