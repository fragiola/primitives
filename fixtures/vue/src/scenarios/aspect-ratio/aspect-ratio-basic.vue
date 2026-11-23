<script setup lang="ts">
import { ref } from "vue";
import { AspectRatio } from "../../kit/ui/aspect-ratio.ts";

// spec/aspect-ratio.md, `/aspect-ratio/basic`. A 16 by 9 picture, one color: the frame's ratio
// is what the scenario checks.
const LAKE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%234a7a8c'/%3E%3C/svg%3E";
const wide = ref(false);
defineProps<{ locale?: string }>();
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <div :class="wide ? 'w-[32rem]' : 'w-80'">
            <AspectRatio :ratio="16 / 9">
                <img :src="LAKE" alt="Mountain lake" class="size-full object-cover" />
            </AspectRatio>
        </div>
        <div class="w-40">
            <AspectRatio>
                <div role="img" aria-label="Avatar placeholder" class="size-full"></div>
            </AspectRatio>
        </div>
        <button type="button" @click="wide = !wide">Widen</button>
    </div>
</template>
