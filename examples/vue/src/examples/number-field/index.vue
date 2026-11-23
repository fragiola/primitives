<script setup lang="ts">
import { Label } from "@fragiola/primitives-vue/label";
import { NumberField } from "@fragiola/primitives-vue/number-field";
import { styles } from "./styles.ts";

const PERCENT = { style: "percent" } as const;

// A cart line: a quantity from 1 to 10, stepped by its buttons (held, they repeat), the arrows,
// Page Up and Down, or typed; and a discount written as a percentage, whose label is a scrub
// area: drag it sideways to change the value (spec/number-field.md).
</script>

<template>
    <div :class="styles.stack">
        <Label for="quantity" :class="styles.label">Quantity</Label>
        <NumberField.Root id="quantity" :default-value="1" :min="1" :max="10" :class="styles.root">
            <NumberField.Group :class="styles.group">
                <NumberField.Decrement aria-label="Decrease" :class="styles.decrement">−</NumberField.Decrement>
                <NumberField.Input :class="styles.input" />
                <NumberField.Increment aria-label="Increase" :class="styles.increment">+</NumberField.Increment>
            </NumberField.Group>
        </NumberField.Root>
        <NumberField.Root
            id="discount"
            :default-value="0.1"
            :min="0"
            :max="1"
            :step="0.01"
            :format="PERCENT"
            :class="styles.root"
        >
            <NumberField.ScrubArea :class="styles.scrubArea">
                <Label for="discount" :class="styles.label">Discount</Label>
                <NumberField.ScrubAreaCursor :class="styles.scrubAreaCursor" />
            </NumberField.ScrubArea>
            <NumberField.Group :class="styles.group">
                <NumberField.Input :class="styles.input" />
            </NumberField.Group>
        </NumberField.Root>
    </div>
</template>
