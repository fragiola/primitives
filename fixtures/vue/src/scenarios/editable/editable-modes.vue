<script setup lang="ts">
import { computed, ref } from "vue";
import Output from "../../kit/output.vue";
import EditableMode from "./editable-mode.vue";

// Every activation and submit mode (spec/editable.md, `/editable/modes`).
const printed = ref<Record<string, string | undefined>>({});
const print = (key: string, text: string) => {
    printed.value = { ...printed.value, [key]: text };
};
const values = computed(() =>
    Object.fromEntries(
        ["Name", "Role", "Team", "Notes"]
            .flatMap((label) => [
                `${label} value`,
                `${label} commit`,
                `${label} revert`,
            ])
            .map((key) => [key, printed.value[key]]),
    ),
);
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <EditableMode label="Name" default-value="Ana" activation-mode="dblclick" submit-mode="enter" @print="print" />
        <EditableMode label="Role" default-value="Designer" activation-mode="click" submit-mode="blur" @print="print" />
        <EditableMode label="Team" default-value="Core" activation-mode="none" submit-mode="none" trigger="team" @print="print" />
        <EditableMode label="Notes" default-value="First line" textarea @print="print" />
        <button type="button">After</button>
    </div>
    <Output :values="values" />
</template>
