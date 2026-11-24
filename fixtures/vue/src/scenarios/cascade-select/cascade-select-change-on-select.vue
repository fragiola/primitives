<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { pathText } from "./location-items.ts";
import LocationSelect from "./location-select.vue";

// spec/cascade-select.md, `/cascade-select/change-on-select`
const AMERICAS = ["americas"];
const value = ref<string>();
const open = ref(false);
const onValue = (next: readonly string[]) => {
    value.value = pathText(next);
};
const onOpen = (next: boolean) => {
    open.value = next;
};
</script>

<template>
    <div class="flex flex-col items-start gap-2">
        <label for="location" class="text-sm font-medium">Location</label>
        <LocationSelect id="location" change-on-select :default-value="AMERICAS" @value-change="onValue" @open-change="onOpen" />
    </div>
    <Output :values="{ value, open }" />
</template>
