<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/accordion";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Accordion } from "../../kit/ui/accordion.ts";
import AccordionItems, { ITEMS } from "./accordion-items.vue";

// spec/accordion.md, `/accordion/multiple`
const value = ref(["shipping"]);
const reason = ref<string>();
const onValueChange = (_next: string[], details: ChangeDetails) => {
    reason.value = details.reason;
};
</script>

<template>
    <Accordion.Root v-model:value="value" multiple @value-change="onValueChange">
        <AccordionItems :items="ITEMS" hidden-until-found />
    </Accordion.Root>
    <Output :values="{ value: value.join(','), reason }" />
</template>
