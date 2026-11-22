<script setup lang="ts">
import type { OpenChangeDetails } from "@fragiola/primitives-vue/drawer";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Drawer } from "../../kit/ui/drawer.ts";

// spec/drawer.md: a bottom sheet, swiped down to close, with a scrollable list.
const ROWS = Array.from({ length: 12 }, (_, index) => index + 1);
const open = ref(false);
const reason = ref<string>();
const onOpenChange = (next: boolean, details: OpenChangeDetails) => {
    open.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <Drawer.Root @open-change="onOpenChange">
        <Drawer.Trigger>Open drawer</Drawer.Trigger>
        <Drawer.Portal>
            <Drawer.Backdrop />
            <Drawer.Viewport>
                <Drawer.Popup>
                    <Drawer.Handle />
                    <Drawer.Content>
                        <Drawer.Title>Notifications</Drawer.Title>
                        <Drawer.Description>You are all caught up.</Drawer.Description>
                        <ul aria-label="Recent" tabindex="0" class="h-40 overflow-y-auto rounded-control border border-palette-line">
                            <li v-for="row in ROWS" :key="row" class="px-2 py-1">Notification {{ row }}</li>
                        </ul>
                        <Drawer.Close>Close</Drawer.Close>
                    </Drawer.Content>
                </Drawer.Popup>
            </Drawer.Viewport>
        </Drawer.Portal>
    </Drawer.Root>
    <button type="button" class="ms-2">Outside button</button>
    <Output :values="{ open, reason }" />
</template>
