<script setup lang="ts">
import { ref, useId, watch } from "vue";
import Output from "../../kit/output.vue";
import { Autocomplete } from "../../kit/ui/autocomplete.ts";
import CityPopup from "./city-popup.vue";
import { CITIES } from "./suggestions.ts";

// Suggestions loaded 300 ms after each change of the text (spec/autocomplete.md).
const id = useId();
const value = ref("");
const items = ref<readonly string[]>([]);
const loading = ref(false);
const loaded = ref<string>();
watch(value, (next, _, onCleanup) => {
    if (next === "") {
        items.value = [];
        loading.value = false;
        return;
    }
    loading.value = true;
    const query = next.trim().toLowerCase();
    const timer = setTimeout(() => {
        items.value = CITIES.filter((city) =>
            city.toLowerCase().includes(query),
        );
        loading.value = false;
        loaded.value = next;
    }, 300);
    onCleanup(() => clearTimeout(timer));
});
</script>

<template>
    <Autocomplete.Root :items="items" :filter="null" v-model:value="value">
        <div class="flex flex-col gap-1">
            <label :for="id" class="text-sm font-medium">City</label>
            <Autocomplete.InputGroup>
                <Autocomplete.Input :id="id" />
            </Autocomplete.InputGroup>
            <Autocomplete.Status>{{ loading ? "Loading…" : "" }}</Autocomplete.Status>
        </div>
        <CityPopup />
    </Autocomplete.Root>
    <Output :values="{ value, loaded }" />
</template>
