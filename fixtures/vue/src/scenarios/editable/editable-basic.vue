<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/editable";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Editable } from "../../kit/ui/editable.ts";
import { Field } from "../../kit/ui/field.ts";
import { printEnd, printText } from "./editable-output.ts";

// An inline-editable title in a form (spec/editable.md, `/editable/basic`).
const value = ref<string>();
const commit = ref<string>();
const revert = ref<string>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValue = (next: string) => {
    value.value = printText(next);
};
const onCommit = (next: string, details: ChangeDetails) => {
    commit.value = printEnd(next, details);
};
const onRevert = (next: string, details: ChangeDetails) => {
    revert.value = printEnd(next, details);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <Field.Root>
            <Field.Label>Title</Field.Label>
            <Editable.Root
                name="title"
                default-value="Quarterly report"
                placeholder="Untitled"
                @value-change="onValue"
                @value-commit="onCommit"
                @value-revert="onRevert"
            >
                <Editable.Area>
                    <Editable.Preview />
                    <Editable.Input />
                </Editable.Area>
                <Editable.EditTrigger aria-label="Edit title" />
                <Editable.SubmitTrigger aria-label="Save title" />
                <Editable.CancelTrigger aria-label="Cancel edit" />
            </Editable.Root>
        </Field.Root>
        <button type="button">After</button>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ value, commit, revert, form }" />
</template>
