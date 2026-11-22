<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Button } from "../../kit/ui/button.ts";

const pressed = ref<string>();
const count = ref(0);
const press = (name: string) => {
    pressed.value = name;
    count.value += 1;
};
</script>

<template>
    <div class="flex flex-wrap items-center gap-2">
        <Button @click="press('Save')">Save</Button>
        <Button disabled @click="press('Delete')">Delete</Button>
        <Button disabled focusable-when-disabled @click="press('Publishing')">Publishing</Button>
        <Button :native-button="false" as="span" @click="press('Archive')">Archive</Button>
        <Button :native-button="false" as="span" disabled @click="press('Locked')">Locked</Button>
    </div>
    <Output :values="{ pressed, count }" />
</template>
