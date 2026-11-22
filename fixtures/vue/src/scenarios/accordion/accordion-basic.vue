<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/accordion";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Accordion } from "../../kit/ui/accordion.ts";
import AccordionItems, { ITEMS } from "./accordion-items.vue";

// spec/accordion.md, `/accordion/basic`
const BASIC = [
    ITEMS[0],
    ITEMS[1],
    { value: "warranty", label: "Warranty", disabled: true },
    ITEMS[2],
].filter((item) => item !== undefined);
const value = ref<string>();
const reason = ref<string>();
const onValueChange = (next: string[], details: ChangeDetails) => {
    value.value = next.join(",");
    reason.value = details.reason;
};
</script>

<template>
    <Accordion.Root @value-change="onValueChange">
        <AccordionItems :items="BASIC" />
    </Accordion.Root>
    <button type="button" class="mt-2">After accordion</button>
    <Output :values="{ value, reason }" />
</template>
