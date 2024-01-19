<template>
  <div class="form-group">
    <label class="form-label" :for="id">{{ label }}</label>
    <input
      @input="$emit('update:modelValue', $event.target.value)"
      class="form-control"
      :class="{ 'is-invalid': help }"
      :id="id"
      :type="type"
    />
    <span class="invalid-feedback">{{ help }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  id: String,
  help: String,
  type: String,
  modelValue: String
})

defineEmits(['update:modelValue'])
</script>
