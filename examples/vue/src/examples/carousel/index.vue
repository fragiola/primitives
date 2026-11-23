<script setup lang="ts">
import { Carousel } from "@fragiola/primitives-vue/carousel";
import { styles } from "./styles.ts";

const PHOTOS = [
    {
        city: "Lisbon",
        alt: "A yellow tram climbing a street in Lisbon",
        tone: "lisbon" as const,
    },
    {
        city: "Kyoto",
        alt: "Cherry blossoms over a temple in Kyoto",
        tone: "kyoto" as const,
    },
    {
        city: "Reykjavík",
        alt: "Northern lights over Reykjavík",
        tone: "reykjavik" as const,
    },
    {
        city: "Cusco",
        alt: "Terraced hills above Cusco",
        tone: "cusco" as const,
    },
];

// An image carousel that rotates (spec/carousel.md, the APG's): its rotation control first, which
// focus inside the carousel stops and a hover pauses; Previous and Next loop; a dot per slide.
</script>

<template>
    <Carousel.Root aria-label="Featured destinations" :slide-count="PHOTOS.length" default-playing loop :class="styles.root">
        <Carousel.AutoplayTrigger v-slot="{ state }" :class="styles.control">{{ state.playing ? "Stop slide rotation" : "Start slide rotation" }}</Carousel.AutoplayTrigger>
        <Carousel.ItemGroup :class="styles.itemGroup">
            <Carousel.Item
                v-for="(photo, index) in PHOTOS"
                :key="photo.city"
                :index="index"
                :aria-label="`${index + 1} of ${PHOTOS.length}`"
                :class="styles.item"
            >
                <div role="img" :aria-label="photo.alt" :class="styles.photos[photo.tone]">
                    <span :class="styles.caption">{{ photo.city }}</span>
                </div>
            </Carousel.Item>
        </Carousel.ItemGroup>
        <div :class="styles.controls">
            <Carousel.PrevTrigger aria-label="Previous slide" :class="styles.control">‹</Carousel.PrevTrigger>
            <Carousel.IndicatorGroup aria-label="Choose slide to display" :class="styles.indicatorGroup">
                <Carousel.Indicator
                    v-for="(photo, index) in PHOTOS"
                    :key="photo.city"
                    :index="index"
                    :aria-label="`Slide ${index + 1}`"
                    :class="styles.indicator"
                />
            </Carousel.IndicatorGroup>
            <Carousel.NextTrigger aria-label="Next slide" :class="styles.control">›</Carousel.NextTrigger>
        </div>
    </Carousel.Root>
</template>
