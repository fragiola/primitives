<script setup lang="ts">
import type { OpenChangeDetails } from "@fragiola/primitives-vue/hover-card";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { HoverCard } from "../../kit/ui/hover-card.ts";

// One HoverCard previewing two Triggers, each with a name as its payload.
const PEOPLE = ["Ada", "Grace"];
const handle = HoverCard.createHandle<string>();
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
    <div class="flex gap-8">
        <HoverCard.Trigger v-for="name in PEOPLE" :id="name.toLowerCase()" :key="name" :handle="handle" :payload="name" :href="`#${name.toLowerCase()}`">{{ `@${name.toLowerCase()}` }}</HoverCard.Trigger>
    </div>
    <HoverCard.Root v-slot="{ payload }" :handle="handle" :delay="300" @open-change="onOpenChange">
        <HoverCard.Portal>
            <HoverCard.Backdrop />
            <HoverCard.Positioner :side-offset="8">
                <HoverCard.Popup>{{ `Profile of ${payload}` }}</HoverCard.Popup>
            </HoverCard.Positioner>
        </HoverCard.Portal>
    </HoverCard.Root>
    <Output :values="{ open, reason, trigger }" />
</template>
