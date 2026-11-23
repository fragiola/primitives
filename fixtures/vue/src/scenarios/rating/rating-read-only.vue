<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Rating } from "../../kit/ui/rating.ts";
import RatingStars from "./rating-stars.vue";

// A read-only and a disabled rating (spec/rating.md, `/rating/read-only`).
const value = ref<number>();
const onValue = (next: number) => {
    value.value = next;
};
</script>

<template>
    <div class="flex flex-col items-start gap-2">
        <h2 id="quality" class="text-sm font-semibold">Quality</h2>
        <Rating.Root v-slot="{ items, value: current }" aria-labelledby="quality" read-only :default-value="3" @value-change="onValue">
            <RatingStars :items="items" :value="current" />
        </Rating.Root>
        <h2 id="service" class="text-sm font-semibold">Service</h2>
        <Rating.Root v-slot="{ items, value: current }" aria-labelledby="service" disabled :default-value="2" @value-change="onValue">
            <RatingStars :items="items" :value="current" />
        </Rating.Root>
    </div>
    <button type="button" class="mt-2">After</button>
    <Output :values="{ value }" />
</template>
