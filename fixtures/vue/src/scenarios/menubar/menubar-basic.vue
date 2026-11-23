<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Menu } from "../../kit/ui/menu.ts";
import { Menubar, MenubarTrigger } from "../../kit/ui/menubar.ts";
import { useMenubarOutput } from "./use-menubar-output.ts";

// spec/menubar.md, `/menubar/basic` (and `?dir=rtl`)
const output = useMenubarOutput();
// each Root's open change, named after its Trigger
const opened = {
    File: output.onOpenChange("File"),
    Edit: output.onOpenChange("Edit"),
    View: output.onOpenChange("View"),
    Help: output.onOpenChange("Help"),
};
const toolbar = ref(true);
const statusBar = ref(false);
const theme = ref<string | null>("light");
</script>

<template>
    <div class="flex flex-wrap items-center gap-2">
        <button type="button">Before</button>
        <Menubar aria-label="Application">
            <Menu.Root @open-change="opened.File">
                <MenubarTrigger>File</MenubarTrigger>
                <Menu.Portal>
                    <Menu.Positioner :side-offset="4">
                        <Menu.Popup>
                            <Menu.Item @click="output.select('New')()">New</Menu.Item>
                            <Menu.Item @click="output.select('Open')()">Open</Menu.Item>
                            <Menu.SubmenuRoot>
                                <Menu.SubmenuTrigger>Share</Menu.SubmenuTrigger>
                                <Menu.Portal>
                                    <Menu.Positioner>
                                        <Menu.Popup>
                                            <Menu.Item @click="output.select('Email')()">Email</Menu.Item>
                                            <Menu.Item @click="output.select('Link')()">Link</Menu.Item>
                                        </Menu.Popup>
                                    </Menu.Positioner>
                                </Menu.Portal>
                            </Menu.SubmenuRoot>
                            <Menu.Separator />
                            <Menu.Item @click="output.select('Print')()">Print</Menu.Item>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
            <Menu.Root @open-change="opened.Edit">
                <MenubarTrigger>Edit</MenubarTrigger>
                <Menu.Portal>
                    <Menu.Positioner :side-offset="4">
                        <Menu.Popup>
                            <Menu.Item @click="output.select('Undo')()">Undo</Menu.Item>
                            <Menu.Item disabled @click="output.select('Redo')()">Redo</Menu.Item>
                            <Menu.Item @click="output.select('Cut')()">Cut</Menu.Item>
                            <Menu.Item @click="output.select('Copy')()">Copy</Menu.Item>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
            <Menu.Root @open-change="opened.View">
                <MenubarTrigger>View</MenubarTrigger>
                <Menu.Portal>
                    <Menu.Positioner :side-offset="4">
                        <Menu.Popup>
                            <Menu.CheckboxItem default-checked @checked-change="(checked: boolean) => (toolbar = checked)"><Menu.CheckboxItemIndicator>✓</Menu.CheckboxItemIndicator>Show toolbar</Menu.CheckboxItem>
                            <Menu.CheckboxItem @checked-change="(checked: boolean) => (statusBar = checked)"><Menu.CheckboxItemIndicator>✓</Menu.CheckboxItemIndicator>Show status bar</Menu.CheckboxItem>
                            <Menu.Separator />
                            <Menu.Group>
                                <Menu.GroupLabel>Theme</Menu.GroupLabel>
                                <Menu.RadioGroup default-value="light" @value-change="(value: string | null) => (theme = value)">
                                    <Menu.RadioItem value="light"><Menu.RadioItemIndicator>•</Menu.RadioItemIndicator>Light</Menu.RadioItem>
                                    <Menu.RadioItem value="dark"><Menu.RadioItemIndicator>•</Menu.RadioItemIndicator>Dark</Menu.RadioItem>
                                </Menu.RadioGroup>
                            </Menu.Group>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
            <Menu.Root @open-change="opened.Help">
                <MenubarTrigger disabled>Help</MenubarTrigger>
                <Menu.Portal>
                    <Menu.Positioner :side-offset="4">
                        <Menu.Popup>
                            <Menu.Item @click="output.select('About')()">About</Menu.Item>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
        </Menubar>
        <button type="button">After</button>
    </div>
    <Output
        :values="{
            menu: output.values.menu,
            reason: output.values.reason,
            action: output.values.action,
            toolbar,
            'status bar': statusBar,
            theme,
        }"
    />
</template>
