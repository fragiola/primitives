<script setup lang="ts">
import type { OpenChangeDetails } from "@fragiola/primitives-vue/drawer";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Drawer } from "../../kit/ui/drawer.ts";

// spec/drawer.md: a side panel at the right edge, swiped right to close.
const open = ref(false);
const reason = ref<string>();
const onOpenChange = (next: boolean, details: OpenChangeDetails) => {
    open.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <Drawer.Root swipe-direction="right" @open-change="onOpenChange">
        <Drawer.Trigger>Open settings</Drawer.Trigger>
        <Drawer.Portal>
            <Drawer.Backdrop />
            <Drawer.Popup>
                <Drawer.Title>Settings</Drawer.Title>
                <Drawer.Description>Choose what you see.</Drawer.Description>
                <Drawer.Close>Done</Drawer.Close>
            </Drawer.Popup>
        </Drawer.Portal>
    </Drawer.Root>
    <Output :values="{ open, reason }" />
</template>
