<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Select } from "../../kit/ui/select.ts";
import { SelectVirtual } from "../../kit/ui/virtual-lists.ts";
import { ITEMS, type VirtualItem } from "./items.ts";

// A Select over the 10 000 items, with a SelectVirtual List (spec/virtual-lists.md).
const value = ref<string | null>(null);
const onValue = (next: string | null) => {
    value.value = next;
};
</script>

<template>
    <Select.Root :items="ITEMS" :value="value" @value-change="onValue">
        <Select.Trigger aria-label="Item"><Select.Value placeholder="Choose an item" /></Select.Trigger>
        <Select.Portal>
            <Select.Positioner>
                <Select.Popup>
                    <SelectVirtual.List>
                        <template #default="{ item }: { item: VirtualItem }">
                            <Select.Item :value="item.value">{{ item.label }}</Select.Item>
                        </template>
                    </SelectVirtual.List>
                </Select.Popup>
            </Select.Positioner>
        </Select.Portal>
    </Select.Root>
    <Output :values="{ value }" />
</template>
