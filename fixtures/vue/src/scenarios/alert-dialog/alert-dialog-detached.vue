<script setup lang="ts">
import type { OpenChangeDetails } from "@fragiola/primitives-vue/alert-dialog";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { AlertDialog } from "../../kit/ui/alert-dialog.ts";

// One AlertDialog opened from two Triggers, each with a name as its payload.
const PEOPLE = ["Ada", "Grace"];
const handle = AlertDialog.createHandle<string>();
const open = ref(false);
const reason = ref<string>();
const trigger = ref<string>();
const onOpenChange = (next: boolean, details: OpenChangeDetails) => {
    open.value = next;
    reason.value = details.reason;
    trigger.value = details.trigger?.id;
};
</script>

<template>
    <div class="flex gap-2">
        <AlertDialog.Trigger v-for="name in PEOPLE" :id="`delete-${name.toLowerCase()}`" :key="name" :handle="handle" :payload="name">{{ `Delete ${name}` }}</AlertDialog.Trigger>
    </div>
    <button type="button" class="mt-2" @click="handle.open('delete-grace')">Delete for Grace</button>
    <AlertDialog.Root v-slot="{ payload }" :handle="handle" @open-change="onOpenChange">
        <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Viewport>
                <AlertDialog.Popup>
                    <AlertDialog.Title>{{ `Delete ${payload}?` }}</AlertDialog.Title>
                    <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
                    <AlertDialog.Close>Cancel</AlertDialog.Close>
                </AlertDialog.Popup>
            </AlertDialog.Viewport>
        </AlertDialog.Portal>
    </AlertDialog.Root>
    <Output :values="{ open, reason, trigger }" />
</template>
