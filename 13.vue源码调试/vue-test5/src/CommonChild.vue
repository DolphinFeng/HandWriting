<template>
  <input :value="modelValue" @input="updateValue" />
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const updateValue = (event: Event) => {
  const input = event.target as HTMLInputElement;
  emits('update:modelValue', input.value);
};
</script>