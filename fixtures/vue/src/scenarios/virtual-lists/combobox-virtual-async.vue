<script setup lang="ts">
import { useAsyncList } from "@fragiola/primitives-vue/async-list";
import { ref, useId } from "vue";
import Output from "../../kit/output.vue";
import { Combobox } from "../../kit/ui/combobox.ts";
import { ComboboxVirtual } from "../../kit/ui/virtual-lists.ts";
import { loadItems, type VirtualItem } from "./items.ts";

// A Combobox whose items load for its text, page by page (spec/virtual-lists.md).
const id = useId();
const list = useAsyncList({ load: loadItems });
const value = ref<VirtualItem | null>(null);
</script>

<template>
    <Combobox.Root :items="list.items" :filter="null" v-model:value="value" @input-value-change="(next: string) => list.setFilterText(next)">
        <div class="flex flex-col gap-1">
            <label :for="id" class="text-sm font-medium">Item</label>
            <Combobox.InputGroup>
                <Combobox.Input :id="id" />
            </Combobox.InputGroup>
            <Combobox.Status>{{ list.loading ? "Loading…" : "" }}</Combobox.Status>
        </div>
        <Combobox.Portal>
            <Combobox.Positioner :side-offset="4">
                <Combobox.Popup>
                    <ComboboxVirtual.List :loading="list.loading" @load-more="list.loadMore">
                        <template #default="{ entry: item }: { entry: VirtualItem }">
                            <Combobox.Item :value="item" :disabled="item.disabled">{{ item.label }}</Combobox.Item>
                        </template>
                    </ComboboxVirtual.List>
                </Combobox.Popup>
            </Combobox.Positioner>
        </Combobox.Portal>
    </Combobox.Root>
    <Output :values="{ count: list.items.length, filter: list.loading ? undefined : list.filterText, value: value?.value }" />
</template>
