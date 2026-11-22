<script setup lang="ts">
import type { OpenChangeDetails } from "@fragiola/primitives-vue/popover";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Popover } from "../../kit/ui/popover.ts";

// One Popover opened from two Triggers, each with a name as its payload.
const PEOPLE = ["Ada", "Grace"];
const handle = Popover.createHandle<string>();
const open = ref(false);
const reason = ref<string>();
const trigger = ref<string>();
const onOpenChange = (next: boolean, details: OpenChangeDetails) => {
    open.value = next;
    reason.value = details.reason;
    trigger.value = details.trigger?.id;
};
</script>

<template>
    <div class="flex gap-24">
        <Popover.Trigger v-for="name in PEOPLE" :id="`info-${name.toLowerCase()}`" :key="name" :handle="handle" :payload="name">{{ `Info for ${name}` }}</Popover.Trigger>
    </div>
    <Popover.Root v-slot="{ payload }" :handle="handle" @open-change="onOpenChange">
        <Popover.Portal>
            <Popover.Positioner :side-offset="4">
                <Popover.Popup>
                    <Popover.Title>{{ `About ${payload}` }}</Popover.Title>
                    <Popover.Close>Close</Popover.Close>
                </Popover.Popup>
            </Popover.Positioner>
        </Popover.Portal>
    </Popover.Root>
    <Output :values="{ open, reason, trigger }" />
</template>
