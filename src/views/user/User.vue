<template>
  <div data-testid="user-page">
    <Card>
      <template v-slot:header> User Page </template>
      <template v-slot:default>
        <img :src="tempImage || auth.image || '@/assets/profile.png'" alt="user-image" />
      </template>
      <template v-if="status === 'success'" v-slot:footer>
        <div v-if="!editFormVisible">
          <span>
            {{ data.username }}
          </span>
          <button v-if="auth.id === data.id" @click="deleteUser" :disabled="apiProcessing">
            Delete
          </button>
          <button v-if="auth.id === data.id" @click="editFormVisible = true">Edit</button>
          <!-- <span v-if="apiProcessing" role="status" class="spinner-border spinner-border-sm"></span> -->
        </div>
        <div v-else>
          <form @submit.prevent="updateUser" enctype="multipart/form-data">
            <label for="username">Username</label>
            <input type="text" name="username" id="username" v-model="UpdatedUser" />
            <span v-if="updateUserValidationError" class="text-danger">{{
              updateUserValidationError
            }}</span>
            <label for="file-upload">Select Image</label>
            <input
              type="file"
              id="file-upload"
              name="file-upload"
              @change="onImageChange($event)"
            />
            <button type="submit" :disabled="apiProcessing">Save</button>
            <button
              type="button"
              @click="
                () => {
                  editFormVisible = false
                  tempImage = undefined
                }
              "
              :disabled="apiProcessing"
            >
              Cancel
            </button>
          </form>
        </div>
      </template>
    </Card>
    <div v-if="status === 'loading' || apiProcessing">
      <span role="status" class="spinner-border spinner-border-sm"></span>
    </div>
    <div v-if="status === 'fail'" class="alert alert-success">
      {{ error }}
    </div>
    <div v-if="deleteUserError" class="alert alert-success">
      {{ deleteUserError }}
    </div>
    <div v-if="updateUserError" class="alert alert-success">
      {{ updateUserError }}
    </div>
  </div>
</template>

<script setup>
import Card from '@/components/Card.vue'
import http from '@/lib/http'

const editFormVisible = ref(false)
const { auth, logout, setLoggedIn } = useAuthStore()
const getUserById = async (id) => {
  return await http.get(`/api/v1/users/${id}`)
}

import useRouteParamApiRequest from '@/shared/useRouteParamApiRequest.js'
import { useAuthStore } from '@/stores/auth'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

// import { router } from '../../../test/helper'
const { status, data, error } = useRouteParamApiRequest(getUserById, 'id')

const UpdatedUser = ref('')

watch(
  () => UpdatedUser.value,
  () => {
    updateUserValidationError.value = ''
  }
)

watch(
  () => data.value,
  () => {
    UpdatedUser.value = data.value.username
  }
)

// console.log(UpdatedUser.value)

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

const updateUserError = ref('')
const updateUserValidationError = ref('')

const updateUser = async () => {
  apiProcessing.value = true
  updateUserError.value = ''
  try {
    const response = await http.put(`/api/v1/users/${data.value.id}`, {
      username: UpdatedUser.value,
      ...(tempImage.value && { image: tempImage.value?.split(',')[1] })
    })
    tempImage.value = undefined
    setLoggedIn({
      id: data.value.id,
      username: UpdatedUser.value,
      email: data.value,
      image: response.data.image
    })
    // console.log(auth)
    data.value.username = UpdatedUser.value
    editFormVisible.value = false
  } catch (error) {
    if (error.response?.status == 400) {
      updateUserValidationError.value = error.response.data.validationErrors.username
    } else {
      updateUserError.value = t('genericError')
    }
  }

  apiProcessing.value = false
}

const tempImage = ref()

const onImageChange = (event) => {
  const file = event.target.files[0]
  const fileReader = new FileReader()
  fileReader.onloadend = () => {
    const data = fileReader.result
    tempImage.value = data
  }

  fileReader.readAsDataURL(file)
}
</script>
