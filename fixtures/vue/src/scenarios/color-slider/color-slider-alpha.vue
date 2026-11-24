<script setup lang="ts">
import { ColorSlider } from "../../kit/ui/color-slider.ts";

// spec/color-slider.md, `/color-slider/alpha`
// one root element: the app's `locale` is no attribute of it (React's page has none)
defineOptions({ inheritAttrs: false });
</script>

<template>
    <ColorSlider.Root channel="alpha" default-value="rgba(51, 102, 153, 0.5)" locale="de-DE">
        <ColorSlider.Track data-testid="track">
            <ColorSlider.Thumb aria-label="Opacity" />
        </ColorSlider.Track>
        <ColorSlider.Output />
    </ColorSlider.Root>
</template>
