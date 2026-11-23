<script setup lang="ts">
import { Rating } from "@fragiola/primitives-vue/rating";
import { h, ref } from "vue";
import { styles } from "./styles.ts";

const AVERAGE = 4.5;

const STAR =
    "M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.5l7.1-.6z";

/** A star's name: "1 star", "2 stars", ...; the star that holds a half value is named by it. */
function starName(index: number, value: number) {
    if (Math.ceil(value) === index && value !== index) return `${value} stars`;
    return index === 1 ? "1 star" : `${index} stars`;
}

/** The mark: an outlined star, and a filled one over it that the recipe shows by the state. */
const mark = () =>
    h(
        "svg",
        { class: styles.star, viewBox: "0 0 24 24", "aria-hidden": "true" },
        [h("path", { d: STAR })],
    );
const Star = () => [
    mark(),
    h("span", { class: styles.fill, "aria-hidden": "true" }, [mark()]),
];

// A product rating (spec/rating.md): the reviews' average, read-only and in half steps (focusable,
// nothing changes it), and the reader's own score. The pointer previews a score, a press or an
// arrow chooses it, Home and End reach the ends, and pressing the chosen star again clears it.
const score = ref(0);
</script>

<template>
    <div :class="styles.stack">
        <div :class="styles.row">
            <span id="average-label" :class="styles.label">Average rating</span>
            <Rating.Root v-slot="{ items }" aria-labelledby="average-label" read-only allow-half :default-value="AVERAGE" :class="styles.root">
                <Rating.Item v-for="index in items" :key="index" :index="index" :aria-label="starName(index, AVERAGE)" :class="styles.item"><Star /></Rating.Item>
            </Rating.Root>
            <span :class="styles.note">From 128 reviews.</span>
        </div>
        <div :class="styles.row">
            <span id="score-label" :class="styles.label">Your rating</span>
            <Rating.Root v-slot="{ items }" v-model:value="score" aria-labelledby="score-label" allow-clear :class="styles.root">
                <Rating.Item v-for="index in items" :key="index" :index="index" :aria-label="starName(index, score)" :class="styles.item"><Star /></Rating.Item>
            </Rating.Root>
            <p role="status" :class="styles.note">{{ score === 0 ? "Not rated yet." : `You rated it ${starName(score, score)}.` }}</p>
        </div>
    </div>
</template>
