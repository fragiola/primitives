<script setup lang="ts">
import { Button } from "@fragiola/primitives-vue/button";
import { ref, watch } from "vue";
import { styles } from "./styles.ts";

const busy = ref(false);
const status = ref("Draft.");
watch(busy, (isBusy, _, onCleanup) => {
    if (!isBusy) {
        return;
    }
    const timer = setTimeout(() => {
        busy.value = false;
        status.value = "Published.";
    }, 1000);
    onCleanup(() => clearTimeout(timer));
});
const publish = () => {
    busy.value = true;
    status.value = "Publishing…";
};

// Publish a post: "Publish" stays focusable while it is busy (`focusable-when-disabled`), so the
// keyboard does not lose its place; "Archive" is a `span` that behaves as a button
// (`:native-button="false"`): Enter and Space press it (spec/button.md).
</script>

<template>
    <div :class="styles.stack">
        <div :class="styles.row">
            <Button :disabled="busy" focusable-when-disabled :class="styles.root" @click="publish">Publish</Button>
            <Button :native-button="false" as="span" :disabled="busy" :class="styles.root" @click="status = 'Archived.'">Archive</Button>
        </div>
        <p role="status" :class="styles.status">{{ status }}</p>
    </div>
</template>
