<script setup lang="ts">
import { Autocomplete } from "../../kit/ui/autocomplete.ts";

// The fruits' popup: an Empty (when given) and the List, each Item its label.
withDefaults(defineProps<{ empty?: string | null; keepMounted?: boolean }>(), {
    empty: "No suggestion.",
    keepMounted: false,
});
</script>

<template>
    <Autocomplete.Portal :keep-mounted="keepMounted">
        <Autocomplete.Positioner :side-offset="4">
            <Autocomplete.Popup>
                <Autocomplete.Empty v-if="empty !== null">{{ empty }}</Autocomplete.Empty>
                <Autocomplete.List v-slot="{ entry: fruit }">
                    <Autocomplete.Item :key="fruit.value" :value="fruit" :disabled="fruit.disabled">{{ fruit.label }}</Autocomplete.Item>
                </Autocomplete.List>
            </Autocomplete.Popup>
        </Autocomplete.Positioner>
    </Autocomplete.Portal>
</template>
