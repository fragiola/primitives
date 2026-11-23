<script setup lang="ts">
import { Menu as MenuPrimitive } from "@fragiola/primitives-vue/menu";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Breadcrumbs } from "../../kit/ui/breadcrumbs.ts";
import { Menu } from "../../kit/ui/menu.ts";

// spec/breadcrumbs.md, `/breadcrumbs/collapsed`
const chosen = ref<string>();
</script>

<template>
    <Breadcrumbs.Root aria-label="Breadcrumb">
        <Breadcrumbs.List>
            <Breadcrumbs.Item>
                <Breadcrumbs.Link href="#home">Home</Breadcrumbs.Link>
            </Breadcrumbs.Item>
            <Breadcrumbs.Separator>/</Breadcrumbs.Separator>
            <Breadcrumbs.Item>
                <Menu.Root>
                    <Breadcrumbs.Ellipsis aria-label="Show the hidden pages" :as="MenuPrimitive.Trigger">…</Breadcrumbs.Ellipsis>
                    <Menu.Portal>
                        <Menu.Positioner :side-offset="4">
                            <Menu.Popup>
                                <Menu.Item @click="chosen = 'Docs'">Docs</Menu.Item>
                                <Menu.Item @click="chosen = 'Components'">Components</Menu.Item>
                            </Menu.Popup>
                        </Menu.Positioner>
                    </Menu.Portal>
                </Menu.Root>
            </Breadcrumbs.Item>
            <Breadcrumbs.Separator>/</Breadcrumbs.Separator>
            <Breadcrumbs.Item>
                <Breadcrumbs.Link href="#guides">Guides</Breadcrumbs.Link>
            </Breadcrumbs.Item>
            <Breadcrumbs.Separator>/</Breadcrumbs.Separator>
            <Breadcrumbs.Item>
                <Breadcrumbs.Current>Routing</Breadcrumbs.Current>
            </Breadcrumbs.Item>
        </Breadcrumbs.List>
    </Breadcrumbs.Root>
    <Output :values="{ chosen }" />
</template>
