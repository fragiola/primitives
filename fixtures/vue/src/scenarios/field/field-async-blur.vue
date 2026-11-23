<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { checkUsernameSlowly } from "./validators.ts";

// spec/field.md, `/field/async-blur`: a change hides the error an earlier run showed, at once.
const resolved = ref<string>();
const validate = (value: unknown) =>
    checkUsernameSlowly(value, (text) => {
        resolved.value = text;
    });
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <Field.Root name="username" validation-mode="onBlur" :validate="validate">
            <Field.Label>Username</Field.Label>
            <Field.Control />
            <Field.Error />
        </Field.Root>
        <button type="button">After</button>
    </div>
    <Output :values="{ resolved }" />
</template>
