<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/number-field";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Label } from "../../kit/ui/label.ts";
import { NumberField } from "../../kit/ui/number-field.ts";
import { useNumberOutput } from "./use-number-output.ts";

// spec/number-field.md, `/number-field/commit`
const output = useNumberOutput();
const { values } = output;
const commit = ref<{ value: string; reason: string; count: number }>();
const onValueCommitted = (value: number | null, details: ChangeDetails) => {
    commit.value = {
        value: value === null ? "null" : String(value),
        reason: details.reason,
        count: (commit.value?.count ?? 0) + 1,
    };
};
</script>

<template>
    <form class="flex flex-col items-start gap-2">
        <Label for="amount">Amount</Label>
        <NumberField.Root
            id="amount"
            name="amount"
            :default-value="50"
            :min="0"
            :max="100"
            locale="en-US"
            @value-change="output.onValueChange"
            @value-committed="onValueCommitted"
        >
            <NumberField.Group>
                <NumberField.Decrement aria-label="Decrease" />
                <NumberField.Input />
                <NumberField.Increment aria-label="Increase" />
            </NumberField.Group>
        </NumberField.Root>
        <button type="reset">Reset</button>
    </form>
    <Output
        :values="{
            ...values,
            committed: commit?.value,
            commitReason: commit?.reason,
            commits: commit?.count ?? 0,
        }"
    />
</template>
