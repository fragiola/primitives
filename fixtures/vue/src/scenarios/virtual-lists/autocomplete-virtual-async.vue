<script setup lang="ts">
import { useAsyncList } from "@fragiola/primitives-vue/async-list";
import { ref, useId } from "vue";
import Output from "../../kit/output.vue";
import { Autocomplete } from "../../kit/ui/autocomplete.ts";
import { AutocompleteVirtual } from "../../kit/ui/virtual-lists.ts";
import { loadLabels } from "./items.ts";

// An Autocomplete whose suggestions load for its text, page by page (spec/virtual-lists.md).
const id = useId();
const list = useAsyncList({ load: loadLabels });
const value = ref("");
const onValue = (next: string) => {
    value.value = next;
    list.setFilterText(next);
};
</script>

<template>
    <Autocomplete.Root :items="list.items" :filter="null" :value="value" @value-change="onValue">
        <div class="flex flex-col gap-1">
            <label :for="id" class="text-sm font-medium">Search</label>
            <Autocomplete.InputGroup>
                <Autocomplete.Input :id="id" />
            </Autocomplete.InputGroup>
            <Autocomplete.Status>{{ list.loading ? "Loading…" : "" }}</Autocomplete.Status>
        </div>
        <Autocomplete.Portal>
            <Autocomplete.Positioner :side-offset="4">
                <Autocomplete.Popup>
                    <AutocompleteVirtual.List :loading="list.loading" @load-more="list.loadMore">
                        <template #default="{ entry: label }: { entry: string }">
                            <Autocomplete.Item :value="label">{{ label }}</Autocomplete.Item>
                        </template>
                    </AutocompleteVirtual.List>
                </Autocomplete.Popup>
            </Autocomplete.Positioner>
        </Autocomplete.Portal>
    </Autocomplete.Root>
    <Output :values="{ count: list.items.length, filter: list.loading ? undefined : list.filterText, value }" />
</template>
