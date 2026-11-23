<script setup lang="ts">
import { TagsInput } from "../../kit/ui/tags-input.ts";

// The scenarios' Tags: a TagText, a TagRemove "Remove <tag>" and, when editable, a TagInput.
withDefaults(defineProps<{ value: readonly string[]; editable?: boolean }>(), {
    editable: false,
});
</script>

<template>
    <TagsInput.Tag v-for="(tag, index) in value" :key="index" :index="index">
        <TagsInput.TagText>{{ tag }}</TagsInput.TagText>
        <TagsInput.TagInput v-if="editable" aria-label="Edit tag" />
        <TagsInput.TagRemove :aria-label="`Remove ${tag}`">×</TagsInput.TagRemove>
    </TagsInput.Tag>
</template>
