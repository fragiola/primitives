<script setup lang="ts">
import { Listbox } from "../../kit/ui/listbox.ts";
import type { Option } from "./options.ts";

// The Items of a list of options, each with its label and indicator.
defineProps<{ options: readonly Option[] }>();
</script>

<template>
    <Listbox.Item v-for="option in options" :key="option.value" :value="option.value" :disabled="option.disabled">{{ option.label }}<Listbox.ItemIndicator>✓</Listbox.ItemIndicator></Listbox.Item>
</template>
