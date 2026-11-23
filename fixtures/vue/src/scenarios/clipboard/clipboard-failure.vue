<script setup lang="ts">
import type {
    ClipboardStatus,
    ClipboardStatusDetails,
} from "@fragiola/primitives-vue/clipboard";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Clipboard } from "../../kit/ui/clipboard.ts";

// A copy the browser refuses (spec/clipboard.md, `/clipboard/failure`).
const status = ref<string>();
const error = ref<string>();
const onStatus = (next: ClipboardStatus, details: ClipboardStatusDetails) => {
    status.value = next;
    if (details.error instanceof Error) {
        error.value = details.error.message;
    }
};
</script>

<template>
    <div class="flex flex-col items-start gap-2">
        <label for="install" class="text-sm font-medium">Install command</label>
        <Clipboard.Root
            value="pnpm add @fragiola/primitives"
            :timeout="1000"
            announcement="Copied to clipboard"
            failed-announcement="Copy failed: select the text and copy it"
            @status-change="onStatus"
        >
            <Clipboard.Input id="install" />
            <Clipboard.Trigger aria-label="Copy install command" />
        </Clipboard.Root>
    </div>
    <Output :values="{ status, error }" />
</template>
