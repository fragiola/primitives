<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { pathText } from "./location-items.ts";
import LocationSelect from "./location-select.vue";

// spec/cascade-select.md, `/cascade-select/basic`
const value = ref<string>();
const open = ref(false);
const reason = ref<string>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValue = (next: readonly string[]) => {
    value.value = pathText(next);
};
const onOpen = (next: boolean, why: string) => {
    open.value = next;
    reason.value = why;
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <label for="location" class="text-sm font-medium">Location</label>
        <LocationSelect id="location" name="location" required separator=" / " @value-change="onValue" @open-change="onOpen" />
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ value, open, reason, form }" />
</template>
