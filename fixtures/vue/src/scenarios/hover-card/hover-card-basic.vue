<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/hover-card";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { HoverCard } from "../../kit/ui/hover-card.ts";

const open = ref(false);
const reason = ref<string>();
const onOpenChange = (_: boolean, details: ChangeDetails) => {
    reason.value = details.reason;
};
</script>

<template>
    <button type="button">Before</button>
    <p class="mt-4">{{ "Written by " }}<HoverCard.Root v-model:open="open" :delay="500" :close-delay="200" @open-change="onOpenChange">
            <HoverCard.Trigger href="#ada">@ada</HoverCard.Trigger>
            <HoverCard.Portal>
                <HoverCard.Positioner :side-offset="8">
                    <HoverCard.Popup>
                        <HoverCard.Arrow />
                        <strong>Ada Lovelace</strong>
                        <span>Mathematician and writer</span>
                        <a href="#ada-profile">View profile</a>
                    </HoverCard.Popup>
                </HoverCard.Positioner>
            </HoverCard.Portal>
        </HoverCard.Root>
    </p>
    <Output :values="{ open, reason }" />
</template>
