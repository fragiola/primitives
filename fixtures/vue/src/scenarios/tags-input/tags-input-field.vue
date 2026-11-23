<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { TagsInput } from "../../kit/ui/tags-input.ts";
import TagsInputTags from "./tags-input-tags.vue";

// A required TagsInput in a Field, and another in the same form (spec/tags-input.md).
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <Field.Root name="tags">
            <Field.Label>Tags</Field.Label>
            <TagsInput.Root required>
                <template #default="{ value: tags }">
                    <TagsInput.Control>
                        <TagsInputTags :value="tags" />
                        <TagsInput.Input />
                    </TagsInput.Control>
                </template>
            </TagsInput.Root>
            <Field.Description>Press Enter to add a tag.</Field.Description>
            <Field.Error>Add at least one tag.</Field.Error>
        </Field.Root>
        <div class="flex flex-col items-start gap-1">
            <label for="labels" class="text-sm font-medium">Labels</label>
            <TagsInput.Root name="labels" :default-value="['bug']">
                <template #default="{ value: tags }">
                    <TagsInput.Control>
                        <TagsInputTags :value="tags" />
                        <TagsInput.Input id="labels" />
                    </TagsInput.Control>
                </template>
            </TagsInput.Root>
        </div>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ form }" />
</template>
