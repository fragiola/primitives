<script setup lang="ts">
import { Autocomplete } from "@fragiola/primitives-vue/autocomplete";
import { ref } from "vue";
import { styles } from "./styles.ts";

const FRAMEWORKS = [
    "Angular",
    "Astro",
    "Ember",
    "Lit",
    "Next.js",
    "Nuxt",
    "Preact",
    "Qwik",
    "React",
    "Remix",
    "Solid",
    "Svelte",
    "Vue",
];

// A search with suggestions: the list follows the text, the arrows highlight a suggestion, Enter
// or a click fills it in, any other text is searched as typed, and Escape closes the list, then
// clears the text (spec/autocomplete.md).
const searched = ref<string>();
function search(event: SubmitEvent) {
    const data = new FormData(event.currentTarget as HTMLFormElement);
    searched.value = String(data.get("q") ?? "");
}
</script>

<template>
    <form :class="styles.stack" @submit.prevent="search">
        <label for="search" :class="styles.label">Search frameworks</label>
        <Autocomplete.Root :items="FRAMEWORKS" name="q">
            <Autocomplete.InputGroup :class="styles.inputGroup">
                <Autocomplete.Input id="search" :class="styles.input" />
                <Autocomplete.Clear aria-label="Clear search" :class="styles.clear">×</Autocomplete.Clear>
            </Autocomplete.InputGroup>
            <Autocomplete.Portal>
                <Autocomplete.Positioner :side-offset="4" :class="styles.positioner">
                    <Autocomplete.Popup :class="styles.popup">
                        <Autocomplete.Empty :class="styles.empty">No suggestion.</Autocomplete.Empty>
                        <Autocomplete.List v-slot="{ entry }: { entry: string }" :class="styles.list">
                            <Autocomplete.Item :key="entry" :value="entry" :class="styles.item">{{ entry }}</Autocomplete.Item>
                        </Autocomplete.List>
                    </Autocomplete.Popup>
                </Autocomplete.Positioner>
            </Autocomplete.Portal>
        </Autocomplete.Root>
        <p :class="styles.result">{{ searched === undefined ? "Press Enter to search." : `Results for “${searched}”` }}</p>
    </form>
</template>
