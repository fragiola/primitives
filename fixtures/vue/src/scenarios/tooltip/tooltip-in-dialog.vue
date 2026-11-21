<script setup lang="ts">
import { Dialog } from "../../kit/ui/dialog.ts";
import { Tooltip } from "../../kit/ui/tooltip.ts";
</script>

<template>
    <Dialog.Root>
        <Dialog.Trigger>Open dialog</Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Popup>
                <Dialog.Title>Formatting</Dialog.Title>
                <Tooltip.Root>
                    <Tooltip.Trigger>Bold</Tooltip.Trigger>
                    <Tooltip.Portal>
                        <Tooltip.Positioner :side-offset="6">
                            <Tooltip.Popup>Bold (Ctrl+B)</Tooltip.Popup>
                        </Tooltip.Positioner>
                    </Tooltip.Portal>
                </Tooltip.Root>
                <Dialog.Close>Close</Dialog.Close>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>
</template>
