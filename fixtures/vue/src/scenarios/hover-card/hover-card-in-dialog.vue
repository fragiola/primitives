<script setup lang="ts">
import { Dialog } from "../../kit/ui/dialog.ts";
import { HoverCard } from "../../kit/ui/hover-card.ts";
</script>

<template>
    <Dialog.Root>
        <Dialog.Trigger>Open dialog</Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Popup>
                <Dialog.Title>Credits</Dialog.Title>
                <HoverCard.Root :delay="0">
                    <HoverCard.Trigger href="#ada">@ada</HoverCard.Trigger>
                    <HoverCard.Portal>
                        <HoverCard.Positioner :side-offset="8">
                            <HoverCard.Popup>Ada Lovelace</HoverCard.Popup>
                        </HoverCard.Positioner>
                    </HoverCard.Portal>
                </HoverCard.Root>
                <Dialog.Close>Close</Dialog.Close>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>
</template>
