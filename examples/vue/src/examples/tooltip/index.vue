<script setup lang="ts">
import { Tooltip } from "@fragiola/primitives-vue/tooltip";
import { styles } from "./styles.ts";

const TOOLS = [
    { label: "Bold", hint: "Bold (Ctrl+B)" },
    { label: "Italic", hint: "Italic (Ctrl+I)" },
    { label: "Underline", hint: "Underline (Ctrl+U)" },
];

// A row of toolbar buttons described by tooltips: the first one waits for the
// delay, moving to the next opens it at once, keyboard focus opens it with no delay and Escape
// closes it.
</script>

<template>
    <Tooltip.Provider :delay="500">
        <div :class="styles.toolbar">
            <Tooltip.Root v-for="tool in TOOLS" :key="tool.label">
                <Tooltip.Trigger :class="styles.trigger">{{ tool.label }}</Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Positioner :side-offset="8" :class="styles.positioner">
                        <Tooltip.Popup :class="styles.popup">
                            <Tooltip.Arrow :class="styles.arrow" />
                            {{ tool.hint }}
                        </Tooltip.Popup>
                    </Tooltip.Positioner>
                </Tooltip.Portal>
            </Tooltip.Root>
        </div>
    </Tooltip.Provider>
</template>
