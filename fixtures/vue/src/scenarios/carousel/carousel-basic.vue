<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/carousel";
import { carousel } from "examples-shared/recipes/carousel";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { TextRuns } from "../../kit/text-runs.ts";
import { Carousel } from "../../kit/ui/carousel.ts";

// spec/carousel.md, `/carousel/basic`
const SLIDES = [1, 2, 3, 4];
const page = ref<number>();
const reason = ref<string>();
const onPageChange = (next: number, details: ChangeDetails) => {
    page.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <Carousel.Root aria-label="Featured" :slide-count="SLIDES.length" @page-change="onPageChange">
        <Carousel.ItemGroup>
            <Carousel.Item v-for="(slide, index) in SLIDES" :key="slide" :index="index" :aria-label="`${slide} of ${SLIDES.length}`">
                <div :class="carousel.slide"><TextRuns :runs="['Slide ', String(slide)]" /></div>
            </Carousel.Item>
        </Carousel.ItemGroup>
        <div :class="carousel.controls">
            <Carousel.PrevTrigger aria-label="Previous slide">‹</Carousel.PrevTrigger>
            <Carousel.IndicatorGroup aria-label="Choose slide to display">
                <Carousel.Indicator v-for="(slide, index) in SLIDES" :key="slide" :index="index" :aria-label="`Slide ${slide}`" />
            </Carousel.IndicatorGroup>
            <Carousel.NextTrigger aria-label="Next slide">›</Carousel.NextTrigger>
        </div>
    </Carousel.Root>
    <Output :values="{ page, reason }" />
</template>
