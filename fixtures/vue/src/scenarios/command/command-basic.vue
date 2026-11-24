<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Command } from "../../kit/ui/command.ts";
import CommandItems from "./command-items.vue";

// spec/command.md, `/command/basic`
const ran = ref<string>();
const search = ref("");
</script>

<template>
    <div class="flex flex-col items-start gap-2">
        <Command.Root v-model:input-value="search">
            <Command.Input aria-label="Command" />
            <Command.Empty>No results.</Command.Empty>
            <Command.List>
                <CommandItems @run="(value: string) => (ran = value)" />
            </Command.List>
        </Command.Root>
        <button type="button">After</button>
    </div>
    <Output :values="{ ran, search }" />
</template>
