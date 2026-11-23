<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Toggle } from "../../kit/ui/toggle.ts";

// spec/toggle.md, `/toggle/controlled`: while "Locked" is checked, the fixture refuses every change.
const pressed = ref(true);
const requested = ref<boolean>();
const locked = ref(false);
const onPressed = (next: boolean) => {
    requested.value = next;
    if (!locked.value) {
        pressed.value = next;
    }
};
</script>

<template>
    <div class="flex flex-wrap items-center gap-4">
        <Toggle :pressed="pressed" @pressed-change="onPressed">Mute</Toggle>
        <label class="flex items-center gap-2 text-sm"><input v-model="locked" type="checkbox" />Locked</label>
    </div>
    <Output :values="{ pressed, requested }" />
</template>
