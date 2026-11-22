<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { Radio, RadioGroup } from "../../kit/ui/radio-group.ts";
import { Switch } from "../../kit/ui/switch.ts";

const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <Field.Root name="contact">
            <Field.Label>Contact by</Field.Label>
            <RadioGroup required>
                <label class="flex items-center gap-2 text-sm"><Radio.Root value="email" />Email</label>
                <label class="flex items-center gap-2 text-sm"><Radio.Root value="phone" />Phone</label>
            </RadioGroup>
            <Field.Description>How we reach you.</Field.Description>
            <Field.Error>Choose how we reach you.</Field.Error>
        </Field.Root>
        <Field.Root name="alerts">
            <div class="flex items-center gap-2">
                <Switch.Root unchecked-value="off" />
                <Field.Label>Email alerts</Field.Label>
            </div>
            <Field.Description>A weekly digest.</Field.Description>
        </Field.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ form }" />
</template>
