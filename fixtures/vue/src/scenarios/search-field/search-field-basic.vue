<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/search-field";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { SearchField } from "../../kit/ui/search-field.ts";

// A search form (spec/search-field.md, `/search-field/basic`).
const value = ref<string>();
const reason = ref<string>();
const submitted = ref<string>();
const escapes = ref(0);
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValue = (next: string, details: ChangeDetails) => {
    value.value = next;
    reason.value = details.reason;
};
const onQuery = (next: string) => {
    submitted.value = next;
};
// the Escape key downs that reach the page with their default not prevented
const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && !event.defaultPrevented) {
        escapes.value += 1;
    }
};
onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));
</script>

<template>
    <!-- a `<search>` element: Vue's compiler does not know the tag, so it is rendered by name -->
    <component is="search" aria-label="Products">
        <form class="flex flex-col items-start gap-4" @submit="onSubmit">
            <label for="search" class="text-sm font-medium">Search</label>
            <SearchField.Root id="search" name="q" @value-change="onValue" @submit="onQuery">
                <SearchField.Input placeholder="Lamps, desks…" />
                <SearchField.ClearButton aria-label="Clear search" />
            </SearchField.Root>
            <button type="submit">Go</button>
        </form>
    </component>
    <Output :values="{ value, reason, submitted, 'page-escape': escapes, form }" />
</template>
