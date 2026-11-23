<script setup lang="ts">
import { AspectRatio } from "@fragiola/primitives-vue/aspect-ratio";
import { styles } from "./styles.ts";

/** A drawn landscape: no network, and any ratio covers it. */
const LANDSCAPE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'%3E%3Crect width='160' height='90' fill='%23bcd4de'/%3E%3Cpath d='M0 70 L45 30 L80 62 L110 40 L160 75 V90 H0 Z' fill='%234a7a8c'/%3E%3Ccircle cx='128' cy='22' r='9' fill='%23f2d480'/%3E%3C/svg%3E";

// An image frame that keeps 16:9 at any width (spec/aspect-ratio.md); the picture covers it.
</script>

<template>
    <figure :class="styles.figure">
        <AspectRatio :ratio="16 / 9" :class="styles.root">
            <img :src="LANDSCAPE" alt="Hills under the sun" :class="styles.image" />
        </AspectRatio>
        <figcaption :class="styles.caption">Hills under the sun, 16:9 at any width.</figcaption>
    </figure>
</template>
