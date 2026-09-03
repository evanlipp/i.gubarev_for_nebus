<script setup lang="ts">
import { createNote } from "~/utils/note";
import NoteEditor from "~/components/NoteEditor.vue";

const note = createNote({ title: "" });
</script>

<template><NoteEditor :initial-note="note" is-new /></template>
