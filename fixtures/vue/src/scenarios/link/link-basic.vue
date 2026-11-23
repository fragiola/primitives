<script setup lang="ts">
import { link } from "examples-shared/recipes/link";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Link } from "../../kit/ui/link.ts";

// spec/link.md, `/link/basic`
const clicks = ref(0);
const count = () => {
    clicks.value += 1;
};
</script>

<template>
    <div :class="link.list">
        <Link href="#home" current @click="count">Home</Link>
        <Link href="#docs" @click="count">Docs</Link>
        <Link href="#archive" disabled @click="count">Archive</Link>
    </div>
    <Output :values="{ clicks }" />
</template>
