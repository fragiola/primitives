<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Menu } from "../../kit/ui/menu.ts";
import { useMenuOutput } from "./use-menu-output.ts";

const menu = useMenuOutput();
const outside = ref<string>();
</script>

<template>
    <div class="h-[200vh]">
        <Menu.Root v-model:open="menu.open.value" modal @open-change="menu.onOpenChange">
            <Menu.Trigger>Options</Menu.Trigger>
            <Menu.Portal>
                <Menu.Positioner :side-offset="4">
                    <Menu.Popup>
                        <Menu.Item @click="menu.select('Rename')()">Rename</Menu.Item>
                        <Menu.Item @click="menu.select('Remove')()">Remove</Menu.Item>
                    </Menu.Popup>
                </Menu.Positioner>
            </Menu.Portal>
        </Menu.Root>
        <button type="button" class="ms-2" @click="outside = 'pressed'">Outside button</button>
        <Output
            :values="{
                open: menu.values.open,
                reason: menu.values.reason,
                action: menu.values.action,
                outside,
            }"
        />
    </div>
</template>
