<script setup lang="ts">
import { ColorSwatch } from "../../kit/ui/color-swatch.ts";

// spec/color-swatch.md, `/color-swatch/basic`
// one root element: the app's `locale` is no attribute of it (React's page has none)
defineOptions({ inheritAttrs: false });
</script>

<template>
    <div class="flex items-center gap-2">
        <ColorSwatch color="#336699" aria-label="Ocean" />
        <ColorSwatch color="rgba(255, 0, 0, 0.5)" />
        <ColorSwatch color="hsl(120, 100%, 25%)" aria-label="Forest" />
    </div>
</template>
