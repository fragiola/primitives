<script setup lang="ts">
import { HoverCard } from "@fragiola/primitives-vue/hover-card";
import { styles } from "./styles.ts";

// A user profile preview: hovering or focusing the link shows the card after a delay; the pointer
// can cross over to it, Escape or a press outside closes it, and the link still goes to the page.
</script>

<template>
    <p :class="styles.text">{{ "Reviewed by " }}<HoverCard.Root :delay="400" :close-delay="200">
            <HoverCard.Trigger href="#ada" :class="styles.trigger">@ada</HoverCard.Trigger>
            <HoverCard.Portal>
                <HoverCard.Positioner :side-offset="8" :class="styles.positioner">
                    <HoverCard.Popup :class="styles.popup">
                        <HoverCard.Arrow :class="styles.arrow" />
                        <div :class="styles.header">
                            <span :class="styles.avatar" aria-hidden="true">AL</span>
                            <div>
                                <div :class="styles.name">Ada Lovelace</div>
                                <div :class="styles.handle">@ada</div>
                            </div>
                        </div>
                        <p :class="styles.bio">Mathematician and writer of the first published program.</p>
                        <div :class="styles.stats">
                            <span>42 reviews</span>
                            <span>7 repositories</span>
                        </div>
                    </HoverCard.Popup>
                </HoverCard.Positioner>
            </HoverCard.Portal>
        </HoverCard.Root>{{ " approved this change." }}</p>
</template>
