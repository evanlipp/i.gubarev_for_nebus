<script setup lang="ts">
import { createNote } from "~/utils/note";
import NoteEditor from "~/components/NoteEditor.vue";

const NEW_NOTE_DRAFT_ID = "new-note";
const note = { ...createNote({ title: "" }), id: NEW_NOTE_DRAFT_ID };
</script>

<template><NoteEditor :initial-note="note" is-new /></template>
