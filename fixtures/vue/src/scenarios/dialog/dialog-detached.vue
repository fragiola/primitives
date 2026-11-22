<script setup lang="ts">
import type { OpenChangeDetails } from "@fragiola/primitives-vue/dialog";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Dialog } from "../../kit/ui/dialog.ts";

// One Dialog opened from three rows, each Trigger with the row's name as its payload.
const PEOPLE = ["Ada", "Grace", "Alan"];
const handle = Dialog.createHandle<string>();
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
    <ul class="flex flex-col gap-2">
        <li v-for="name in PEOPLE" :key="name" class="flex items-center gap-2">
            <span class="w-16">{{ name }}</span>
            <Dialog.Trigger :id="`edit-${name.toLowerCase()}`" :handle="handle" :payload="name">{{ `Edit ${name}` }}</Dialog.Trigger>
        </li>
    </ul>
    <button type="button" class="mt-2" @click="handle.open('edit-grace')">Open for Grace</button>
    <Dialog.Root v-slot="{ payload }" :handle="handle" @open-change="onOpenChange">
        <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Popup>
                <Dialog.Title>{{ `Edit ${payload}` }}</Dialog.Title>
                <Dialog.Close>Close</Dialog.Close>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>
    <Output :values="{ open, reason, trigger }" />
</template>
