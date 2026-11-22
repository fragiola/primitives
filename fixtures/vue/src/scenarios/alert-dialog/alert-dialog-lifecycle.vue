<script setup lang="ts">
import type { OverlayActions } from "@fragiola/primitives-vue/alert-dialog";
import { useTemplateRef } from "vue";
import { useLifecycle } from "../../kit/lifecycle.ts";
import Output from "../../kit/output.vue";
import { AlertDialog } from "../../kit/ui/alert-dialog.ts";

// spec/README.md, "The lifecycle scenarios".
const props = defineProps<{ cancel?: boolean }>();
const lifecycle = useLifecycle(props.cancel);
const root = useTemplateRef<OverlayActions>("root");
</script>

<template>
    <AlertDialog.Root
        ref="root"
        @open-change="lifecycle.onOpenChange"
        @open-change-complete="lifecycle.onOpenChangeComplete"
    >
        <AlertDialog.Trigger>Delete file</AlertDialog.Trigger>
        <AlertDialog.Portal keep-mounted>
            <AlertDialog.Backdrop />
            <AlertDialog.Popup>
                <AlertDialog.Title>Lifecycle</AlertDialog.Title>
                <AlertDialog.Description>Delete the file?</AlertDialog.Description>
                <div class="flex justify-end gap-2">
                    <button type="button" @click="root?.close()">Close with actions</button>
                    <AlertDialog.Close>Close</AlertDialog.Close>
                </div>
            </AlertDialog.Popup>
        </AlertDialog.Portal>
    </AlertDialog.Root>
    <Output :values="lifecycle.values" />
</template>
