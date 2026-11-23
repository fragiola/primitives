<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { PasswordInput } from "../../kit/ui/password-input.ts";

// A disabled and a read-only PasswordInput (spec/password-input.md, `/password-input/states`).
const visible = ref<boolean>();
const onVisible = (next: boolean) => {
    visible.value = next;
};
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <label for="pin" class="text-sm font-medium">PIN</label>
        <PasswordInput.Root id="pin" disabled default-value="1234" @visible-change="onVisible">
            <PasswordInput.Input />
            <PasswordInput.VisibilityTrigger aria-label="Show PIN" />
        </PasswordInput.Root>
        <label for="recovery" class="text-sm font-medium">Recovery key</label>
        <PasswordInput.Root id="recovery" read-only default-visible default-value="abcd-efgh" @visible-change="onVisible">
            <PasswordInput.Input />
            <PasswordInput.VisibilityTrigger aria-label="Show recovery key" />
        </PasswordInput.Root>
    </div>
    <Output :values="{ visible }" />
</template>
