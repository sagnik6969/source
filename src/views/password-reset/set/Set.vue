<template>
  <div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2 mt-5" data-testid="password-reset-set-page">
    <div class="card">
      <div class="card-header">
        <h1>Password Reset</h1>
      </div>

      <form @submit.prevent="submit" class="card-body" data-testid="form-sign-up">
        <AppInput
          id="password"
          v-model="password"
          :label="$t('password')"
          type="password"
          :help="errors.password"
        />
        <AppInput
          id="passwordRepeat"
          v-model="passwordRepeat"
          :label="$t('passwordRepeat')"
          type="password"
          :help="passwordMismatchError"
        />

        <div class="form-group">
          <!-- <button class="btn btn-primary" :disabled="disabled">Password Reset</button> -->
          <AppButton :is-disabled="disabled">Password Reset</AppButton>
        </div>
      </form>
      <div v-if="errorMessage" class="alert alert-success">{{ errorMessage }}</div>
      <!-- <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div> -->
    </div>
  </div>
</template>
<script setup>
import AppButton from '@/components/AppButton.vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AppInput from '../../../components/AppInput.vue'
import http from '@/lib/http'
const password = ref('')
const passwordRepeat = ref('')
const errors = ref({})
const errorMessage = ref('')

const { t } = useI18n()
const route = useRoute()

const disabled = computed(() => {
  return password.value == '' || password.value != passwordRepeat.value
})

const passwordMismatchError = computed(() =>
  password.value == passwordRepeat.value ? '' : t('passwordMismatch')
)

watch(
  () => password.value,
  () => (errors.value = {})
)

const submit = async () => {
  errorMessage.value = ''
  try {
    await http.patch(`/api/v1/users/${route.query.tk}/password-reset`, {
      password: password.value
    })
  } catch (error) {
    if (error.response?.data?.validationErrors) {
      errors.value = error.response?.data?.validationErrors
    } else if (error.response?.data?.message) {
      errorMessage.value = error.response?.data?.message
    } else errorMessage.value = t('genericError')
    // else if (error.response?.status == 404) {
    //   errorMessage.value = error.response?.data?.message
    // } else errorMessage.value = t('genericError')
  }
}
</script>
