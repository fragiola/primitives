<script setup lang="ts">
import type { PlainDate } from "@fragiola/primitives-vue/multiple-calendar";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import MonthView from "../../kit/ui/month-view.vue";
import { MultipleCalendar } from "../../kit/ui/multiple-calendar.ts";

// spec/calendar.md, `/multiple-calendar/form`
const NOV_20: PlainDate[] = [{ year: 2026, month: 11, day: 20 }];
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <MultipleCalendar.Root name="days" :default-value="NOV_20" locale="en-US">
            <MonthView />
        </MultipleCalendar.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ form }" />
</template>
