<script setup lang="ts">
import Output from "../../kit/output.vue";
import { Menu } from "../../kit/ui/menu.ts";
import { Menubar, MenubarTrigger } from "../../kit/ui/menubar.ts";
import { useMenubarOutput } from "./use-menubar-output.ts";

// spec/menubar.md, `/menubar/vertical`
const output = useMenubarOutput();
// each Root's open change, named after its Trigger
const opened = {
    Shapes: output.onOpenChange("Shapes"),
    Arrange: output.onOpenChange("Arrange"),
};
</script>

<template>
    <div class="flex items-start gap-2">
        <Menubar aria-label="Tools" orientation="vertical" :loop-focus="false">
            <Menu.Root @open-change="opened.Shapes">
                <MenubarTrigger>Shapes</MenubarTrigger>
                <Menu.Portal>
                    <Menu.Positioner :side-offset="4">
                        <Menu.Popup>
                            <Menu.Item @click="output.select('Rectangle')()">Rectangle</Menu.Item>
                            <Menu.Item @click="output.select('Ellipse')()">Ellipse</Menu.Item>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
            <Menu.Root @open-change="opened.Arrange">
                <MenubarTrigger>Arrange</MenubarTrigger>
                <Menu.Portal>
                    <Menu.Positioner :side-offset="4">
                        <Menu.Popup>
                            <Menu.Item @click="output.select('Bring forward')()">Bring forward</Menu.Item>
                            <Menu.Item @click="output.select('Send backward')()">Send backward</Menu.Item>
                        </Menu.Popup>
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
        </Menubar>
        <button type="button">After</button>
    </div>
    <Output :values="{ menu: output.values.menu, reason: output.values.reason, action: output.values.action }" />
</template>
