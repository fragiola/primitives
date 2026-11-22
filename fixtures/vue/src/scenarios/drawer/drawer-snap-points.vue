<script setup lang="ts">
import type {
    OpenChangeDetails,
    SnapPoint,
} from "@fragiola/primitives-vue/drawer";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Drawer } from "../../kit/ui/drawer.ts";

// spec/drawer.md: a bottom sheet resting at 200 px or all of its 560 px.
const SNAP_POINTS: SnapPoint[] = ["200px", 1];
const open = ref(false);
const reason = ref<string>();
const snap = ref<SnapPoint | null>("200px");
const onOpenChange = (next: boolean, details: OpenChangeDetails) => {
    open.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <Drawer.Root v-model:snap-point="snap" :snap-points="SNAP_POINTS" @open-change="onOpenChange">
        <Drawer.Trigger>Open map</Drawer.Trigger>
        <Drawer.Portal>
            <Drawer.Backdrop />
            <Drawer.Popup :style="{ height: '560px' }">
                <Drawer.Title>Map</Drawer.Title>
                <Drawer.Description>Drag to see more.</Drawer.Description>
                <Drawer.Close>Close</Drawer.Close>
            </Drawer.Popup>
        </Drawer.Portal>
    </Drawer.Root>
    <Output :values="{ open, reason, snap }" />
</template>
