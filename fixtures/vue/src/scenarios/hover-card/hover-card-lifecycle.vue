<script setup lang="ts">
import { useLifecycle } from "../../kit/lifecycle.ts";
import Output from "../../kit/output.vue";
import { HoverCard } from "../../kit/ui/hover-card.ts";

// spec/README.md, "The lifecycle scenarios".
const props = defineProps<{ cancel?: boolean }>();
const lifecycle = useLifecycle(props.cancel);
</script>

<template>
    <p>
        <HoverCard.Root :delay="0" :close-delay="0" @open-change="lifecycle.onOpenChange" @open-change-complete="lifecycle.onOpenChangeComplete">
            <HoverCard.Trigger href="#ada">@ada</HoverCard.Trigger>
            <HoverCard.Portal keep-mounted>
                <HoverCard.Positioner :side-offset="8">
                    <HoverCard.Popup>Ada Lovelace</HoverCard.Popup>
                </HoverCard.Positioner>
            </HoverCard.Portal>
        </HoverCard.Root>
    </p>
    <Output :values="lifecycle.values" />
</template>
