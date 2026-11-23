<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { TagGroup } from "../../kit/ui/tag-group.ts";
import TagGroupTags from "./tag-group-tags.vue";
import { printList, SKILLS } from "./tags.ts";

// A TagGroup labelled and described by a Field (spec/tag-group.md, `/tag-group/field`).
const value = ref<string>();
</script>

<template>
    <Field.Root>
        <Field.Label>Skills</Field.Label>
        <TagGroup.Root selection-mode="multiple" @value-change="(next: string[]) => { value = printList(next); }">
            <TagGroup.List>
                <TagGroupTags :tags="SKILLS" />
            </TagGroup.List>
        </TagGroup.Root>
        <Field.Description>Your strongest skills.</Field.Description>
    </Field.Root>
    <Output :values="{ value }" />
</template>
