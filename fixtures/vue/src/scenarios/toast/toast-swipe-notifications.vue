<script setup lang="ts">
import { computed } from "vue";
import Output from "../../kit/output.vue";
import { Toast } from "../../kit/ui/toast.ts";

// spec/toast.md `/toast/swipe`.
const manager = Toast.useToastManager();
const count = computed(
    () => manager.toasts.value.filter((item) => !item.closing).length,
);
const notify = () =>
    manager.add({ title: "Swipe me", description: "Drag to dismiss" });
</script>

<template>
    <button type="button" @click="notify">Notify</button>
    <Toast.Portal>
        <Toast.Viewport aria-label="Notifications">
            <Toast.Root v-for="item in manager.toasts.value" :key="item.id" :toast="item" swipe-direction="right">
                <Toast.Title />
                <Toast.Description />
                <Toast.Close>Dismiss</Toast.Close>
            </Toast.Root>
        </Toast.Viewport>
    </Toast.Portal>
    <Output :values="{ toasts: count }" />
</template>
