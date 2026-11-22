<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Menu } from "../../kit/ui/menu.ts";

// spec/menu.md, `/menu/controlled`: the page also opens it through `open`.
const open = ref(false);
</script>

<template>
    <Menu.Root v-model:open="open">
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Portal>
            <Menu.Positioner :side-offset="4">
                <Menu.Popup>
                    <Menu.Item>Edit</Menu.Item>
                    <Menu.Item>Delete</Menu.Item>
                    <Menu.Item :close-on-click="false" @click="open = false">Done</Menu.Item>
                </Menu.Popup>
            </Menu.Positioner>
        </Menu.Portal>
    </Menu.Root>
    <button type="button" class="ms-2" @click="open = true">Open from outside</button>
    <Output :values="{ open }" />
</template>
