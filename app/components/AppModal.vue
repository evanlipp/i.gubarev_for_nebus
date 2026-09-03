<template>
  <dialog
    ref="dialog"
    class="app-modal"
    tabindex="-1"
    :aria-labelledby="titleId"
    @cancel="handleCancel"
    @click="handleBackdropClick"
    @close="handleClose"
    @keydown="trapFocus"
  >
    <section class="app-modal__content" role="document">
      <header class="app-modal__header">
        <h2 :id="titleId" class="app-modal__title">{{ title }}</h2>
        <button class="app-modal__close" type="button" aria-label="Закрыть" @click="close">
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <div class="app-modal__body">
        <slot />
      </div>

      <footer v-if="$slots.footer" class="app-modal__footer">
        <slot name="footer" />
      </footer>
    </section>
  </dialog>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";

const props = defineProps<{
  modelValue: boolean;
  title: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  cancel: [];
}>();

const dialog = ref<HTMLDialogElement>();
const titleId = useId();
let returnFocus: HTMLElement | null = null;

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      open();
    } else {
      dialog.value?.close();
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (props.modelValue) {
    open();
  }
});

onBeforeUnmount(() => dialog.value?.close());

function open() {
  const element = dialog.value;

  if (!element || element.open) {
    return;
  }

  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  element.showModal();
  nextTick(() => element.focus());
}

function close() {
  emit("update:modelValue", false);
}

function handleCancel(event: Event) {
  event.preventDefault();
  emit("cancel");
  close();
}

function handleClose() {
  if (props.modelValue) {
    emit("update:modelValue", false);
  }

  returnFocus?.focus();
  returnFocus = null;
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === dialog.value) {
    close();
  }
}

function trapFocus(event: KeyboardEvent) {
  if (event.key !== "Tab") {
    return;
  }

  const elements = focusableElements();
  const first = elements[0];
  const last = elements.at(-1);

  if (!first || !last) {
    event.preventDefault();
    dialog.value?.focus();
    return;
  }

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function focusableElements() {
  return [
    ...(dialog.value?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? []),
  ].filter((element) => !element.hasAttribute("hidden"));
}
</script>

<style scoped lang="scss">
.app-modal {
  position: fixed;
  inset: 0;
  width: min(100% - 2rem, 32rem);
  max-height: calc(100dvh - 2rem);
  margin: auto;
  border: 0;
  border-radius: 0.75rem;
  padding: 0;
  color: inherit;
  background: #fff;
  box-shadow: 0 1.5rem 3rem rgb(16 24 40 / 24%);
  outline: none;
  &::backdrop {
    background: rgb(16 24 40 / 54%);
  }
  &__content {
    display: flex;
    max-height: inherit;
    flex-direction: column;
  }
  &__header,
  &__footer {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem;
  }
  &__header {
    justify-content: space-between;
    border-bottom: 1px solid #eaecf0;
  }
  &__title {
    font-size: 1.125rem;
    line-height: 1.35;
  }
  &__close {
    display: grid;
    width: 2.25rem;
    height: 2.25rem;
    flex: 0 0 auto;
    place-items: center;
    border: 0;
    border-radius: 0.375rem;
    color: #475467;
    background: transparent;
    font-size: 1.75rem;
    line-height: 1;
    &:hover {
      background: #f2f4f7;
    }
  }
  &__body {
    overflow-y: auto;
    padding: 1.25rem;
  }
  &__footer {
    justify-content: flex-end;
    border-top: 1px solid #eaecf0;
  }
}
@media (max-width: 480px) {
  .app-modal {
    width: calc(100% - 1rem);
    max-height: calc(100dvh - 1rem);
    &__header,
    &__body,
    &__footer {
      padding: 1rem;
    }
    &__footer {
      align-items: stretch;
      flex-direction: column-reverse;
      .app-button {
        width: 100%;
      }
    }
  }
}
</style>
