<script setup lang="ts">
import { ref } from "vue";
import { Popover } from "../../kit/ui/popover.ts";

const copy = ref<HTMLButtonElement | null>(null);
</script>

<template>
    <Popover.Root>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Portal>
            <Popover.Positioner :side-offset="4">
                <Popover.Popup :initial-focus="() => copy">
                    <Popover.Title>Share link</Popover.Title>
                    <label class="flex flex-col gap-1">
                        Link
                        <input type="text" class="h-9 rounded-md border border-palette-line px-2" />
                    </label>
                    <button ref="copy" type="button">Copy</button>
                </Popover.Popup>
            </Popover.Positioner>
        </Popover.Portal>
    </Popover.Root>
</template>
