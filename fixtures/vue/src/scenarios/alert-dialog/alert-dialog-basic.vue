<script setup lang="ts">
import type {
    OpenChangeDetails,
    OverlayActions,
} from "@fragiola/primitives-vue/alert-dialog";
import { ref, useTemplateRef } from "vue";
import Output from "../../kit/output.vue";
import { AlertDialog } from "../../kit/ui/alert-dialog.ts";

// spec/alert-dialog.md: a destructive confirmation, never dismissed from outside.
const root = useTemplateRef<OverlayActions>("root");
const open = ref(false);
const reason = ref<string>();
const action = ref<string>();
const onOpenChange = (next: boolean, details: OpenChangeDetails) => {
    open.value = next;
    reason.value = details.reason;
};
const discard = () => {
    action.value = "discard";
    root.value?.close();
};
</script>

<template>
    <AlertDialog.Root ref="root" @open-change="onOpenChange">
        <AlertDialog.Trigger>Discard draft</AlertDialog.Trigger>
        <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Popup>
                <AlertDialog.Title>Discard draft?</AlertDialog.Title>
                <AlertDialog.Description>Your unsaved changes will be lost.</AlertDialog.Description>
                <div class="flex justify-end gap-2">
                    <AlertDialog.Action @click="discard">Discard</AlertDialog.Action>
                    <AlertDialog.Close>Cancel</AlertDialog.Close>
                </div>
            </AlertDialog.Popup>
        </AlertDialog.Portal>
    </AlertDialog.Root>
    <button type="button" class="ms-2">Outside button</button>
    <Output :values="{ open, reason, action }" />
</template>
