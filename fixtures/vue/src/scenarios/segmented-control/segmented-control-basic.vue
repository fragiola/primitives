<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { SegmentedControl } from "../../kit/ui/segmented-control.ts";
import Segments from "./segments.vue";
import { VIEWS } from "./views.ts";

// A view switcher in a form (spec/segmented-control.md, `/segmented-control/basic`).
const value = ref<string | null>();
const reason = ref<string>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValue = (next: string | null, details: { reason: string }) => {
    value.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <h2 id="view" class="text-sm font-semibold">View</h2>
        <SegmentedControl.Root aria-labelledby="view" name="view" default-value="list" @value-change="onValue">
            <Segments :segments="VIEWS" />
            <SegmentedControl.Indicator render-before-hydration />
        </SegmentedControl.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ value, reason, form }" />
</template>
