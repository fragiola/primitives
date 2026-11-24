<script setup lang="ts">
import { ColorWheel } from "../../kit/ui/color-wheel.ts";

// spec/color-wheel.md, `/color-wheel/disabled`
// one root element: the app's `locale` is no attribute of it (React's page has none)
defineOptions({ inheritAttrs: false });
</script>

<template>
    <ColorWheel.Root
        default-value="hsb(200, 100%, 100%)"
        disabled
        :outer-radius="100"
        :inner-radius="76"
        data-testid="wheel"
    >
        <ColorWheel.Track />
        <ColorWheel.Thumb aria-label="Hue" />
    </ColorWheel.Root>
</template>
