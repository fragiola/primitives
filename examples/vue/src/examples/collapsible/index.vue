<script setup lang="ts">
import { Collapsible } from "@fragiola/primitives-vue/collapsible";
import { styles } from "./styles.ts";

const SECTIONS = [
    {
        label: "Workspace",
        links: ["Overview", "Members", "Billing"],
        defaultOpen: true,
    },
    {
        label: "Projects",
        links: ["Website", "Mobile app", "Design system"],
        defaultOpen: false,
    },
    {
        label: "Archived",
        links: ["Old landing page", "2025 campaign"],
        defaultOpen: false,
    },
];
const anchor = (link: string) => `#${link.toLowerCase().replaceAll(" ", "-")}`;

// A settings sidebar: each section's button shows and hides its links, and the panels' height
// animates from their size variable. The closed panels are hidden until found, so the browser's
// find-in-page opens the section that holds a match (spec/collapsible.md).
</script>

<template>
    <nav aria-label="Settings" :class="styles.sidebar">
        <Collapsible.Root
            v-for="section in SECTIONS"
            :key="section.label"
            :default-open="section.defaultOpen"
            :class="styles.root"
        >
            <Collapsible.Trigger :class="styles.trigger">{{ section.label }}</Collapsible.Trigger>
            <Collapsible.Panel hidden-until-found :class="styles.panel">
                <ul :class="styles.list">
                    <li v-for="link in section.links" :key="link">
                        <a :href="anchor(link)" :class="styles.link">{{ link }}</a>
                    </li>
                </ul>
            </Collapsible.Panel>
        </Collapsible.Root>
    </nav>
</template>
