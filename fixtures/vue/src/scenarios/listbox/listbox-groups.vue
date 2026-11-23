<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Listbox } from "../../kit/ui/listbox.ts";
import ListboxOptions from "./listbox-options.vue";
import { PRODUCE, printValue } from "./options.ts";

const value = ref<string | null>(null);
const onValueChange = (next: string | null | string[]) => {
    value.value = next as string | null;
};
</script>

<template>
    <div class="flex flex-col items-start gap-2">
        <h2 id="produce" class="text-sm font-semibold">Produce</h2>
        <Listbox.Root aria-labelledby="produce" @value-change="onValueChange">
            <template v-for="(group, index) in PRODUCE" :key="group.label">
                <Listbox.Separator v-if="index > 0" />
                <Listbox.Group>
                    <Listbox.GroupLabel>{{ group.label }}</Listbox.GroupLabel>
                    <ListboxOptions :options="group.items" />
                </Listbox.Group>
            </template>
        </Listbox.Root>
    </div>
    <Output :values="{ value: printValue(value) }" />
</template>
