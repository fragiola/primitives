<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/tag-group";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { TagGroup } from "../../kit/ui/tag-group.ts";
import TagGroupTags from "./tag-group-tags.vue";
import { CATEGORIES, printList } from "./tags.ts";

// Removable tags, no selection (spec/tag-group.md, `/tag-group/basic`).
const tags = ref(CATEGORIES);
const removed = ref<string>();
const reason = ref<string>();
const onRemove = (value: string, details: ChangeDetails) => {
    tags.value = tags.value.filter((tag) => tag.value !== value);
    removed.value = value;
    reason.value = details.reason;
};
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <TagGroup.Root @remove="onRemove">
            <TagGroup.Label>Categories</TagGroup.Label>
            <TagGroup.List>
                <TagGroupTags :tags="tags" removable />
            </TagGroup.List>
            <p v-if="tags.length === 0" class="text-xs">No categories.</p>
        </TagGroup.Root>
        <button type="button">After</button>
    </div>
    <Output :values="{ tags: printList(tags.map((tag) => tag.value)), removed, reason }" />
</template>
