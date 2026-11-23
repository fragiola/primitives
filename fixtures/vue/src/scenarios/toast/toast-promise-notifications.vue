<script setup lang="ts">
import { Toast } from "../../kit/ui/toast.ts";

// spec/toast.md `/toast/promise`: a save that settles 1 s later (on the page's clock).
const manager = Toast.useToastManager();
const save = (fails: boolean) =>
    new Promise<string>((resolve, reject) => {
        setTimeout(
            () => (fails ? reject(new Error("offline")) : resolve("ok")),
            1000,
        );
    });
const run = (fails: boolean) => {
    manager
        .promise(save(fails), {
            loading: "Saving file",
            success: "File saved",
            error: (error) => `Could not save: ${(error as Error).message}`,
        })
        .catch(() => {});
};
</script>

<template>
    <div class="flex gap-2">
        <button type="button" @click="run(false)">Save file</button>
        <button type="button" @click="run(true)">Save offline</button>
    </div>
    <Toast.Portal>
        <Toast.Viewport aria-label="Notifications">
            <Toast.Root v-for="item in manager.toasts.value" :key="item.id" :toast="item">
                <Toast.Title />
                <Toast.Close>Dismiss</Toast.Close>
            </Toast.Root>
        </Toast.Viewport>
    </Toast.Portal>
</template>
