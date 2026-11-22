<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Avatar } from "../../kit/ui/avatar.ts";

const ada = ref<string>();
const missing = ref<string>();
const again = ref<string[]>([]);
const shown = ref(false);
const onAda = (status: string) => {
    ada.value = status;
};
const onMissing = (status: string) => {
    missing.value = status;
};
const onAgain = (status: string) => {
    again.value = [...again.value, status];
};
</script>

<template>
    <div class="flex items-center gap-4">
        <Avatar.Root>
            <Avatar.Image src="/avatar/ada.svg" alt="Ada Lovelace" @loading-status-change="onAda" />
            <Avatar.Fallback>AL</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root>
            <Avatar.Image src="/avatar/missing.svg" alt="Grace Hopper" @loading-status-change="onMissing" />
            <Avatar.Fallback>GH</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root>
            <Avatar.Fallback :delay="300">KJ</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root v-if="shown">
            <Avatar.Image src="/avatar/ada.svg" alt="Ada again" @loading-status-change="onAgain" />
            <Avatar.Fallback>AA</Avatar.Fallback>
        </Avatar.Root>
    </div>
    <button type="button" class="mt-4" @click="shown = true">Show again</button>
    <Output :values="{ ada, missing, again: again.length > 0 ? again.join(',') : undefined }" />
</template>
