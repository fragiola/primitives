<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/command";
import { computed, ref } from "vue";
import Output from "../../kit/output.vue";
import { Command } from "../../kit/ui/command.ts";

// spec/command.md, `/command/pages`
const pages = ref<string[]>([]);
const ran = ref<string>();
const reason = ref<string>();
const page = computed(() => pages.value[pages.value.length - 1]);
const push = (next: string) => {
    pages.value = [...pages.value, next];
};
const onPagesChange = (next: string[], details: ChangeDetails) => {
    pages.value = next;
    reason.value = details.reason;
};
const run = (value: string) => {
    ran.value = value;
};
</script>

<template>
    <Command.Root :pages="pages" @pages-change="onPagesChange">
        <Command.Input aria-label="Command" />
        <Command.Empty>No results.</Command.Empty>
        <Command.List>
            <template v-if="page === undefined">
                <Command.Item value="Search projects…" @select="push('projects')">Search projects…</Command.Item>
                <Command.Item value="Change theme…" @select="push('theme')">Change theme…</Command.Item>
            </template>
            <template v-if="page === 'projects'">
                <Command.Item v-for="project in ['Primitives', 'Tree', 'Splitter']" :key="project" :value="project" @select="run">{{ project }}</Command.Item>
            </template>
            <template v-if="page === 'theme'">
                <Command.Item v-for="theme in ['Light', 'Dark']" :key="theme" :value="theme" @select="run">{{ theme }}</Command.Item>
            </template>
        </Command.List>
    </Command.Root>
    <Output :values="{ pages: pages.join('/'), ran, reason }" />
</template>
