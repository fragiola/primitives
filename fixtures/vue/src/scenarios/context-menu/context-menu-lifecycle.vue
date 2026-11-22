<script setup lang="ts">
import { useLifecycle } from "../../kit/lifecycle.ts";
import Output from "../../kit/output.vue";
import { ContextMenu } from "../../kit/ui/context-menu.ts";

// spec/README.md, "The lifecycle scenarios".
const props = defineProps<{ cancel?: boolean }>();
const lifecycle = useLifecycle(props.cancel);
</script>

<template>
    <ContextMenu.Root
        @open-change="lifecycle.onOpenChange"
        @open-change-complete="lifecycle.onOpenChangeComplete"
    >
        <ContextMenu.Trigger class="h-32 w-64">Right-click here</ContextMenu.Trigger>
        <ContextMenu.Portal keep-mounted>
            <ContextMenu.Positioner>
                <ContextMenu.Popup aria-label="Actions">
                    <ContextMenu.Item>Edit</ContextMenu.Item>
                    <ContextMenu.Item>Delete</ContextMenu.Item>
                </ContextMenu.Popup>
            </ContextMenu.Positioner>
        </ContextMenu.Portal>
    </ContextMenu.Root>
    <Output :values="lifecycle.values" />
</template>
