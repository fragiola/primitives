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
    <div class="flex flex-col items-start gap-2">
        <Autocomplete.Root
            mode="both"
            :items="FRUITS"
            v-model:value="value"
            @value-change="(_: string, details: ChangeDetails) => (reason = details.reason)"
        >
            <div class="flex flex-col gap-1">
                <label :for="id" class="text-sm font-medium">Fruit</label>
                <Autocomplete.InputGroup>
                    <Autocomplete.Input :id="id" />
                </Autocomplete.InputGroup>
            </div>
            <FruitPopup />
        </Autocomplete.Root>
        <button type="button">After</button>
    </div>
    <Output :values="{ value, reason }" />
</template>
