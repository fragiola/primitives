<script setup lang="ts">
import { Toast } from "../../kit/ui/toast.ts";

// spec/toast.md `/toast/limit`.
const manager = Toast.useToastManager();
let count = 0;
const notify = () => {
    count += 1;
    manager.add({
        title: `Notification ${count}`,
        description: `Message ${count}`,
    });
};
</script>

<template>
    <button type="button" @click="notify">Notify</button>
    <Toast.Portal>
        <Toast.Viewport aria-label="Notifications">
            <Toast.Root v-for="item in manager.toasts.value" :key="item.id" :toast="item">
                <Toast.Title />
                <Toast.Description />
                <Toast.Close>Dismiss</Toast.Close>
            </Toast.Root>
        </Toast.Viewport>
    </Toast.Portal>
</template>
