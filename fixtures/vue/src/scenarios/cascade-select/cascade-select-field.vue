<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { pathText } from "./location-items.ts";
import LocationSelect from "./location-select.vue";

// spec/cascade-select.md, `/cascade-select/field`
const LYON = ["europe", "france", "lyon"];
const value = ref<string>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValue = (next: readonly string[]) => {
    value.value = pathText(next);
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <Field.Root name="place">
            <Field.Label>Place</Field.Label>
            <LocationSelect :default-value="LYON" separator=" / " @value-change="onValue" />
            <Field.Description>Where you live.</Field.Description>
        </Field.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ value, form }" />
</template>
