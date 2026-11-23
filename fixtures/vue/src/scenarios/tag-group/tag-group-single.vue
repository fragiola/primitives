<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { TagGroup } from "../../kit/ui/tag-group.ts";
import TagGroupTags from "./tag-group-tags.vue";
import { printList, SORTS } from "./tags.ts";

// An uncontrolled single selection (spec/tag-group.md, `/tag-group/single`).
const value = ref<string>();
</script>

<template>
    <TagGroup.Root selection-mode="single" @value-change="(next: string[]) => { value = printList(next); }">
        <TagGroup.Label>Sort</TagGroup.Label>
        <TagGroup.List>
            <TagGroupTags :tags="SORTS" />
        </TagGroup.List>
    </TagGroup.Root>
    <Output :values="{ value }" />
</template>
