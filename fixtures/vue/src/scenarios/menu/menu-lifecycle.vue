<script setup lang="ts">
import { useLifecycle } from "../../kit/lifecycle.ts";
import Output from "../../kit/output.vue";
import { Menu } from "../../kit/ui/menu.ts";

// spec/README.md, "The lifecycle scenarios".
const props = defineProps<{ cancel?: boolean }>();
const lifecycle = useLifecycle(props.cancel);
</script>

<template>
    <Menu.Root @open-change="lifecycle.onOpenChange" @open-change-complete="lifecycle.onOpenChangeComplete">
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Portal keep-mounted>
            <Menu.Positioner :side-offset="4">
                <Menu.Popup>
                    <Menu.Item>Edit</Menu.Item>
                    <Menu.Item>Delete</Menu.Item>
                </Menu.Popup>
            </Menu.Positioner>
        </Menu.Portal>
    </Menu.Root>
    <Output :values="lifecycle.values" />
</template>
