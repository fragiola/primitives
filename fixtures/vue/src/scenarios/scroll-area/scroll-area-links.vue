<script setup lang="ts">
import { TextRuns } from "../../kit/text-runs.ts";
import { ScrollArea } from "../../kit/ui/scroll-area.ts";

// spec/scroll-area.md, `/scroll-area/links`. Each link is two text nodes, as React's
// `Chapter {chapter}`.
const CHAPTERS = Array.from({ length: 20 }, (_, index) => index + 1);
defineProps<{ locale?: string }>();
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <div class="h-48 w-64">
            <ScrollArea.Root>
                <ScrollArea.Viewport role="region" aria-label="Chapters">
                    <ScrollArea.Content>
                        <a v-for="chapter in CHAPTERS" :key="chapter" :href="`#chapter-${chapter}`"><TextRuns :runs="['Chapter ', String(chapter)]" /></a>
                    </ScrollArea.Content>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar orientation="vertical" />
            </ScrollArea.Root>
        </div>
        <button type="button">After</button>
    </div>
</template>
