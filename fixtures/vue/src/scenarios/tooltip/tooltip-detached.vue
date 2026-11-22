<script setup lang="ts">
import type { OpenChangeDetails } from "@fragiola/primitives-vue/tooltip";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Tooltip } from "../../kit/ui/tooltip.ts";

// One Tooltip describing two Triggers, each with a name as its payload.
const PEOPLE = ["Ada", "Grace"];
const handle = Tooltip.createHandle<string>();
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
    <div class="mt-12 flex gap-8">
        <Tooltip.Trigger v-for="name in PEOPLE" :id="`call-${name.toLowerCase()}`" :key="name" :handle="handle" :payload="name">{{ `Call ${name}` }}</Tooltip.Trigger>
    </div>
    <Tooltip.Root v-slot="{ payload }" :handle="handle" :delay="300" @open-change="onOpenChange">
        <Tooltip.Portal>
            <Tooltip.Positioner :side-offset="6">
                <Tooltip.Popup>{{ `Opens a call with ${payload}` }}</Tooltip.Popup>
            </Tooltip.Positioner>
        </Tooltip.Portal>
    </Tooltip.Root>
    <Output :values="{ open, reason, trigger }" />
</template>
