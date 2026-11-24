<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Command } from "../../kit/ui/command.ts";
import CommandItems from "./command-items.vue";

// spec/command.md, `/command/filter`
const ran = ref<string>();

/** A value or keyword starting with the text, case ignored. */
function startsWith(
    value: string,
    search: string,
    keywords: readonly string[],
): number {
    const query = search.toLowerCase();
    return [value, ...keywords].some((text) =>
        text.toLowerCase().startsWith(query),
    )
        ? 1
        : 0;
}
const run = (value: string) => {
    ran.value = value;
};
</script>

<template>
    <Command.Root :filter="startsWith">
        <Command.Input aria-label="Command" />
        <Command.Empty>No results.</Command.Empty>
        <Command.List>
            <CommandItems @run="run" />
            <Command.Item value="Ask AI" force-mount @select="run">Ask AI</Command.Item>
        </Command.List>
    </Command.Root>
    <Output :values="{ ran }" />
</template>
