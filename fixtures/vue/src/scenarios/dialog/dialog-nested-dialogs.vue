<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Dialog } from "../../kit/ui/dialog.ts";

// Three dialogs nested in each other, each with a Backdrop and a Viewport (spec/dialog.md).
const first = ref(false);
const second = ref(false);
const third = ref(false);
</script>

<template>
    <Dialog.Root @open-change="(next: boolean) => (first = next)">
        <Dialog.Trigger>Open first</Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Viewport>
                <Dialog.Popup>
                    <Dialog.Title>First dialog</Dialog.Title>
                    <Dialog.Root @open-change="(next: boolean) => (second = next)">
                        <Dialog.Trigger>Open second</Dialog.Trigger>
                        <Dialog.Portal>
                            <Dialog.Backdrop />
                            <Dialog.Viewport>
                                <Dialog.Popup>
                                    <Dialog.Title>Second dialog</Dialog.Title>
                                    <Dialog.Root @open-change="(next: boolean) => (third = next)">
                                        <Dialog.Trigger>Open third</Dialog.Trigger>
                                        <Dialog.Portal>
                                            <Dialog.Backdrop />
                                            <Dialog.Viewport>
                                                <Dialog.Popup>
                                                    <Dialog.Title>Third dialog</Dialog.Title>
                                                    <Dialog.Close>Close third</Dialog.Close>
                                                </Dialog.Popup>
                                            </Dialog.Viewport>
                                        </Dialog.Portal>
                                    </Dialog.Root>
                                    <Dialog.Close>Close second</Dialog.Close>
                                </Dialog.Popup>
                            </Dialog.Viewport>
                        </Dialog.Portal>
                    </Dialog.Root>
                    <Dialog.Close>Close first</Dialog.Close>
                </Dialog.Popup>
            </Dialog.Viewport>
        </Dialog.Portal>
    </Dialog.Root>
    <Output :values="{ first, second, third }" />
</template>
