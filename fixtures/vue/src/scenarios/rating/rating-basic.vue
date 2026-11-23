<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Rating } from "../../kit/ui/rating.ts";
import RatingStars from "./rating-stars.vue";

// A rating in a form (spec/rating.md, `/rating/basic`).
const value = ref<number>();
const reason = ref<string>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValue = (next: number, details: { reason: string }) => {
    value.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <h2 id="rating" class="text-sm font-semibold">Rating</h2>
        <Rating.Root v-slot="{ items, value: current }" aria-labelledby="rating" name="rating" @value-change="onValue">
            <RatingStars :items="items" :value="current" />
            <Rating.HiddenInput />
        </Rating.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ value, reason, form }" />
</template>
