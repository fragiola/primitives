<script setup lang="ts">
import { Clipboard } from "@fragiola/primitives-vue/clipboard";
import { styles } from "./styles.ts";

const COMMAND = "pnpm add @fragiola/primitives-react";

// A code block with a copy button (spec/clipboard.md): a press writes the command to the
// clipboard, the icon turns into a check for two seconds, and a polite live region says the app's
// "Copied" text to a screen reader.
</script>

<template>
    <Clipboard.Root
        :value="COMMAND"
        :timeout="2000"
        announcement="Copied"
        failed-announcement="Copy failed"
        :class="styles.block"
    >
        <pre :class="styles.code"><code>{{ COMMAND }}</code></pre>
        <Clipboard.Trigger aria-label="Copy command" :class="styles.trigger">
            <Clipboard.Indicator :class="styles.indicator">
                <svg
                    :class="styles.copy"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                >
                    <rect x="8" y="8" width="12" height="12" rx="2" />
                    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                </svg>
                <svg
                    :class="styles.check"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                >
                    <path d="M5 12l5 5L20 7" />
                </svg>
                <svg
                    :class="styles.failed"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                >
                    <path d="M6 6l12 12M18 6L6 18" />
                </svg>
            </Clipboard.Indicator>
        </Clipboard.Trigger>
    </Clipboard.Root>
</template>
