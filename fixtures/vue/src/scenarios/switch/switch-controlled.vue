<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Switch } from "../../kit/ui/switch.ts";

// The consumer refuses to turn the switch off: it stays on.
const checked = ref(true);
const requested = ref<boolean>();
const onChecked = (next: boolean) => {
    requested.value = next;
    if (next) {
        checked.value = true;
    }
};
</script>

<template>
    <label class="flex items-center gap-2 text-sm"><Switch.Root :checked="checked" @update:checked="onChecked" />Dark mode</label>
    <Output :values="{ checked, requested }" />
</template>
