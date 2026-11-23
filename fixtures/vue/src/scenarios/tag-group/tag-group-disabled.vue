<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { TagGroup } from "../../kit/ui/tag-group.ts";
import TagGroupTags from "./tag-group-tags.vue";
import { CATEGORIES, printList } from "./tags.ts";

// `disabledKeys` and a disabled Tag (spec/tag-group.md, `/tag-group/disabled`).
const tags = ref(CATEGORIES);
const value = ref<readonly string[]>([]);
const onRemove = (removed: string) => {
    tags.value = tags.value.filter((tag) => tag.value !== removed);
};
</script>

<template>
    <TagGroup.Root v-model:value="value" selection-mode="multiple" :disabled-keys="['travel']" @remove="onRemove">
        <TagGroup.Label>Categories</TagGroup.Label>
        <TagGroup.List>
            <TagGroupTags :tags="tags" removable :disabled="['sports']" />
        </TagGroup.List>
    </TagGroup.Root>
    <Output :values="{ tags: printList(tags.map((tag) => tag.value)), value: printList(value) }" />
</template>
