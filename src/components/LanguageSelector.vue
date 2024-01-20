<template>
  <img
    src="https://flagcdn.com/24x18/tr.png"
    data-testid="language-tr-selector"
    @click="setLanguage('tr')"
    role="button"
  />
  <span class="m-1"></span>
  <img
    src="https://flagcdn.com/24x18/gb.png"
    data-testid="language-en-selector"
    @click="setLanguage('en')"
    role="button"
  />
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

const setLanguage = (language) => {
  localStorage.setItem('app-lang', language)
  i18n.locale.value = language
}
</script>
