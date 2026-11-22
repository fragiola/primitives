<script setup lang="ts">
import { useDirection } from "@fragiola/primitives-vue/direction";
import Output from "../../kit/output.vue";

// What `useDirection()` reads inside the provider.
const direction = useDirection();
</script>

<template>
    <Output :values="{ direction }" />
</template>
