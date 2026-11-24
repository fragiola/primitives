<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import Output from "../../kit/output.vue";
import { Command } from "../../kit/ui/command.ts";
import { Dialog } from "../../kit/ui/dialog.ts";
import CommandItems from "./command-items.vue";

// spec/command.md, `/command/dialog`: the Command dialog is a composition, a Command inside a
// Dialog opened by the app's own Cmd/Ctrl+K.
const open = ref(false);
const ran = ref<string>();
const toggle = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        open.value = !open.value;
    }
};
onMounted(() => document.addEventListener("keydown", toggle));
onBeforeUnmount(() => document.removeEventListener("keydown", toggle));
const run = (value: string) => {
    ran.value = value;
    open.value = false;
};
</script>

<template>
    <Dialog.Root v-model:open="open">
        <Dialog.Trigger>Open command menu</Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Popup aria-label="Command menu">
                <Command.Root>
                    <Command.Input aria-label="Command" />
                    <Command.Empty>No results.</Command.Empty>
                    <Command.List>
                        <CommandItems @run="run" />
                    </Command.List>
                </Command.Root>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>
    <Output :values="{ open, ran }" />
</template>
