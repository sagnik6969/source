<template>
  <div class="form-group">
    <label class="form-label" :for="id">{{ label }}</label>
    <input
      @input="$emit('update:modelValue', $event.target.value)"
      class="form-control"
      :id="id"
      type="text"
    />
    <div class="text-danger">{{ help }}</div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  id: String,
  help: String,
  modelValue: String
})

defineEmits(['update:modelValue'])
</script>
