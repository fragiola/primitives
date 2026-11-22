<script setup lang="ts">
import { Button } from "@fragiola/primitives-vue/button";
import { Field } from "@fragiola/primitives-vue/field";
import { Form } from "@fragiola/primitives-vue/form";
import { Radio } from "@fragiola/primitives-vue/radio";
import { RadioGroup } from "@fragiola/primitives-vue/radio-group";
import { Switch } from "@fragiola/primitives-vue/switch";
import { ref } from "vue";
import { styles } from "./styles.ts";

const CHANNELS = [
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "post", label: "Post" },
];
const status = ref("");
const onSubmit = (event: Event) => {
    const data = new FormData(event.currentTarget as HTMLFormElement);
    status.value = `Saved: ${String(data.get("contact"))}, alerts ${String(data.get("alerts"))}.`;
};

// Contact settings: a Form with a required RadioGroup and a Switch, each in a Field. The arrows
// move through the radios, Space toggles the switch; saving with no channel chosen focuses the
// first radio and shows the field's error (spec/radio-group.md, spec/switch.md, spec/field.md).
</script>

<template>
    <Form aria-label="Contact settings" :class="styles.form" @submit.prevent="onSubmit">
        <Field.Root name="contact" :class="styles.field.root">
            <Field.Label :class="styles.field.label">Contact by</Field.Label>
            <RadioGroup required :class="styles.group">
                <div v-for="channel in CHANNELS" :key="channel.value" :class="styles.row">
                    <Radio.Root :id="channel.value" :value="channel.value" :class="styles.radio.root"><Radio.Indicator :class="styles.radio.indicator" /></Radio.Root>
                    <label :for="channel.value">{{ channel.label }}</label>
                </div>
            </RadioGroup>
            <Field.Description :class="styles.field.description">How we reach you.</Field.Description>
            <Field.Error match="valueMissing" :class="styles.field.error">Choose how we reach you.</Field.Error>
        </Field.Root>
        <Field.Root name="alerts" :class="styles.field.root">
            <div :class="styles.row">
                <Switch.Root unchecked-value="off" :class="styles.switch.root"><Switch.Thumb :class="styles.switch.thumb" /></Switch.Root>
                <Field.Label :class="styles.field.label">Email alerts</Field.Label>
            </div>
            <Field.Description :class="styles.field.description">A weekly digest.</Field.Description>
        </Field.Root>
        <Button type="submit" :class="styles.submit">Save</Button>
        <p role="status" :class="styles.status">{{ status }}</p>
    </Form>
</template>
