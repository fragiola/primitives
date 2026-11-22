<script setup lang="ts">
import { Drawer } from "@fragiola/primitives-vue/drawer";
import { ref } from "vue";
import { styles } from "./styles.ts";

// A cart in a side panel at the right edge: swipe it to the right, press Escape or "Continue
// shopping" to close it; "Remove" takes an item out (spec/drawer.md).
const items = ref(["Notebook", "Fountain pen"]);
const remove = (item: string) => {
    items.value = items.value.filter((other) => other !== item);
};
</script>

<template>
    <div :class="styles.stack">
        <Drawer.Root swipe-direction="right">
            <Drawer.Trigger :class="styles.trigger">{{ `Cart (${items.length})` }}</Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Backdrop :class="styles.backdrop" />
                <Drawer.Popup :class="styles.popup">
                    <Drawer.Title :class="styles.title">Your cart</Drawer.Title>
                    <Drawer.Description :class="styles.description">{{ `${items.length} items, ready to check out.` }}</Drawer.Description>
                    <ul :class="styles.items">
                        <li v-for="item in items" :key="item" :class="styles.item">{{ item }}<button
                                type="button"
                                :class="styles.remove"
                                :aria-label="`Remove ${item}`"
                                @click="remove(item)"
                            >Remove</button></li>
                    </ul>
                    <Drawer.Close :class="styles.close">Continue shopping</Drawer.Close>
                </Drawer.Popup>
            </Drawer.Portal>
        </Drawer.Root>
    </div>
</template>
