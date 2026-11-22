<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/collapsible";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Collapsible } from "../../kit/ui/collapsible.ts";

// spec/collapsible.md, `/collapsible/basic`
const open = ref<boolean>();
const reason = ref<string>();
const onOpenChange = (next: boolean, details: ChangeDetails) => {
    open.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <div class="flex flex-col gap-4">
        <Collapsible.Root @open-change="onOpenChange">
            <Collapsible.Trigger>Recovery keys</Collapsible.Trigger>
            <Collapsible.Panel>
                <p>alpha-1234</p>
                <p>beta-5678</p>
            </Collapsible.Panel>
        </Collapsible.Root>
        <Collapsible.Root default-open disabled>
            <Collapsible.Trigger>Archived keys</Collapsible.Trigger>
            <Collapsible.Panel>
                <p>gamma-9012</p>
            </Collapsible.Panel>
        </Collapsible.Root>
    </div>
    <button type="button" class="mt-2">After collapsible</button>
    <Output :values="{ open, reason }" />
</template>
