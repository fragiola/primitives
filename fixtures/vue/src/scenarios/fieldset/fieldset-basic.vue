<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { Fieldset } from "../../kit/ui/fieldset.ts";

const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <Fieldset.Root>
            <Fieldset.Legend>Shipping address</Fieldset.Legend>
            <Field.Root name="street">
                <Field.Label>Street</Field.Label>
                <Field.Control />
            </Field.Root>
            <Field.Root name="city">
                <Field.Label>City</Field.Label>
                <Field.Control />
            </Field.Root>
        </Fieldset.Root>
        <Fieldset.Root disabled>
            <Fieldset.Legend>Billing address</Fieldset.Legend>
            <Field.Root name="billing-street">
                <Field.Label>Billing street</Field.Label>
                <Field.Control />
            </Field.Root>
            <Fieldset.Root>
                <Fieldset.Legend>Billing contact</Fieldset.Legend>
                <Field.Root name="phone">
                    <Field.Label>Phone</Field.Label>
                    <Field.Control />
                </Field.Root>
            </Fieldset.Root>
        </Fieldset.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ form }" />
</template>
