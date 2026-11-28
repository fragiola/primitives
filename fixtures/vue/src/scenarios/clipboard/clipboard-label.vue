<script setup lang="ts">
import type {
    ClipboardState,
    ClipboardStatus,
} from "@fragiola/primitives-vue/clipboard";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Clipboard, ClipboardIcons } from "../../kit/ui/clipboard.ts";

// A share link whose Trigger's visible label follows the status (spec/clipboard.md,
// `/clipboard/label`).
const LINK = "https://fragiola.com/primitives";
const status = ref<string>();
const label = (state: ClipboardState) =>
    state.copied ? "Copied" : "Copy link";
const onStatus = (next: ClipboardStatus) => {
    status.value = next;
};
</script>

<template>
    <Clipboard.Root :value="LINK" :timeout="1000" @status-change="onStatus">
        <Clipboard.LabelledTrigger v-slot="{ state }"><ClipboardIcons />{{ label(state) }}</Clipboard.LabelledTrigger>
    </Clipboard.Root>
    <Output :values="{ status }" />
</template>
