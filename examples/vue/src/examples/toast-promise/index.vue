<script setup lang="ts">
import { Button } from "@fragiola/primitives-vue/button";
import {
    createToastManager,
    Toast,
    type ToastObject,
} from "@fragiola/primitives-vue/toast";
import { onBeforeUnmount, onMounted, shallowRef } from "vue";
import { styles } from "./styles.ts";

// A promise toast: "Uploading" while the upload runs (it never closes by itself meanwhile), then
// its result, announced and closed after the timeout.
const uploads = createToastManager({ timeout: 4000 });
const toasts = shallowRef<readonly ToastObject[]>(uploads.toasts());
let unsubscribe = () => {};
onMounted(() => {
    toasts.value = uploads.toasts();
    unsubscribe = uploads.subscribe(() => {
        toasts.value = uploads.toasts();
    });
});
onBeforeUnmount(() => unsubscribe());

/** A pretend upload: it settles after 1.5 s, and fails for a file named "too-large.zip". */
const upload = (name: string) =>
    new Promise<{ name: string }>((resolve, reject) => {
        setTimeout(
            () =>
                name === "too-large.zip"
                    ? reject(new Error("the file is over 10 MB"))
                    : resolve({ name }),
            1500,
        );
    });
const start = (name: string) => {
    uploads
        .promise(upload(name), {
            loading: {
                title: `Uploading ${name}`,
                description: "Please wait.",
            },
            success: (file) => ({
                title: `${file.name} uploaded`,
                description: "It is in your files.",
            }),
            error: (error) => ({
                title: `Could not upload ${name}`,
                description: (error as Error).message,
            }),
        })
        .catch(() => {});
};
</script>

<template>
    <Toast.Provider :toast-manager="uploads">
        <div :class="styles.buttons">
            <Button type="button" :class="styles.trigger" @click="start('report.pdf')">Upload report.pdf</Button>
            <Button type="button" :class="styles.trigger" @click="start('too-large.zip')">Upload too-large.zip</Button>
        </div>
        <Toast.Portal>
            <Toast.Viewport aria-label="Notifications" :class="styles.viewport">
                <Toast.Root v-for="item in toasts" :key="item.id" :toast="item" :class="styles.root">
                    <Toast.Title :class="styles.title" />
                    <Toast.Description :class="styles.description" />
                    <Toast.Close :class="styles.close">Dismiss</Toast.Close>
                </Toast.Root>
            </Toast.Viewport>
        </Toast.Portal>
    </Toast.Provider>
</template>
