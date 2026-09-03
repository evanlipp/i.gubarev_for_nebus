<template>
  <AppModal v-model="isOpen" :title="title" @cancel="cancel">
    <p class="confirm-dialog__message">{{ message }}</p>

    <template #footer>
      <AppButton variant="secondary" @click="cancel">{{ cancelText }}</AppButton>
      <AppButton :variant="danger ? 'danger' : 'primary'" @click="confirm">
        {{ confirmText }}
      </AppButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
  }>(),
  {
    confirmText: "Подтвердить",
    cancelText: "Отмена",
    danger: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [];
  cancel: [];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

function confirm() {
  emit("confirm");
  emit("update:modelValue", false);
}

function cancel() {
  emit("cancel");
  emit("update:modelValue", false);
}
</script>

<style scoped>
.confirm-dialog__message {
  color: #667085;
  line-height: 1.5;
}
</style>
