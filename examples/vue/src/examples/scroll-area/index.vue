<script setup lang="ts">
import { ScrollArea } from "@fragiola/primitives-vue/scroll-area";
import { styles } from "./styles.ts";

const CHANNELS = Array.from(
    { length: 40 },
    (_, index) => `channel-${index + 1}`,
);

// A sidebar of channel links in a ScrollArea (spec/scroll-area.md): the list scrolls natively,
// the custom scrollbar follows it; a link takes the focus, so the viewport takes no tab stop.
</script>

<template>
    <nav aria-label="Channels" :class="styles.sidebar">
        <ScrollArea.Root :class="styles.root">
            <ScrollArea.Viewport :class="styles.viewport">
                <ScrollArea.Content :class="styles.content">
                    <a v-for="channel in CHANNELS" :key="channel" :href="`#${channel}`" :class="styles.link"># {{ channel }}</a>
                </ScrollArea.Content>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar :class="styles.scrollbar">
                <ScrollArea.Thumb :class="styles.thumb" />
            </ScrollArea.Scrollbar>
        </ScrollArea.Root>
    </nav>
</template>
