<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Editable } from "../../kit/ui/editable.ts";
import { Field } from "../../kit/ui/field.ts";

// A required Editable in a Field (spec/editable.md, `/editable/field`).
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <Field.Root>
            <Field.Label>Project name</Field.Label>
            <Editable.Root required name="project" placeholder="Name your project">
                <Editable.Area>
                    <Editable.Preview />
                    <Editable.Input />
                </Editable.Area>
                <Editable.EditTrigger aria-label="Edit project name" />
            </Editable.Root>
            <Field.Description>Shown on the dashboard.</Field.Description>
            <Field.Error>Enter a project name.</Field.Error>
        </Field.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ form }" />
</template>
