<script setup lang="ts">
import { Drawer } from "@fragiola/primitives-vue/drawer";
import { ref } from "vue";
import { styles } from "./styles.ts";

const TARGETS = ["Copy link", "Email", "Messages"];

// A share sheet: "Share" opens a bottom sheet that slides up; swipe it down (with a mouse, from
// its handle; with a touch, from anywhere), press Escape or choose a target to close it
// (spec/drawer.md).
const open = ref(false);
const status = ref("Not shared yet");
const share = (target: string) => {
    status.value = `Shared: ${target}`;
    open.value = false;
};
</script>

<template>
    <div :class="styles.stack">
        <Drawer.Root v-model:open="open">
            <Drawer.Trigger :class="styles.trigger">Share</Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Backdrop :class="styles.backdrop" />
                <Drawer.Viewport :class="styles.viewport">
                    <Drawer.Popup :class="styles.popup">
                        <div aria-hidden="true" :class="styles.handle" />
                        <Drawer.Content :class="styles.content">
                            <Drawer.Title :class="styles.title">Share</Drawer.Title>
                            <Drawer.Description :class="styles.description">Send this page to someone.</Drawer.Description>
                            <div :class="styles.targets">
                                <button
                                    v-for="target in TARGETS"
                                    :key="target"
                                    type="button"
                                    :class="styles.target"
                                    @click="share(target)"
                                >{{ target }}</button>
                            </div>
                            <Drawer.Close :class="styles.close">Cancel</Drawer.Close>
                        </Drawer.Content>
                    </Drawer.Popup>
                </Drawer.Viewport>
            </Drawer.Portal>
        </Drawer.Root>
        <p :class="styles.status">{{ status }}</p>
    </div>
</template>
