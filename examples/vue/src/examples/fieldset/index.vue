<script setup lang="ts">
import { Checkbox } from "@fragiola/primitives-vue/checkbox";
import { Field } from "@fragiola/primitives-vue/field";
import { Fieldset } from "@fragiola/primitives-vue/fieldset";
import { ref } from "vue";
import { styles } from "./styles.ts";

const same = ref(true);
const saved = ref<string | null>(null);
const onSubmit = (event: Event) => {
    const data = new FormData(event.currentTarget as HTMLFormElement);
    saved.value = [...data.entries()]
        .map(([key, value]) => `${key}=${String(value)}`)
        .join("&");
};

// A shipping and a billing address, each a fieldset named by its legend: the billing fieldset,
// and every field inside it, stays disabled while billing is the same as shipping; a disabled
// field submits nothing (spec/fieldset.md).
</script>

<template>
    <form :class="styles.form" @submit.prevent="onSubmit">
        <Fieldset.Root :class="styles.fieldset.root">
            <Fieldset.Legend :class="styles.fieldset.legend">Shipping address</Fieldset.Legend>
            <Field.Root name="street" :class="styles.field.root">
                <Field.Label :class="styles.field.label">Street</Field.Label>
                <Field.Control :class="styles.field.control" />
            </Field.Root>
            <Field.Root name="city" :class="styles.field.root">
                <Field.Label :class="styles.field.label">City</Field.Label>
                <Field.Control :class="styles.field.control" />
            </Field.Root>
        </Fieldset.Root>
        <div :class="styles.row">
            <Checkbox.Root id="same" v-model:checked="same" name="same" :class="styles.checkbox.root"><Checkbox.Indicator :class="styles.checkbox.indicator" /></Checkbox.Root>
            <label for="same">Billing same as shipping</label>
        </div>
        <Fieldset.Root :disabled="same" :class="styles.fieldset.root">
            <Fieldset.Legend :class="styles.fieldset.legend">Billing address</Fieldset.Legend>
            <Field.Root name="billing-street" :class="styles.field.root">
                <Field.Label :class="styles.field.label">Billing street</Field.Label>
                <Field.Control :class="styles.field.control" />
            </Field.Root>
            <Field.Root name="billing-city" :class="styles.field.root">
                <Field.Label :class="styles.field.label">Billing city</Field.Label>
                <Field.Control :class="styles.field.control" />
            </Field.Root>
        </Fieldset.Root>
        <button type="submit" :class="styles.submit">Save</button>
        <p role="status" :class="styles.status">{{ saved === null ? "" : `Saved: ${saved}` }}</p>
    </form>
</template>
