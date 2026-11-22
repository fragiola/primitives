<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Switch } from "../../kit/ui/switch.ts";

const wifi = ref<boolean>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onWifi = (checked: boolean) => {
    wifi.value = checked;
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <label class="flex items-center gap-2 text-sm"><Switch.Root name="wifi" default-checked @checked-change="onWifi" />Wi-Fi</label>
        <label class="flex items-center gap-2 text-sm"><Switch.Root name="bluetooth" value="yes" unchecked-value="no" />Bluetooth</label>
        <label class="flex items-center gap-2 text-sm"><Switch.Root name="terms" required />Accept terms</label>
        <label class="flex items-center gap-2 text-sm"><Switch.Root name="location" default-checked read-only />Location</label>
        <label class="flex items-center gap-2 text-sm"><Switch.Root disabled />Airplane mode</label>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ wifi, form }" />
</template>
