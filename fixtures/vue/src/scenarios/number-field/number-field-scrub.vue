<script setup lang="ts">
import Output from "../../kit/output.vue";
import { Label } from "../../kit/ui/label.ts";
import { NumberField } from "../../kit/ui/number-field.ts";
import { useNumberOutput } from "./use-number-output.ts";

// spec/number-field.md, `/number-field/scrub`
const output = useNumberOutput();
const { values } = output;
</script>

<template>
    <NumberField.Root
        id="width"
        :default-value="100"
        allow-wheel-scrub
        locale="en-US"
        @value-change="output.onValueChange"
    >
        <NumberField.ScrubArea data-testid="scrub">
            <Label for="width">Width</Label>
            <NumberField.ScrubAreaCursor />
        </NumberField.ScrubArea>
        <NumberField.Group>
            <NumberField.Input />
        </NumberField.Group>
    </NumberField.Root>
    <Output :values="values" />
</template>
