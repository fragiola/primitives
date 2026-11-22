<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Dialog } from "../../kit/ui/dialog.ts";
import { Menu } from "../../kit/ui/menu.ts";
import { Popover } from "../../kit/ui/popover.ts";

// A Dialog, a Popover opened from it, a Menu opened from the popover, a submenu of the menu.
const dialog = ref(false);
const popover = ref(false);
const menu = ref(false);
const submenu = ref(false);
</script>

<template>
    <Dialog.Root @open-change="(next: boolean) => (dialog = next)">
        <Dialog.Trigger>Open settings</Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Popup>
                <Dialog.Title>Settings</Dialog.Title>
                <Popover.Root @open-change="(next: boolean) => (popover = next)">
                    <Popover.Trigger>Theme options</Popover.Trigger>
                    <Popover.Portal keep-mounted>
                        <Popover.Positioner :side-offset="4">
                            <Popover.Popup>
                                <Popover.Title>Theme</Popover.Title>
                                <Menu.Root @open-change="(next: boolean) => (menu = next)">
                                    <Menu.Trigger>Pick theme</Menu.Trigger>
                                    <Menu.Portal>
                                        <Menu.Positioner :side-offset="4">
                                            <Menu.Popup>
                                                <Menu.Item>Light</Menu.Item>
                                                <Menu.Item>Dark</Menu.Item>
                                                <Menu.SubmenuRoot @open-change="(next: boolean) => (submenu = next)">
                                                    <Menu.SubmenuTrigger>More themes</Menu.SubmenuTrigger>
                                                    <Menu.Portal>
                                                        <Menu.Positioner>
                                                            <Menu.Popup>
                                                                <Menu.Item>Solarized</Menu.Item>
                                                                <Menu.Item>Nord</Menu.Item>
                                                            </Menu.Popup>
                                                        </Menu.Positioner>
                                                    </Menu.Portal>
                                                </Menu.SubmenuRoot>
                                            </Menu.Popup>
                                        </Menu.Positioner>
                                    </Menu.Portal>
                                </Menu.Root>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
                <Dialog.Close>Close</Dialog.Close>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>
    <Output :values="{ dialog, popover, menu, submenu }" />
</template>
