<script setup lang="ts">
import { TagGroup } from "../../kit/ui/tag-group.ts";
import type { Tag } from "./tags.ts";

// The scenarios' Tags: each a TagCell with its name and, when removable, its RemoveButton.
withDefaults(
    defineProps<{
        tags: readonly Tag[];
        removable?: boolean;
        disabled?: readonly string[];
    }>(),
    { removable: false, disabled: () => [] },
);
</script>

<template>
    <TagGroup.Tag v-for="tag in tags" :key="tag.value" :value="tag.value" :disabled="disabled.includes(tag.value)">
        <TagGroup.TagCell>{{ tag.label }}<TagGroup.RemoveButton v-if="removable" :aria-label="`Remove ${tag.label}`">×</TagGroup.RemoveButton></TagGroup.TagCell>
    </TagGroup.Tag>
</template>
