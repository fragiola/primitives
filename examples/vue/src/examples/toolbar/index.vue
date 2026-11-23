<script setup lang="ts">
import { Toggle } from "@fragiola/primitives-vue/toggle";
import { ToggleGroup } from "@fragiola/primitives-vue/toggle-group";
import { Toolbar } from "@fragiola/primitives-vue/toolbar";
import { computed, ref } from "vue";
import { styles } from "./styles.ts";

const STYLES = [
    { value: "bold", label: "Bold" },
    { value: "italic", label: "Italic" },
    { value: "underline", label: "Underline" },
];

const ALIGNMENTS = [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
];

// A text-format toolbar: the text styles (several pressed) and the alignment (one pressed) are
// ToggleGroups whose toggles join the toolbar, which stays one tab stop; the arrow keys, Home and
// End move through every item, and the font size field keeps its caret keys until the caret
// reaches an end (spec/toolbar.md).
const textStyle = ref<string[]>([]);
const align = ref<string[]>(["left"]);
const size = ref("16");
const fontSize = computed(() =>
    Math.min(Math.max(Number(size.value) || 16, 10), 32),
);
const clear = () => {
    textStyle.value = [];
    align.value = ["left"];
    size.value = "16";
};
const onSize = (event: Event) => {
    size.value = (event.currentTarget as HTMLInputElement).value;
};
</script>

<template>
    <div :class="styles.stack">
        <Toolbar.Root aria-label="Text formatting" :class="styles.root">
            <ToggleGroup v-model:value="textStyle" aria-label="Text style" multiple :class="styles.toggleGroup">
                <Toggle v-for="entry in STYLES" :key="entry.value" :value="entry.value" :class="styles.toggle">{{ entry.label }}</Toggle>
            </ToggleGroup>
            <Toolbar.Separator :class="styles.separator" />
            <ToggleGroup v-model:value="align" aria-label="Alignment" :class="styles.toggleGroup">
                <Toggle v-for="entry in ALIGNMENTS" :key="entry.value" :value="entry.value" :class="styles.toggle">{{ entry.label }}</Toggle>
            </ToggleGroup>
            <Toolbar.Separator :class="styles.separator" />
            <Toolbar.Button :class="styles.button" @click="clear">Clear</Toolbar.Button>
            <Toolbar.Input
                aria-label="Font size"
                inputmode="numeric"
                :value="size"
                :class="styles.input"
                @input="onSize"
            />
        </Toolbar.Root>
        <p
            :data-bold="textStyle.includes('bold') || undefined"
            :data-italic="textStyle.includes('italic') || undefined"
            :data-underline="textStyle.includes('underline') || undefined"
            :data-align="align[0] ?? 'start'"
            :style="{ fontSize: `${fontSize}px` }"
            :class="styles.preview"
        >
            Toolbars group the controls of a task in one tab stop.
        </p>
    </div>
</template>
