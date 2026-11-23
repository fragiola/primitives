<script setup lang="ts">
import type {
    ChangeDetails,
    PlainDate,
} from "@fragiola/primitives-vue/multiple-calendar";
import { ref } from "vue";
import { iso } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import MonthView from "../../kit/ui/month-view.vue";
import { MultipleCalendar } from "../../kit/ui/multiple-calendar.ts";

// spec/calendar.md, `/multiple-calendar/basic`
const value = ref<PlainDate[]>([]);
const reason = ref<string>();
const onValueChange = (next: PlainDate[], details: ChangeDetails) => {
    value.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <MultipleCalendar.Root :value="value" :max-selected="3" locale="en-US" @value-change="onValueChange">
        <MonthView />
    </MultipleCalendar.Root>
    <Output :values="{ value: value.length > 0 ? value.map(iso).join(',') : undefined, reason }" />
</template>
