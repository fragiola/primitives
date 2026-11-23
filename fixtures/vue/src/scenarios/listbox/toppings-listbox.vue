<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Listbox } from "../../kit/ui/listbox.ts";
import ListboxOptions from "./listbox-options.vue";
import { printValue, TOPPINGS } from "./options.ts";

// The toppings of `/listbox/multiple` and `/listbox/replace` (spec/listbox.md).
defineProps<{ selectionBehavior: "toggle" | "replace" }>();
const value = ref<readonly string[]>([]);
const onValueChange = (next: string | null | string[]) => {
    value.value = next as string[];
};
</script>

<template>
    <div class="flex flex-col items-start gap-2">
        <h2 id="toppings" class="text-sm font-semibold">Toppings</h2>
        <Listbox.Root aria-labelledby="toppings" multiple :selection-behavior="selectionBehavior" :value="value" @value-change="onValueChange">
            <ListboxOptions :options="TOPPINGS" />
        </Listbox.Root>
    </div>
    <Output :values="{ value: printValue(value) }" />
</template>
