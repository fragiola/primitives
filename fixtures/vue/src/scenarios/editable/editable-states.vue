<script setup lang="ts">
import { Editable } from "../../kit/ui/editable.ts";
import { Field } from "../../kit/ui/field.ts";

// A placeholder, a disabled and a read-only Editable (spec/editable.md, `/editable/states`).
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <Field.Root>
            <Field.Label>Subtitle</Field.Label>
            <Editable.Root placeholder="Add a subtitle" :max-length="12">
                <Editable.Area>
                    <Editable.Preview />
                    <Editable.Input />
                </Editable.Area>
                <Editable.EditTrigger aria-label="Edit subtitle" />
            </Editable.Root>
        </Field.Root>
        <Field.Root>
            <Field.Label>Owner</Field.Label>
            <Editable.Root disabled default-value="Ana">
                <Editable.Area>
                    <Editable.Preview />
                    <Editable.Input />
                </Editable.Area>
                <Editable.EditTrigger aria-label="Edit owner" />
            </Editable.Root>
        </Field.Root>
        <Field.Root>
            <Field.Label>Created</Field.Label>
            <Editable.Root read-only default-value="2026-11-23">
                <Editable.Area>
                    <Editable.Preview />
                    <Editable.Input />
                </Editable.Area>
                <Editable.EditTrigger aria-label="Edit created" />
            </Editable.Root>
        </Field.Root>
    </div>
</template>
