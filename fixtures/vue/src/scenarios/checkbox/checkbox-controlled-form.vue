<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Checkbox } from "../../kit/ui/checkbox.ts";

// spec/checkbox.md, `/checkbox/controlled-form`: always checked, every change ignored (no render
// follows a refused reset).
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const ignore = () => {};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <label class="flex items-center gap-2 text-sm"><Checkbox.Root name="remember" checked @update:checked="ignore" />Remember me</label>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ form }" />
</template>
