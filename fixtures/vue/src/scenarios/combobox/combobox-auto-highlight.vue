<script setup lang="ts">
import { ref, useId } from "vue";
import Output from "../../kit/output.vue";
import { Combobox } from "../../kit/ui/combobox.ts";
import FruitPopup from "./fruit-popup.vue";
import { FRUITS, type Fruit, printValues } from "./fruits.ts";

// spec/combobox.md, `/combobox/auto-highlight`
const id = useId();
const value = ref<Fruit | null>(null);
</script>

<template>
    <Combobox.Root
        :items="FRUITS"
        auto-highlight
        @value-change="(next: unknown) => (value = next as Fruit | null)"
    >
        <div class="flex flex-col gap-1">
            <label :for="id" class="text-sm font-medium">Fruit</label>
            <Combobox.InputGroup>
                <Combobox.Input :id="id" />
            </Combobox.InputGroup>
        </div>
        <FruitPopup />
    </Combobox.Root>
    <Output :values="{ value: printValues(value) }" />
</template>
