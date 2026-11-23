<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Autocomplete } from "../../kit/ui/autocomplete.ts";
import { Field } from "../../kit/ui/field.ts";
import CityPopup from "./city-popup.vue";
import { CITIES } from "./suggestions.ts";

// The autocomplete inside a Field: labelled, described and validated by it.
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <Field.Root name="city">
            <Field.Label>City</Field.Label>
            <Autocomplete.Root :items="CITIES" required>
                <Autocomplete.InputGroup>
                    <Autocomplete.Input />
                </Autocomplete.InputGroup>
                <CityPopup />
            </Autocomplete.Root>
            <Field.Description>Type or pick one.</Field.Description>
            <Field.Error>Enter a city.</Field.Error>
        </Field.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ form }" />
</template>
