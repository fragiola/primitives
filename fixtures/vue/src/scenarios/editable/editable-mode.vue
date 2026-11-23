<script setup lang="ts">
import type {
    ChangeDetails,
    EditableActivationMode,
    EditableSubmitMode,
} from "@fragiola/primitives-vue/editable";
import { Editable } from "../../kit/ui/editable.ts";
import { Field } from "../../kit/ui/field.ts";
import { printEnd, printText } from "./editable-output.ts";

// One Root of `/editable/modes`, printing its value, commit and revert under its label.
const props = defineProps<{
    label: string;
    defaultValue: string;
    activationMode?: EditableActivationMode;
    submitMode?: EditableSubmitMode;
    textarea?: boolean;
    trigger?: string;
}>();
const emit = defineEmits<{ print: [key: string, text: string] }>();
const onValue = (next: string) =>
    emit("print", `${props.label} value`, printText(next));
const onCommit = (next: string, details: ChangeDetails) =>
    emit("print", `${props.label} commit`, printEnd(next, details));
const onRevert = (next: string, details: ChangeDetails) =>
    emit("print", `${props.label} revert`, printEnd(next, details));
</script>

<template>
    <Field.Root>
        <Field.Label>{{ label }}</Field.Label>
        <Editable.Root
            :default-value="defaultValue"
            :activation-mode="activationMode ?? 'focus'"
            :submit-mode="submitMode ?? 'both'"
            @value-change="onValue"
            @value-commit="onCommit"
            @value-revert="onRevert"
        >
            <Editable.Area>
                <Editable.Preview />
                <Editable.Input v-if="textarea" as="textarea" />
                <Editable.Input v-else />
            </Editable.Area>
            <template v-if="trigger !== undefined">
                <Editable.EditTrigger :aria-label="`Edit ${trigger}`" />
                <Editable.SubmitTrigger :aria-label="`Save ${trigger}`" />
            </template>
        </Editable.Root>
    </Field.Root>
</template>
