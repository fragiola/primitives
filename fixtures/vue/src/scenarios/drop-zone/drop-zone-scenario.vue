<script setup lang="ts">
import type { DropZoneDropDetails } from "@fragiola/primitives-vue/drop-zone";
import { ref, shallowRef } from "vue";
import Output from "../../kit/output.vue";
import { DropZone } from "../../kit/ui/drop-zone.ts";

// The DropZone of every scenario, with its output (spec/drop-zone.md).
withDefaults(
    defineProps<{ accept?: string; multiple?: boolean; disabled?: boolean }>(),
    { accept: undefined, multiple: true, disabled: false },
);
const drop = shallowRef<DropZoneDropDetails>();
const dropTarget = ref(false);
const names = (files: File[]) =>
    files.length === 0 ? "none" : files.map((file) => file.name).join(", ");
const announcement = (details: DropZoneDropDetails) =>
    `${details.acceptedFiles.length} accepted, ${details.rejectedFiles.length} rejected`;
const onFileDrop = (details: DropZoneDropDetails) => {
    drop.value = details;
};
const onDropTargetChange = (active: boolean) => {
    dropTarget.value = active;
};
</script>

<template>
    <DropZone.Root :accept="accept" :multiple="multiple" :disabled="disabled" :announcement="announcement" @file-drop="onFileDrop" @drop-target-change="onDropTargetChange">
        <span>Drop images or PDFs here, or press to choose</span>
    </DropZone.Root>
    <Output
        :values="{
            accepted: drop && names(drop.acceptedFiles),
            rejected: drop && names(drop.rejectedFiles),
            reason: drop?.reason,
            dropTarget,
        }"
    />
</template>
