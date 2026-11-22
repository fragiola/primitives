<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Popover } from "../../kit/ui/popover.ts";

// spec/popover.md, `/popover/controlled`: the page opens and closes it through `open`.
const open = ref(false);
</script>

<template>
    <button type="button" class="me-2" @click="open = true">Show settings</button>
    <Popover.Root v-model:open="open">
        <Popover.Trigger>Settings</Popover.Trigger>
        <Popover.Portal>
            <Popover.Positioner :side-offset="4">
                <Popover.Popup>
                    <Popover.Title>Quick settings</Popover.Title>
                    <button type="button" @click="open = false">Done</button>
                </Popover.Popup>
            </Popover.Positioner>
        </Popover.Portal>
    </Popover.Root>
    <Output :values="{ open }" />
</template>
