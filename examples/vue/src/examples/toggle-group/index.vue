<script setup lang="ts">
import { Toggle } from "@fragiola/primitives-vue/toggle";
import { ToggleGroup } from "@fragiola/primitives-vue/toggle-group";
import { computed, ref } from "vue";
import { styles } from "./styles.ts";

const ALIGNMENTS = [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
    { value: "justify", label: "Justify" },
];

// Text alignment: one toggle pressed at a time, and pressing the pressed one releases it (the
// paragraph falls back to the start). The group is one tab stop; the arrow keys, Home and End
// move the focus between the toggles, never the value (spec/toggle-group.md).
const value = ref<string[]>(["left"]);
const align = computed(() => value.value[0] ?? "start");
</script>

<template>
    <div :class="styles.stack">
        <ToggleGroup v-model:value="value" aria-label="Text alignment" :class="styles.root">
            <Toggle v-for="entry in ALIGNMENTS" :key="entry.value" :value="entry.value" :class="styles.toggle">{{ entry.label }}</Toggle>
        </ToggleGroup>
        <p :data-align="align" :class="styles.preview">
            The quick brown fox jumps over the lazy dog, then naps in the
            sun while the dog wonders what just happened.
        </p>
    </div>
</template>
