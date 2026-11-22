<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Drawer } from "../../kit/ui/drawer.ts";

// spec/drawer.md, "Nested drawers": a drawer opened from inside another one.
const open = ref(false);
const nested = ref(false);
</script>

<template>
    <Drawer.Root @open-change="(next: boolean) => (open = next)">
        <Drawer.Trigger>Open order</Drawer.Trigger>
        <Drawer.Portal>
            <Drawer.Backdrop />
            <Drawer.Popup>
                <Drawer.Title>Order</Drawer.Title>
                <Drawer.Root @open-change="(next: boolean) => (nested = next)">
                    <Drawer.Trigger>Edit address</Drawer.Trigger>
                    <Drawer.Portal>
                        <Drawer.Backdrop />
                        <Drawer.Popup>
                            <Drawer.Title>Address</Drawer.Title>
                            <Drawer.Close>Save address</Drawer.Close>
                        </Drawer.Popup>
                    </Drawer.Portal>
                </Drawer.Root>
                <Drawer.Close>Close order</Drawer.Close>
            </Drawer.Popup>
        </Drawer.Portal>
    </Drawer.Root>
    <Output :values="{ open, nested }" />
</template>
