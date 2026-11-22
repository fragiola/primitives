<script lang="ts">
export interface Item {
    value: string;
    label: string;
    disabled?: boolean;
}

export const ITEMS: Item[] = [
    { value: "shipping", label: "Shipping" },
    { value: "returns", label: "Returns" },
    { value: "support", label: "Support" },
];
</script>

<script setup lang="ts">
import { TextRuns } from "../../kit/text-runs.ts";
import { Accordion } from "../../kit/ui/accordion.ts";

// The items of every accordion scenario (spec/accordion.md): a Header, a Trigger, a Panel.
withDefaults(defineProps<{ items: Item[]; hiddenUntilFound?: boolean }>(), {
    hiddenUntilFound: false,
});
</script>

<template>
    <Accordion.Item v-for="item in items" :key="item.value" :value="item.value" :disabled="item.disabled">
        <Accordion.Header>
            <Accordion.Trigger>{{ item.label }}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel :hidden-until-found="hiddenUntilFound">
            <p><TextRuns :runs="[item.label, ' details']" /></p>
        </Accordion.Panel>
    </Accordion.Item>
</template>
