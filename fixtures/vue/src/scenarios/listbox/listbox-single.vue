<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/listbox";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Listbox } from "../../kit/ui/listbox.ts";
import ListboxOptions from "./listbox-options.vue";
import { FRUITS, printValue } from "./options.ts";

const value = ref<string | null>(null);
const reason = ref<string>();
const onValueChange = (
    next: string | null | string[],
    details: ChangeDetails,
) => {
    value.value = next as string | null;
    reason.value = details.reason;
};
</script>

<template>
    <div class="flex flex-col items-start gap-2">
        <h2 id="fruit" class="text-sm font-semibold">Fruit</h2>
        <Listbox.Root aria-labelledby="fruit" :value="value" @value-change="onValueChange">
            <ListboxOptions :options="FRUITS" />
        </Listbox.Root>
        <button type="button">After</button>
    </div>
    <Output :values="{ value: printValue(value), reason }" />
</template>
