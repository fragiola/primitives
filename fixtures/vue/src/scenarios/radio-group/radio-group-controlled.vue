<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Radio, RadioGroup } from "../../kit/ui/radio-group.ts";

const SIZES = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
];

// The consumer refuses `large`: the value stays.
const value = ref("medium");
const requested = ref<string | null>();
const onValue = (next: string | null) => {
    requested.value = next;
    if (next !== null && next !== "large") {
        value.value = next;
    }
};
</script>

<template>
    <h2 id="size" class="text-sm font-semibold">Size</h2>
    <RadioGroup aria-labelledby="size" orientation="horizontal" :loop-focus="false" :value="value" @update:value="onValue">
        <label v-for="size in SIZES" :key="size.value" class="flex items-center gap-2 text-sm"><Radio.Root :value="size.value" />{{ size.label }}</label>
    </RadioGroup>
    <Output :values="{ value, requested }" />
</template>
