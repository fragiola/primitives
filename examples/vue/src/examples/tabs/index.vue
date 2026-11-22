<script setup lang="ts">
import { Tabs } from "@fragiola/primitives-vue/tabs";
import { styles } from "./styles.ts";

const SECTIONS = [
    {
        value: "account",
        label: "Account",
        text: "Your name, your email address and the language of the interface.",
        disabled: false,
    },
    {
        value: "password",
        label: "Password",
        text: "Change your password and see where you are signed in.",
        disabled: false,
    },
    {
        value: "notifications",
        label: "Notifications",
        text: "Choose which events send you an email.",
        disabled: false,
    },
    {
        value: "billing",
        label: "Billing",
        text: "Billing is managed by your organization.",
        disabled: true,
    },
];

// Settings in tabs: the arrow keys move between tabs and select (automatic activation), Home and
// End jump, a disabled tab stays focusable but is never selected, and the indicator follows. The
// panels stack in one grid cell and slide in and out from the side the selection moved to
// (`data-activation-direction`, `data-starting-style`, `data-ending-style`).
</script>

<template>
    <Tabs.Root default-value="account" :class="styles.root">
        <Tabs.List aria-label="Account settings" :class="styles.list">
            <Tabs.Tab
                v-for="section in SECTIONS"
                :key="section.value"
                :value="section.value"
                :disabled="section.disabled"
                :class="styles.tab"
            >
                {{ section.label }}
            </Tabs.Tab>
            <Tabs.Indicator :class="styles.indicator" />
        </Tabs.List>
        <div :class="styles.panels">
            <Tabs.Panel
                v-for="section in SECTIONS"
                :key="section.value"
                :value="section.value"
                :class="styles.panel"
            >
                <h3 :class="styles.heading">{{ section.label }}</h3>
                <p :class="styles.text">{{ section.text }}</p>
            </Tabs.Panel>
        </div>
    </Tabs.Root>
</template>
