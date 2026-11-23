<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { SearchField } from "../../kit/ui/search-field.ts";

// A disabled and a read-only SearchField (spec/search-field.md, `/search-field/states`).
const value = ref<string>();
const onValue = (next: string) => {
    value.value = next;
};
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <label for="disabled-search" class="text-sm font-medium">Disabled search</label>
        <SearchField.Root id="disabled-search" disabled default-value="chairs" @value-change="onValue">
            <SearchField.Input />
            <SearchField.ClearButton aria-label="Clear disabled search" />
        </SearchField.Root>
        <label for="saved-search" class="text-sm font-medium">Saved search</label>
        <SearchField.Root id="saved-search" read-only default-value="tables" @value-change="onValue">
            <SearchField.Input />
            <SearchField.ClearButton aria-label="Clear saved search" />
        </SearchField.Root>
    </div>
    <Output :values="{ value }" />
</template>
