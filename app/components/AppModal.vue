<template>
  <dialog
    ref="dialog"
    class="app-modal"
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
  nextTick(focusFirstElement);
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

function focusFirstElement() {
  focusableElements()[0]?.focus();
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
