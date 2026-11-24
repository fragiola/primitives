<script setup lang="ts">
import { ColorArea } from "../../kit/ui/color-area.ts";

// spec/color-area.md, `/color-area/rgb`
// one root element: the app's `locale` is no attribute of it (React's page has none)
defineOptions({ inheritAttrs: false });
</script>

<template>
    <ColorArea.Root
        aria-label="Red and green"
        default-value="rgb(0, 0, 128)"
        x-channel="red"
        y-channel="green"
        data-testid="area"
    >
        <ColorArea.Thumb>
            <ColorArea.Input axis="x" aria-label="Red" />
            <ColorArea.Input axis="y" aria-label="Green" />
        </ColorArea.Thumb>
    </ColorArea.Root>
</template>
