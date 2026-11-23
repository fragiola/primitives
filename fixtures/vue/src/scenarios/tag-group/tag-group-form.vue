<script setup lang="ts">
import { Field } from "../../kit/ui/field.ts";
import { Form } from "../../kit/ui/form.ts";
import { TagGroup } from "../../kit/ui/tag-group.ts";
import TagGroupTags from "./tag-group-tags.vue";
import { SKILLS, validateSkills } from "./tags.ts";

// A TagGroup in a Field of a Form, its first tag disabled (spec/tag-group.md, `/tag-group/form`).
const DISABLED_KEYS = ["design"];
</script>

<template>
    <Form @submit="(event: Event) => event.preventDefault()">
        <Field.Root name="skills" :validate="validateSkills">
            <Field.Label>Skills</Field.Label>
            <TagGroup.Root selection-mode="multiple" :disabled-keys="DISABLED_KEYS">
                <TagGroup.List>
                    <TagGroupTags :tags="SKILLS" />
                </TagGroup.List>
            </TagGroup.Root>
            <Field.Error />
        </Field.Root>
        <button type="submit">Submit</button>
    </Form>
</template>
