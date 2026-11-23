<script setup lang="ts">
import { SearchField } from "@fragiola/primitives-vue/search-field";
import { computed, ref } from "vue";
import { styles } from "./styles.ts";

const PRODUCTS = ["Desk lamp", "Floor lamp", "Standing desk", "Desk chair"];

// A product search (spec/search-field.md): typing filters the list, Escape or the clear button
// empties the field (the button is out of the tab order: Escape clears from the keyboard), and
// Enter searches for the query.
const query = ref("");
const searched = ref("");
const matches = computed(() =>
    PRODUCTS.filter((name) =>
        name.toLowerCase().includes(query.value.trim().toLowerCase()),
    ),
);
const search = (value: string) => {
    searched.value = `Searched for “${value}”.`;
};
</script>

<template>
    <!-- a `<search>` element: Vue's compiler does not know the tag, so it is rendered by name -->
    <component is="search" :class="styles.stack">
        <label for="product-search" :class="styles.label">Search products</label>
        <SearchField.Root id="product-search" v-model:value="query" :class="styles.root" @submit="search">
            <svg
                :class="styles.icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
            >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
            </svg>
            <SearchField.Input placeholder="Lamps, desks…" :class="styles.input" />
            <SearchField.ClearButton aria-label="Clear search" :class="styles.clearButton">
                <svg
                    :class="styles.icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                >
                    <path d="M6 6l12 12M18 6L6 18" />
                </svg>
            </SearchField.ClearButton>
        </SearchField.Root>
        <ul aria-label="Results" :class="styles.list">
            <li v-for="name in matches" :key="name">{{ name }}</li>
        </ul>
        <p role="status" :class="styles.status">{{ searched }}</p>
    </component>
</template>
