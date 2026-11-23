<script setup lang="ts">
import { Carousel } from "@fragiola/primitives-vue/carousel";
import { styles } from "./styles.ts";

const FEATURES = [
    {
        tab: "Sync",
        title: "Sync everywhere",
        text: "Your notes on every device, offline too.",
    },
    {
        tab: "Share",
        title: "Share with anyone",
        text: "A link that opens for people you choose.",
    },
    {
        tab: "Secure",
        title: "Secure by default",
        text: "Encrypted before it leaves your device.",
    },
];

// A tabbed carousel (spec/carousel.md, the APG's tabbed style): the Indicators are a tablist, each
// slide a tabpanel; the arrow keys move between the tabs and show their slides.
</script>

<template>
    <Carousel.Root aria-label="Feature tour" variant="tabbed" :slide-count="FEATURES.length" :class="styles.root">
        <Carousel.IndicatorGroup aria-label="Choose slide to display" :class="styles.indicatorGroup">
            <Carousel.Indicator v-for="(feature, index) in FEATURES" :key="feature.tab" :index="index" :class="styles.tab">{{ feature.tab }}</Carousel.Indicator>
        </Carousel.IndicatorGroup>
        <Carousel.ItemGroup :class="styles.itemGroup">
            <Carousel.Item
                v-for="(feature, index) in FEATURES"
                :key="feature.tab"
                :index="index"
                :aria-label="`${index + 1} of ${FEATURES.length}`"
                :class="styles.item"
            >
                <div :class="styles.card">
                    <h3 :class="styles.title">{{ feature.title }}</h3>
                    <p :class="styles.text">{{ feature.text }}</p>
                </div>
            </Carousel.Item>
        </Carousel.ItemGroup>
    </Carousel.Root>
</template>
