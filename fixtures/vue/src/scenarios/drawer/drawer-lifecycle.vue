<script setup lang="ts">
import type { OverlayActions } from "@fragiola/primitives-vue/drawer";
import { useTemplateRef } from "vue";
import { useLifecycle } from "../../kit/lifecycle.ts";
import Output from "../../kit/output.vue";
import { Drawer } from "../../kit/ui/drawer.ts";

// spec/README.md, "The lifecycle scenarios".
const props = defineProps<{ cancel?: boolean }>();
const lifecycle = useLifecycle(props.cancel);
const root = useTemplateRef<OverlayActions>("root");
</script>

<template>
    <Drawer.Root
        ref="root"
        @open-change="lifecycle.onOpenChange"
        @open-change-complete="lifecycle.onOpenChangeComplete"
    >
        <Drawer.Trigger>Open drawer</Drawer.Trigger>
        <Drawer.Portal keep-mounted>
            <Drawer.Backdrop />
            <Drawer.Popup>
                <Drawer.Title>Lifecycle</Drawer.Title>
                <div class="flex justify-end gap-2">
                    <button type="button" @click="root?.close()">Close with actions</button>
                    <Drawer.Close>Close</Drawer.Close>
                </div>
            </Drawer.Popup>
        </Drawer.Portal>
    </Drawer.Root>
    <Output :values="lifecycle.values" />
</template>
