<script setup lang="ts">
import { useAsyncList } from "@fragiola/primitives-vue/async-list";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Select } from "../../kit/ui/select.ts";
import { SelectVirtual } from "../../kit/ui/virtual-lists.ts";
import { loadItems, type VirtualItem } from "./items.ts";

// A Select whose items load page by page (spec/virtual-lists.md).
const list = useAsyncList({ load: loadItems });
const value = ref<string | null>(null);
const onValue = (next: string | null) => {
    value.value = next;
};
</script>

<template>
    <Select.Root :items="list.items" :value="value" @value-change="onValue">
        <Select.Trigger aria-label="Item"><Select.Value placeholder="Choose an item" /></Select.Trigger>
        <Select.Portal>
            <Select.Positioner>
                <Select.Popup>
                    <SelectVirtual.List :loading="list.loading" @load-more="list.loadMore">
                        <template #default="{ item }: { item: VirtualItem }">
                            <Select.Item :value="item.value">{{ item.label }}</Select.Item>
                        </template>
                    </SelectVirtual.List>
                </Select.Popup>
            </Select.Positioner>
        </Select.Portal>
    </Select.Root>
    <Output :values="{ count: list.items.length, value }" />
</template>
