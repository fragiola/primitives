<script setup lang="ts">
import { Button } from "@fragiola/primitives-vue/button";
import {
    createToastManager,
    Toast,
    type ToastObject,
} from "@fragiola/primitives-vue/toast";
import { onBeforeUnmount, onMounted, shallowRef } from "vue";
import { styles } from "./styles.ts";

// A stack of notifications: they close after five seconds (paused while hovered or focused), the
// older ones peek behind the newest, F6 reaches them, and a swipe to the right dismisses one.
// The app's notifications: a plain module could hold this queue and add to it from anywhere.
const notifications = createToastManager({ limit: 3 });
const toasts = shallowRef<readonly ToastObject[]>(notifications.toasts());
let unsubscribe = () => {};
onMounted(() => {
    toasts.value = notifications.toasts();
    unsubscribe = notifications.subscribe(() => {
        toasts.value = notifications.toasts();
    });
});
onBeforeUnmount(() => unsubscribe());

let sent = 0;
const sendMessage = () => {
    sent += 1;
    notifications.add({
        title: `Message ${sent} sent`,
        description: "Delivered to the team channel.",
    });
};
const warnOffline = () => {
    notifications.add({
        title: "You are offline",
        description: "Changes will sync when you reconnect.",
        priority: "high",
        timeout: 8000,
    });
};
</script>

<template>
    <Toast.Provider :toast-manager="notifications">
        <div :class="styles.buttons">
            <Button type="button" :class="styles.trigger" @click="sendMessage">Send message</Button>
            <Button type="button" :class="styles.trigger" @click="warnOffline">Go offline</Button>
        </div>
        <Toast.Portal>
            <Toast.Viewport aria-label="Notifications" :class="styles.viewport">
                <Toast.Root v-for="item in toasts" :key="item.id" :toast="item" :class="styles.root">
                    <Toast.Title :class="styles.title" />
                    <Toast.Description :class="styles.description" />
                    <Toast.Action v-if="item.priority === 'low'" :class="styles.action" @click="notifications.close(item.id)">Undo</Toast.Action>
                    <Toast.Close :class="styles.close">Dismiss</Toast.Close>
                </Toast.Root>
            </Toast.Viewport>
        </Toast.Portal>
    </Toast.Provider>
</template>
