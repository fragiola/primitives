<script setup lang="ts">
import PlacedPopover from "./placed-popover.vue";
</script>

<template>
    <p class="my-4"><PlacedPopover label="Bottom start" side="bottom" align="start" /></p>
    <p class="my-4"><PlacedPopover label="Inline end" side="inline-end" /></p>
    <p class="my-4 ps-80"><PlacedPopover label="Left" side="left" /></p>
    <p class="fixed bottom-2 start-6"><PlacedPopover label="Flip" side="bottom" /></p>
</template>
