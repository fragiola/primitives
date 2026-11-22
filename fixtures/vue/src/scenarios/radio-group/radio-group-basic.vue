<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Radio, RadioGroup } from "../../kit/ui/radio-group.ts";
import { PLANS } from "./plans.ts";

const value = ref<string | null>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValue = (next: string | null) => {
    value.value = next;
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <h2 id="plan" class="text-sm font-semibold">Plan</h2>
        <RadioGroup aria-labelledby="plan" name="plan" required @value-change="onValue">
            <label v-for="plan in PLANS" :key="plan.value" class="flex items-center gap-2 text-sm"><Radio.Root :value="plan.value" :disabled="plan.disabled" />{{ plan.label }}</label>
        </RadioGroup>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ value, form }" />
</template>
