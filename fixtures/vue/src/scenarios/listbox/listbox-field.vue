<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { Listbox } from "../../kit/ui/listbox.ts";
import ListboxOptions from "./listbox-options.vue";
import { FRUITS, TOPPINGS } from "./options.ts";

// A required list in a Field, and a multiple one in the same form (spec/listbox.md).
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <Field.Root name="fruit">
            <Field.Label>Fruit</Field.Label>
            <Listbox.Root required>
                <ListboxOptions :options="FRUITS" />
            </Listbox.Root>
            <Field.Description>Pick one.</Field.Description>
            <Field.Error>Choose a fruit.</Field.Error>
        </Field.Root>
        <div class="flex flex-col items-start gap-2">
            <h2 id="toppings" class="text-sm font-semibold">Toppings</h2>
            <Listbox.Root aria-labelledby="toppings" multiple name="toppings" :default-value="['cheese']">
                <ListboxOptions :options="TOPPINGS" />
            </Listbox.Root>
        </div>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ form }" />
</template>
