<template>
  <img :src="tempImage || image || '/src/assets/profile.png'" alt="image" />
</template>

<script setup>
defineProps({
  image: String,
  tempImage: String
})
</script>
