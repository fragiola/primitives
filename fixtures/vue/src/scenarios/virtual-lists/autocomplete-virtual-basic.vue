<script setup lang="ts">
import { ref, useId } from "vue";
import Output from "../../kit/output.vue";
import { Autocomplete } from "../../kit/ui/autocomplete.ts";
import { AutocompleteVirtual } from "../../kit/ui/virtual-lists.ts";
import { LABELS } from "./items.ts";

// An Autocomplete over the 10 000 labels, with an AutocompleteVirtual List (spec/virtual-lists.md).
const id = useId();
const value = ref("");
</script>

<template>
    <Autocomplete.Root :items="LABELS" v-model:value="value">
        <div class="flex flex-col gap-1">
            <label :for="id" class="text-sm font-medium">Search</label>
            <Autocomplete.InputGroup>
                <Autocomplete.Input :id="id" />
            </Autocomplete.InputGroup>
        </div>
        <Autocomplete.Portal>
            <Autocomplete.Positioner :side-offset="4">
                <Autocomplete.Popup>
                    <AutocompleteVirtual.List>
                        <template #default="{ entry: label }: { entry: string }">
                            <Autocomplete.Item :value="label">{{ label }}</Autocomplete.Item>
                        </template>
                    </AutocompleteVirtual.List>
                </Autocomplete.Popup>
            </Autocomplete.Positioner>
        </Autocomplete.Portal>
    </Autocomplete.Root>
    <Output :values="{ value }" />
</template>
