<script setup lang="ts">
import { Separator } from "@fragiola/primitives-vue/separator";
import { styles } from "./styles.ts";

// A profile card: a horizontal separator between its sections, vertical ones between its links,
// and a decorative one that assistive technologies skip (spec/separator.md).
</script>

<template>
    <div :class="styles.card">
        <p :class="styles.heading">Ada Lovelace</p>
        <p :class="styles.text">Analyst and metaphysician.</p>
        <Separator :class="styles.root" />
        <div :class="styles.row">
            <a href="#notes" :class="styles.link">Notes</a>
            <Separator orientation="vertical" :class="styles.root" />
            <a href="#letters" :class="styles.link">Letters</a>
            <Separator orientation="vertical" :class="styles.root" />
            <a href="#engine" :class="styles.link">Engine</a>
        </div>
        <Separator decorative :class="styles.root" />
    </div>
</template>
