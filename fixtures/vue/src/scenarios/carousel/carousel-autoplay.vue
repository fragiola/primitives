<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/carousel";
import { carousel } from "examples-shared/recipes/carousel";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { TextRuns } from "../../kit/text-runs.ts";
import { Carousel } from "../../kit/ui/carousel.ts";

// spec/carousel.md, `/carousel/autoplay`
const SLIDES = [1, 2, 3];
const page = ref<number>();
const reason = ref<string>();
const playing = ref<boolean>();
const playingReason = ref<string>();
const onPageChange = (next: number, details: ChangeDetails) => {
    page.value = next;
    reason.value = details.reason;
};
const onPlayingChange = (next: boolean, details: ChangeDetails) => {
    playing.value = next;
    playingReason.value = details.reason;
};
</script>

<template>
    <Carousel.Root aria-label="Highlights" :slide-count="SLIDES.length" default-playing :delay="3000" @page-change="onPageChange" @playing-change="onPlayingChange">
        <div :class="carousel.controls">
            <Carousel.AutoplayTrigger v-slot="{ state }">{{ state.playing ? "Stop slide rotation" : "Start slide rotation" }}</Carousel.AutoplayTrigger>
            <Carousel.PrevTrigger aria-label="Previous slide">‹</Carousel.PrevTrigger>
            <Carousel.NextTrigger aria-label="Next slide">›</Carousel.NextTrigger>
        </div>
        <Carousel.ItemGroup>
            <Carousel.Item v-for="(slide, index) in SLIDES" :key="slide" :index="index" :aria-label="`${slide} of ${SLIDES.length}`">
                <div :class="carousel.slide"><TextRuns :runs="['Slide ', String(slide)]" /></div>
            </Carousel.Item>
        </Carousel.ItemGroup>
    </Carousel.Root>
    <Output :values="{ page, reason, playing, playingReason }" />
</template>
