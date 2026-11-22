<script setup lang="ts">
import { Avatar } from "@fragiola/primitives-vue/avatar";
import { styles } from "./styles.ts";

// Inline images, so the example needs no file: a portrait, and data that is no image (a broken
// image with no failed request to log).
const BROKEN = "data:image/png;base64,AAAA";
const PORTRAIT =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%232f6f8f'/%3E%3Ccircle cx='20' cy='16' r='7' fill='%23f2d4b6'/%3E%3C/svg%3E";

// The team: an image shown once it has loaded, a broken image that shows its initials instead,
// and initials with a delay, so a fast image would never flash them (spec/avatar.md).
</script>

<template>
    <div :class="styles.row">
        <Avatar.Root :class="styles.root">
            <Avatar.Image :src="PORTRAIT" alt="Ada Lovelace" :class="styles.image" />
            <Avatar.Fallback :class="styles.fallback">AL</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root :class="styles.root">
            <Avatar.Image :src="BROKEN" alt="Grace Hopper" :class="styles.image" />
            <Avatar.Fallback :class="styles.fallback">GH</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root :class="styles.root">
            <Avatar.Fallback :delay="300" :class="styles.fallback">KJ</Avatar.Fallback>
        </Avatar.Root>
    </div>
</template>
