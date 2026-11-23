<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { Rating } from "../../kit/ui/rating.ts";
import RatingStars from "./rating-stars.vue";

// A required rating in a Field (spec/rating.md, `/rating/field`).
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <Field.Root>
            <Field.Label>Satisfaction</Field.Label>
            <Rating.Root v-slot="{ items, value }" required name="satisfaction">
                <RatingStars :items="items" :value="value" />
                <Rating.HiddenInput />
            </Rating.Root>
            <Field.Description>How was your stay?</Field.Description>
            <Field.Error>Choose a rating.</Field.Error>
        </Field.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ form }" />
</template>
