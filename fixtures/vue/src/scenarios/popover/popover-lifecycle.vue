<script setup lang="ts">
import type { OverlayActions } from "@fragiola/primitives-vue/popover";
import { useTemplateRef } from "vue";
import { useLifecycle } from "../../kit/lifecycle.ts";
import Output from "../../kit/output.vue";
import { Popover } from "../../kit/ui/popover.ts";

// spec/README.md, "The lifecycle scenarios".
const props = defineProps<{ cancel?: boolean }>();
const lifecycle = useLifecycle(props.cancel);
const root = useTemplateRef<OverlayActions>("root");
</script>

<template>
    <Popover.Root
        ref="root"
        @open-change="lifecycle.onOpenChange"
        @open-change-complete="lifecycle.onOpenChangeComplete"
    >
        <Popover.Trigger>Open popover</Popover.Trigger>
        <Popover.Portal keep-mounted>
            <Popover.Positioner :side-offset="4">
                <Popover.Popup>
                    <Popover.Title>Lifecycle</Popover.Title>
                    <button type="button" @click="root?.close()">Close with actions</button>
                    <Popover.Close>Close</Popover.Close>
                </Popover.Popup>
            </Popover.Positioner>
        </Popover.Portal>
    </Popover.Root>
    <Output :values="lifecycle.values" />
</template>
