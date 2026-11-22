<script setup lang="ts">
import { Separator } from "../../kit/ui/separator.ts";

// the page passes its locale, which a single root would take as an attribute
defineProps<{ locale?: string }>();
</script>

<template>
    <div class="flex w-64 flex-col gap-3 text-sm">
        <p>Account settings</p>
        <Separator />
        <p>Danger zone</p>
        <div class="flex items-center gap-3">
            <a href="#docs">Docs</a>
            <Separator orientation="vertical" />
            <a href="#blog">Blog</a>
        </div>
        <Separator decorative />
    </div>
</template>
