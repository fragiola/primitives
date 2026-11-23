<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { TimeField } from "../../kit/ui/date-field.ts";

// spec/date-field.md, `/time-field/form`
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <TimeField.Root locale="en-US" name="alarm" required :hour-cycle="24">
            <TimeField.Input aria-label="Alarm" />
        </TimeField.Root>
        <TimeField.Root locale="en-US" name="start" read-only :default-value="{ hour: 8, minute: 0, second: 0, millisecond: 0 }">
            <TimeField.Input aria-label="Start" />
        </TimeField.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ form }" />
</template>
