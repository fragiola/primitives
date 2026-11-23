<script setup lang="ts">
import { ref, useId } from "vue";
import Output from "../../kit/output.vue";
import { Autocomplete } from "../../kit/ui/autocomplete.ts";
import { PRODUCE, type ProduceGroup } from "./suggestions.ts";

const id = useId();
const value = ref("");
</script>

<template>
    <Autocomplete.Root :items="PRODUCE" :limit="3" v-model:value="value">
        <div class="flex flex-col gap-1">
            <label :for="id" class="text-sm font-medium">Produce</label>
            <Autocomplete.InputGroup>
                <Autocomplete.Input :id="id" />
            </Autocomplete.InputGroup>
        </div>
        <Autocomplete.Portal>
            <Autocomplete.Positioner :side-offset="4">
                <Autocomplete.Popup>
                    <Autocomplete.Empty>Nothing found.</Autocomplete.Empty>
                    <Autocomplete.List v-slot="{ entry: group, index }: { entry: ProduceGroup; index: number }">
                        <Autocomplete.Separator v-if="index > 0" />
                        <Autocomplete.Group>
                            <Autocomplete.GroupLabel>{{ group.label }}</Autocomplete.GroupLabel>
                            <Autocomplete.Item v-for="item in group.items" :key="item.value" :value="item">{{ item.label }}</Autocomplete.Item>
                        </Autocomplete.Group>
                    </Autocomplete.List>
                </Autocomplete.Popup>
            </Autocomplete.Positioner>
        </Autocomplete.Portal>
    </Autocomplete.Root>
    <Output :values="{ value }" />
</template>
