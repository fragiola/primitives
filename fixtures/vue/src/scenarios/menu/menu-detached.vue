<script setup lang="ts">
import type { OpenChangeDetails } from "@fragiola/primitives-vue/menu";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Menu } from "../../kit/ui/menu.ts";

// One Menu opened from three rows, each Trigger with the row's name as its payload.
const PEOPLE = ["Ada", "Grace", "Alan"];
const handle = Menu.createHandle<string>();
const open = ref(false);
const reason = ref<string>();
const trigger = ref<string>();
const chosen = ref<string>();
const onOpenChange = (next: boolean, details: OpenChangeDetails) => {
    open.value = next;
    reason.value = details.reason;
    trigger.value = details.trigger?.id;
};
</script>

<template>
    <ul class="flex flex-col gap-28">
        <li v-for="name in PEOPLE" :key="name" class="flex items-center gap-2">
            <span class="w-16">{{ name }}</span>
            <Menu.Trigger :id="`actions-${name.toLowerCase()}`" :handle="handle" :payload="name">{{ `Actions for ${name}` }}</Menu.Trigger>
        </li>
    </ul>
    <Menu.Root v-slot="{ payload }" :handle="handle" @open-change="onOpenChange">
        <Menu.Portal>
            <Menu.Positioner :side-offset="4">
                <Menu.Popup>
                    <Menu.Item @click="chosen = `Rename ${payload}`">{{ `Rename ${payload}` }}</Menu.Item>
                    <Menu.Item @click="chosen = `Delete ${payload}`">{{ `Delete ${payload}` }}</Menu.Item>
                </Menu.Popup>
            </Menu.Positioner>
        </Menu.Portal>
    </Menu.Root>
    <Output :values="{ open, reason, trigger, chosen }" />
</template>
