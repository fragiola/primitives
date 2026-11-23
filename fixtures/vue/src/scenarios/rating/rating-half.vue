<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Rating } from "../../kit/ui/rating.ts";
import RatingStars from "./rating-stars.vue";

// A controlled rating in half steps that clears (spec/rating.md, `/rating/half`).
const value = ref(2.5);
const reason = ref<string>();
const onValue = (next: number, details: { reason: string }) => {
    value.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <h2 id="half-rating" class="text-sm font-semibold">Half rating</h2>
    <Rating.Root v-slot="{ items }" aria-labelledby="half-rating" allow-half allow-clear :value="value" @value-change="onValue">
        <RatingStars :items="items" :value="value" />
    </Rating.Root>
    <Output :values="{ value, reason }" />
</template>
