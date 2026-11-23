<script setup lang="ts">
import { Autocomplete } from "../../kit/ui/autocomplete.ts";

// The cities' popup: an Empty "No city found." and the List, each Item a city.
</script>

<template>
    <Autocomplete.Portal>
        <Autocomplete.Positioner :side-offset="4">
            <Autocomplete.Popup>
                <Autocomplete.Empty>No city found.</Autocomplete.Empty>
                <Autocomplete.List v-slot="{ entry: city }">
                    <Autocomplete.Item :key="city" :value="city">{{ city }}</Autocomplete.Item>
                </Autocomplete.List>
            </Autocomplete.Popup>
        </Autocomplete.Positioner>
    </Autocomplete.Portal>
</template>
