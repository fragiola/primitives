<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/tag-group";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { TagGroup } from "../../kit/ui/tag-group.ts";
import TagGroupTags from "./tag-group-tags.vue";
import { CATEGORIES, printList } from "./tags.ts";

// A controlled multiple selection (spec/tag-group.md, `/tag-group/selection`).
const value = ref<readonly string[]>(["gaming"]);
const reason = ref<string>();
const onValueChange = (next: string[], details: ChangeDetails) => {
    value.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <TagGroup.Root selection-mode="multiple" :value="value" @value-change="onValueChange">
        <TagGroup.Label>Interests</TagGroup.Label>
        <TagGroup.List>
            <TagGroupTags :tags="CATEGORIES" />
        </TagGroup.List>
    </TagGroup.Root>
    <Output :values="{ value: printList(value), reason }" />
</template>
