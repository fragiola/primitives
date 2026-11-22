<script setup lang="ts">
import type { ItemFilter } from "@fragiola/primitives-vue/combobox";
import { ref, useId } from "vue";
import Output from "../../kit/output.vue";
import { Combobox } from "../../kit/ui/combobox.ts";
import { COUNTRIES, type Country, matchCountry } from "./combobox-items.ts";

// Object values, compared, named and serialized by the consumer (spec/combobox.md).
const id = useId();
const value = ref<Country | null>({ code: "BR", name: "Brazil" });
const input = ref("Brazil");
// typed by the consumer's own item: no cast (Epic #22)
const toLabel = (country: Country) => country.name;
const toValue = (country: Country) => country.code;
const isEqual = (item: Country, selected: Country) =>
    item.code === selected.code;
const filter: ItemFilter<Country> = (item, query) => matchCountry(item, query);
</script>

<template>
    <Combobox.Root
        :items="COUNTRIES"
        :item-to-string-label="toLabel"
        :item-to-string-value="toValue"
        :is-item-equal-to-value="isEqual"
        :filter="filter"
        v-model:value="value"
        v-model:input-value="input"
    >
        <div class="flex flex-col gap-1">
            <label :for="id" class="text-sm font-medium">Country</label>
            <Combobox.InputGroup>
                <Combobox.Input :id="id" />
            </Combobox.InputGroup>
        </div>
        <Combobox.Portal>
            <Combobox.Positioner :side-offset="4">
                <Combobox.Popup>
                    <Combobox.Empty>No country found.</Combobox.Empty>
                    <Combobox.List v-slot="{ entry: country }">
                        <Combobox.Item :key="country.code" :value="country">{{ country.name }}<Combobox.ItemIndicator>✓</Combobox.ItemIndicator></Combobox.Item>
                    </Combobox.List>
                </Combobox.Popup>
            </Combobox.Positioner>
        </Combobox.Portal>
    </Combobox.Root>
    <Output :values="{ value: value?.code, input }" />
</template>
