<script setup lang="ts">
import type { OverlayActions } from "@fragiola/primitives-vue/dialog";
import { useTemplateRef } from "vue";
import { useLifecycle } from "../../kit/lifecycle.ts";
import Output from "../../kit/output.vue";
import { Dialog } from "../../kit/ui/dialog.ts";

// spec/README.md, "The lifecycle scenarios".
const props = defineProps<{ cancel?: boolean }>();
const lifecycle = useLifecycle(props.cancel);
const root = useTemplateRef<OverlayActions>("root");
</script>

<template>
    <Dialog.Root
        ref="root"
        @open-change="lifecycle.onOpenChange"
        @open-change-complete="lifecycle.onOpenChangeComplete"
    >
        <Dialog.Trigger>Open dialog</Dialog.Trigger>
        <Dialog.Portal keep-mounted>
            <Dialog.Backdrop />
            <Dialog.Popup>
                <Dialog.Title>Lifecycle</Dialog.Title>
                <div class="flex justify-end gap-2">
                    <button type="button" @click="root?.close()">Close with actions</button>
                    <Dialog.Close>Close</Dialog.Close>
                </div>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>
    <Output :values="lifecycle.values" />
</template>
