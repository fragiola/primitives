<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/carousel";
import { carousel } from "examples-shared/recipes/carousel";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { TextRuns } from "../../kit/text-runs.ts";
import { Carousel } from "../../kit/ui/carousel.ts";

// spec/carousel.md, `/carousel/vertical`
const SLIDES = [1, 2, 3];
const page = ref<number>();
const reason = ref<string>();
const onPageChange = (next: number, details: ChangeDetails) => {
    page.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <Carousel.Root aria-label="Stories" orientation="vertical" :slide-count="SLIDES.length" loop @page-change="onPageChange">
        <Carousel.ItemGroup :class="carousel.vertical">
            <Carousel.Item v-for="(slide, index) in SLIDES" :key="slide" :index="index" :aria-label="`${slide} of ${SLIDES.length}`">
                <div :class="carousel.verticalSlide"><TextRuns :runs="['Slide ', String(slide)]" /></div>
            </Carousel.Item>
        </Carousel.ItemGroup>
        <div :class="carousel.controls">
            <Carousel.PrevTrigger aria-label="Previous slide">‹</Carousel.PrevTrigger>
            <Carousel.NextTrigger aria-label="Next slide">›</Carousel.NextTrigger>
        </div>
    </Carousel.Root>
    <Output :values="{ page, reason }" />
</template>
