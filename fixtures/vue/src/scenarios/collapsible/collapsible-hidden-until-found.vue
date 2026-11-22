<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/collapsible";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Collapsible } from "../../kit/ui/collapsible.ts";

// spec/collapsible.md, `/collapsible/hidden-until-found`
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
            <Collapsible.Trigger>Shipping details</Collapsible.Trigger>
            <Collapsible.Panel hidden-until-found>
                <p>Ships within two business days</p>
            </Collapsible.Panel>
        </Collapsible.Root>
        <Collapsible.Root>
            <Collapsible.Trigger>Return policy</Collapsible.Trigger>
            <Collapsible.Panel keep-mounted>
                <p>Returns are free for thirty days</p>
            </Collapsible.Panel>
        </Collapsible.Root>
    </div>
    <Output :values="{ open, reason }" />
</template>
