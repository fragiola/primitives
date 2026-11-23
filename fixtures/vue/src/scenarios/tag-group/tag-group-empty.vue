<script setup lang="ts">
import { TagGroup } from "../../kit/ui/tag-group.ts";

// A group with no tag (spec/tag-group.md, `/tag-group/empty`). The page's `locale` is no
// attribute of its one root element.
defineProps<{ locale?: string }>();
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <TagGroup.Root>
            <TagGroup.Label>Categories</TagGroup.Label>
            <TagGroup.List />
            <p class="text-xs">No categories.</p>
        </TagGroup.Root>
        <button type="button">After</button>
    </div>
</template>
