<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Menu } from "../../kit/ui/menu.ts";
import { Menubar, MenubarTrigger } from "../../kit/ui/menubar.ts";
import { useMenubarOutput } from "./use-menubar-output.ts";

// spec/menubar.md, `/menubar/modal`
// one root element: the app's `locale` is no attribute of it (React's page has none)
defineOptions({ inheritAttrs: false });
const output = useMenubarOutput();
// each Root's open change, named after its Trigger
const opened = {
    File: output.onOpenChange("File"),
    Edit: output.onOpenChange("Edit"),
};
const outside = ref<string>();
</script>

<template>
    <div class="h-[200vh]">
        <Menubar aria-label="Document" modal>
            <Menu.Root @open-change="opened.File">
                <MenubarTrigger>File</MenubarTrigger>
                <Menu.Portal>
                    <Menu.Positioner :side-offset="4">
                        <Menu.Popup>
                            <Menu.Item @click="output.select('Save')()">Save</Menu.Item>
                            <Menu.Item @click="output.select('Close')()">Close</Menu.Item>
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
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
        </Menubar>
        <button type="button" class="ms-2" @click="outside = 'pressed'">Outside button</button>
        <Output
            :values="{
                menu: output.values.menu,
                reason: output.values.reason,
                action: output.values.action,
                outside,
            }"
        />
    </div>
</template>
