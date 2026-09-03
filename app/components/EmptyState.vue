<template>
  <section class="empty-state">
    <h2 class="empty-state__title">{{ title }}</h2>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
    <div v-if="$slots.default" class="empty-state__action">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<style scoped>
.empty-state {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  padding: clamp(2rem, 8vw, 5rem) 1.5rem;
  text-align: center;
}
.empty-state__title {
  font-size: 1.25rem;
}
.empty-state__description {
  color: #667085;
  line-height: 1.5;
}
.empty-state__action {
  margin-top: 0.5rem;
}
</style>
