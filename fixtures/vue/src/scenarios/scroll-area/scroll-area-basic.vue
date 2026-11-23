<script setup lang="ts">
import { computed, ref } from "vue";
import { TextRuns } from "../../kit/text-runs.ts";
import { ScrollArea } from "../../kit/ui/scroll-area.ts";

// spec/scroll-area.md, `/scroll-area/basic` (and `?dir=rtl`). Each line is three text nodes, as
// React's `Release 1.{release}: ...`.
const RELEASES = Array.from({ length: 40 }, (_, index) => 40 - index);
const few = ref(false);
const wide = ref(false);
const releases = computed(() => (few.value ? RELEASES.slice(0, 3) : RELEASES));
const line = (release: number) => [
    "Release 1.",
    String(release),
    ": fixed the focus ring of nested menus and the scroll lock on touch",
];
defineProps<{ locale?: string }>();
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <div class="flex gap-2">
            <button type="button" @click="few = !few">Toggle items</button>
            <button type="button" @click="wide = !wide">Toggle width</button>
        </div>
        <div :class="wide ? 'h-48 w-[48rem]' : 'h-48 w-64'">
            <ScrollArea.Root>
                <ScrollArea.Viewport role="region" aria-label="Changelog">
                    <ScrollArea.Content>
                        <p v-for="release in releases" :key="release" class="whitespace-nowrap"><TextRuns :runs="line(release)" /></p>
                    </ScrollArea.Content>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar orientation="vertical" />
                <ScrollArea.Scrollbar orientation="horizontal" />
                <ScrollArea.Corner />
            </ScrollArea.Root>
        </div>
        <div class="h-48 w-64">
            <ScrollArea.Root>
                <ScrollArea.Viewport role="region" aria-label="Shortcuts">
                    <ScrollArea.Content>
                        <p>Ctrl+K: search</p>
                        <p>Ctrl+P: print</p>
                        <p>Ctrl+S: save</p>
                    </ScrollArea.Content>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar orientation="vertical" />
                <ScrollArea.Scrollbar orientation="horizontal" />
                <ScrollArea.Corner />
            </ScrollArea.Root>
        </div>
    </div>
</template>
