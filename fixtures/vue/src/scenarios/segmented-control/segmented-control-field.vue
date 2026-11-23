<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { SegmentedControl } from "../../kit/ui/segmented-control.ts";
import Segments from "./segments.vue";
import { DENSITIES } from "./views.ts";

// A required control in a Field (spec/segmented-control.md, `/segmented-control/field`).
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <Field.Root>
            <Field.Label>Density</Field.Label>
            <SegmentedControl.Root required name="density">
                <Segments :segments="DENSITIES" />
                <SegmentedControl.Indicator />
            </SegmentedControl.Root>
            <Field.Description>Spacing of the rows.</Field.Description>
            <Field.Error>Choose a density.</Field.Error>
        </Field.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ form }" />
</template>
