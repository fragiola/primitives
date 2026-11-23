<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { DateRangeField } from "../../kit/ui/date-field.ts";
import RangeEnds from "../../kit/ui/range-ends.vue";

// spec/date-range-field.md, `/date-range-field/form`
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const stay = {
    start: { year: 2026, month: 11, day: 20 },
    end: { year: 2026, month: 11, day: 22 },
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <DateRangeField.Root locale="en-US" start-name="checkin" end-name="checkout" required :min="{ year: 2026, month: 11, day: 20 }">
            <RangeEnds start="Check-in" end="Check-out" />
        </DateRangeField.Root>
        <DateRangeField.Root locale="en-US" start-name="from" end-name="to" read-only :default-value="stay">
            <RangeEnds start="From" end="To" />
        </DateRangeField.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ form }" />
</template>
