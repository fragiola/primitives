<script setup lang="ts">
import { useLifecycle } from "../../kit/lifecycle.ts";
import Output from "../../kit/output.vue";
import { Tooltip } from "../../kit/ui/tooltip.ts";

// spec/README.md, "The lifecycle scenarios".
const props = defineProps<{ cancel?: boolean }>();
const lifecycle = useLifecycle(props.cancel);
</script>

<template>
    <div class="mt-12">
        <Tooltip.Root :delay="0" @open-change="lifecycle.onOpenChange" @open-change-complete="lifecycle.onOpenChangeComplete">
            <Tooltip.Trigger>Save</Tooltip.Trigger>
            <Tooltip.Portal keep-mounted>
                <Tooltip.Positioner :side-offset="6">
                    <Tooltip.Popup>Save the document</Tooltip.Popup>
                </Tooltip.Positioner>
            </Tooltip.Portal>
        </Tooltip.Root>
    </div>
    <Output :values="lifecycle.values" />
</template>
