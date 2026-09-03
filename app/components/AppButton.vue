<template>
  <button class="app-button" :class="`app-button--${variant}`" :type="type" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "danger" | "ghost";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
  }>(),
  {
    variant: "primary",
    type: "button",
    disabled: false,
  },
);
</script>

<style scoped lang="scss">
.app-button {
  min-height: 2.75rem;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  padding: 0.625rem 1rem;
  font-weight: 600;
  line-height: 1.25;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease;
  &:disabled {
    opacity: 0.55;
  }
  &--primary {
    color: #fff;
    background: #175cd3;
    &:hover:not(:disabled) {
      background: #004eeb;
    }
  }
  &--secondary {
    color: #344054;
    border-color: #d0d5dd;
    background: #fff;
    &:hover:not(:disabled) {
      background: #f2f4f7;
    }
  }
  &--danger {
    color: #fff;
    background: #b42318;
    &:hover:not(:disabled) {
      background: #912018;
    }
  }
  &--ghost {
    color: #344054;
    background: transparent;
    &:hover:not(:disabled) {
      background: #eaecf0;
    }
  }
}
</style>
