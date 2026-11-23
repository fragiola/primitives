<script setup lang="ts">
import { computed, ref } from "vue";
import Output from "../../kit/output.vue";
import { Toast } from "../../kit/ui/toast.ts";
import { notifications } from "./toast-queue.ts";

// spec/toast.md `/toast/basic`: the module's queue, and the Provider's through the composable.
const manager = Toast.useToastManager();
const closed = ref<string>();
const action = ref<string>();
const count = computed(
    () => manager.toasts.value.filter((item) => !item.closing).length,
);
const showToast = () =>
    notifications.add({
        title: "Saved",
        description: "Your draft was saved.",
        onClose: () => {
            closed.value = "Saved";
        },
    });
const showAlert = () =>
    manager.add({
        title: "Connection lost",
        description: "Retrying in 5 seconds.",
        priority: "high",
        onClose: () => {
            closed.value = "Connection lost";
        },
    });
const undo = (id: string, title: string | undefined) => {
    action.value = title;
    manager.close(id);
};
</script>

<template>
    <div class="flex gap-2">
        <button type="button">Before</button>
        <button type="button" @click="showToast">Show toast</button>
        <button type="button" @click="showAlert">Show alert</button>
        <button type="button" @click="manager.close()">Close all</button>
    </div>
    <Toast.Portal>
        <Toast.Viewport aria-label="Notifications">
            <Toast.Root v-for="item in manager.toasts.value" :key="item.id" :toast="item">
                <Toast.Title />
                <Toast.Description />
                <Toast.Action @click="undo(item.id, item.title)">Undo</Toast.Action>
                <Toast.Close>Dismiss</Toast.Close>
            </Toast.Root>
        </Toast.Viewport>
    </Toast.Portal>
    <Output :values="{ toasts: count, closed, action }" />
</template>
