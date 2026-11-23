<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Listbox } from "../../kit/ui/listbox.ts";
import ListboxOptions from "./listbox-options.vue";
import { printValue, SIZES } from "./options.ts";

const value = ref<string | null>("m");
const onValueChange = (next: string | null | string[]) => {
    value.value = next as string | null;
};
</script>

<template>
    <div class="flex flex-col items-start gap-2">
        <h2 id="size" class="text-sm font-semibold">Size</h2>
        <Listbox.Root aria-labelledby="size" orientation="horizontal" :loop-focus="false" default-value="m" @value-change="onValueChange">
            <ListboxOptions :options="SIZES" />
        </Listbox.Root>
    </div>
    <Output :values="{ value: printValue(value) }" />
</template>
