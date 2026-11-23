<script setup lang="ts">
import { Rating } from "../../kit/ui/rating.ts";
import { starName } from "./star-name.ts";

// The stars of a Root, from its default scoped slot's items.
defineProps<{ items: number[]; value: number }>();
</script>

<template>
    <Rating.Item v-for="index in items" :key="index" :index="index" :aria-label="starName(index, value)" />
</template>
