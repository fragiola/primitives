<script setup lang="ts">
import { Accordion } from "../../kit/ui/accordion.ts";
import AccordionItems, { ITEMS } from "./accordion-items.vue";

// spec/accordion.md, `/accordion/horizontal` (and `?dir=rtl`); the page passes its locale, which a
// single root would take as an attribute
defineProps<{ locale?: string }>();
</script>

<template>
    <Accordion.Root orientation="horizontal" :loop-focus="false">
        <AccordionItems :items="ITEMS" />
    </Accordion.Root>
</template>
