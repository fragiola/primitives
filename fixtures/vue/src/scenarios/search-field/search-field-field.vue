<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { SearchField } from "../../kit/ui/search-field.ts";

// A required SearchField in a Field (spec/search-field.md, `/search-field/field`).
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <Field.Root>
            <Field.Label>City</Field.Label>
            <SearchField.Root required name="city">
                <SearchField.Input />
                <SearchField.ClearButton aria-label="Clear city" />
            </SearchField.Root>
            <Field.Description>Where to look.</Field.Description>
            <Field.Error>Enter a city.</Field.Error>
        </Field.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ form }" />
</template>
