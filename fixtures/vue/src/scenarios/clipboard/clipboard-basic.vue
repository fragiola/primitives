<script setup lang="ts">
import type {
    ClipboardStatus,
    ClipboardStatusDetails,
} from "@fragiola/primitives-vue/clipboard";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Clipboard } from "../../kit/ui/clipboard.ts";

// An install command to copy (spec/clipboard.md, `/clipboard/basic`).
const status = ref<string>();
const reason = ref<string>();
const onStatus = (next: ClipboardStatus, details: ClipboardStatusDetails) => {
    status.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <div class="flex flex-col items-start gap-2">
        <label for="install" class="text-sm font-medium">Install command</label>
        <Clipboard.Root value="pnpm add @fragiola/primitives" :timeout="1000" announcement="Copied to clipboard" @status-change="onStatus">
            <Clipboard.Input id="install" />
            <Clipboard.Trigger aria-label="Copy install command" />
        </Clipboard.Root>
    </div>
    <Output :values="{ status, reason }" />
</template>
