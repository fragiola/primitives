<script setup lang="ts">
import { Command } from "../../kit/ui/command.ts";

// The items of the Command scenarios (spec/command.md, "Scenarios"): two groups and a separator.
const emit = defineEmits<{ run: [value: string] }>();
const run = (value: string) => emit("run", value);
</script>

<template>
    <Command.Group>
        <Command.GroupLabel>Suggestions</Command.GroupLabel>
        <Command.Item value="Calendar" @select="run">Calendar</Command.Item>
        <Command.Item value="Search Emoji" @select="run">Search Emoji</Command.Item>
        <Command.Item value="Calculator" disabled @select="run">Calculator</Command.Item>
    </Command.Group>
    <Command.Separator />
    <Command.Group>
        <Command.GroupLabel>Settings</Command.GroupLabel>
        <Command.Item value="Profile" :keywords="['account']" @select="run">Profile</Command.Item>
        <Command.Item value="Billing" @select="run">Billing</Command.Item>
        <Command.Item value="Archive" @select="run">Archive</Command.Item>
    </Command.Group>
</template>
