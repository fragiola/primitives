<script setup lang="ts">
import { ref, useId } from "vue";
import Output from "../../kit/output.vue";
import { Combobox } from "../../kit/ui/combobox.ts";
import { ComboboxVirtual } from "../../kit/ui/virtual-lists.ts";
import { ITEMS, type VirtualItem } from "./items.ts";

// A Combobox over the 10 000 items, with a ComboboxVirtual List (spec/virtual-lists.md).
const id = useId();
const value = ref<VirtualItem | null>(null);
const input = ref("");
</script>

<template>
    <Combobox.Root :items="ITEMS" v-model:value="value" @input-value-change="(next: string) => (input = next)">
        <div class="flex flex-col gap-1">
            <label :for="id" class="text-sm font-medium">Item</label>
            <Combobox.InputGroup>
                <Combobox.Input :id="id" />
            </Combobox.InputGroup>
        </div>
        <Combobox.Portal>
            <Combobox.Positioner :side-offset="4">
                <Combobox.Popup>
                    <Combobox.Empty>No item found.</Combobox.Empty>
                    <ComboboxVirtual.List>
                        <template #default="{ entry: item }: { entry: VirtualItem }">
                            <Combobox.Item :value="item" :disabled="item.disabled">{{ item.label }}</Combobox.Item>
                        </template>
                    </ComboboxVirtual.List>
                </Combobox.Popup>
            </Combobox.Positioner>
        </Combobox.Portal>
    </Combobox.Root>
    <Output :values="{ value: value?.value, input }" />
</template>
