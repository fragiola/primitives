<script setup lang="ts">
import { Menu } from "@fragiola/primitives-vue/menu";
import { styles } from "./styles.ts";

// A "File" menu button: the arrow keys move through the items (a disabled one stays focusable),
// ArrowRight opens the "Share" submenu, Escape closes one level and an item closes them all.
</script>

<template>
    <Menu.Root>
        <Menu.Trigger :class="styles.trigger">File</Menu.Trigger>
        <Menu.Portal>
            <Menu.Positioner :side-offset="4" :class="styles.positioner">
                <Menu.Popup :class="styles.popup">
                    <Menu.Item :class="styles.item">New file</Menu.Item>
                    <Menu.Item :class="styles.item">Open…</Menu.Item>
                    <Menu.SubmenuRoot>
                        <Menu.SubmenuTrigger :class="styles.submenuTrigger">Share</Menu.SubmenuTrigger>
                        <Menu.Portal>
                            <Menu.Positioner :class="styles.positioner">
                                <Menu.Popup :class="styles.popup">
                                    <Menu.Item :class="styles.item">Email</Menu.Item>
                                    <Menu.Item :class="styles.item">Copy link</Menu.Item>
                                </Menu.Popup>
                            </Menu.Positioner>
                        </Menu.Portal>
                    </Menu.SubmenuRoot>
                    <Menu.Separator :class="styles.separator" />
                    <Menu.Item disabled :class="styles.item">Export</Menu.Item>
                    <Menu.Item :class="styles.item">Rename</Menu.Item>
                </Menu.Popup>
            </Menu.Positioner>
        </Menu.Portal>
    </Menu.Root>
</template>
