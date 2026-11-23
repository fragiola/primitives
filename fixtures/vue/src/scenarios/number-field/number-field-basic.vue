<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Label } from "../../kit/ui/label.ts";
import { NumberField } from "../../kit/ui/number-field.ts";
import { useNumberOutput } from "./use-number-output.ts";

// spec/number-field.md, `/number-field/basic`
const output = useNumberOutput();
const { values } = output;
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <Label for="quantity">Quantity</Label>
        <NumberField.Root
            id="quantity"
            name="quantity"
            :default-value="1"
            :min="1"
            :max="10"
            :large-step="5"
            locale="en-US"
            @value-change="output.onValueChange"
        >
            <NumberField.Group>
                <NumberField.Decrement aria-label="Decrease" />
                <NumberField.Input />
                <NumberField.Increment aria-label="Increase" />
            </NumberField.Group>
        </NumberField.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ ...values, form }" />
</template>
