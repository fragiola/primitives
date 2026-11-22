<script setup lang="ts">
import type { Align, Side } from "@fragiola/primitives-vue/popover";
import { Popover } from "../../kit/ui/popover.ts";

/** A popover whose popup is titled "Placed", placed by its Positioner props. */
defineProps<{
    label: string;
    side: Side;
    align?: Align;
}>();
</script>

<template>
    <Popover.Root>
        <Popover.Trigger>{{ label }}</Popover.Trigger>
        <Popover.Portal>
            <Popover.Positioner :side="side" :align="align" :side-offset="4">
                <Popover.Popup>
                    <Popover.Title>Placed</Popover.Title>
                </Popover.Popup>
            </Popover.Positioner>
        </Popover.Portal>
    </Popover.Root>
</template>
