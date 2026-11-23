<script setup lang="ts">
import { Toggle } from "@fragiola/primitives-vue/toggle";
import { ref } from "vue";
import { styles } from "./styles.ts";

// A track's actions: three toggle buttons, each named by its text, which never changes with the
// state (`aria-pressed` tells it). "Favourite" is controlled, "Mute" starts pressed, "Download"
// is disabled; a click, Enter or Space presses and releases the focused one (spec/toggle.md).
const favourite = ref(false);
</script>

<template>
    <div :class="styles.card">
        <div>
            <p :class="styles.title">Blue in Green</p>
            <p :class="styles.subtitle">Miles Davis · Kind of Blue</p>
        </div>
        <div :class="styles.actions">
            <Toggle v-model:pressed="favourite" :class="styles.root"><span aria-hidden="true">♥</span>Favourite</Toggle>
            <Toggle default-pressed :class="styles.root">Mute</Toggle>
            <Toggle disabled :class="styles.root">Download</Toggle>
        </div>
        <p :class="styles.status">{{ favourite ? "In your favourites" : "Not in your favourites" }}</p>
    </div>
</template>
