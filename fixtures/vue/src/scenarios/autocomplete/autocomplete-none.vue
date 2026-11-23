<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/autocomplete";
import { ref, useId } from "vue";
import Output from "../../kit/output.vue";
import { Autocomplete } from "../../kit/ui/autocomplete.ts";
import FruitPopup from "./fruit-popup.vue";
import { FRUITS } from "./suggestions.ts";

const id = useId();
const value = ref("");
const reason = ref<string>();
</script>

<template>
    <Autocomplete.Root
        mode="none"
        :items="FRUITS"
        open-on-input-click
        auto-highlight
        v-model:value="value"
        @open-change="(_: boolean, details: ChangeDetails) => (reason = details.reason)"
    >
        <div class="flex flex-col gap-1">
            <label :for="id" class="text-sm font-medium">Fruit</label>
            <Autocomplete.InputGroup>
                <Autocomplete.Input :id="id" />
                <Autocomplete.Trigger aria-label="Show suggestions">▾</Autocomplete.Trigger>
            </Autocomplete.InputGroup>
        </div>
        <FruitPopup :empty="null" />
    </Autocomplete.Root>
    <Output :values="{ value, reason }" />
</template>
