<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/navigation-menu";
import { navigationMenu } from "examples-shared/recipes/navigation-menu";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { NavigationMenu } from "../../kit/ui/navigation-menu.ts";

// spec/navigation-menu.md: a site header with two disclosed panels and a link.
const value = ref<string | null>(null);
const reason = ref<string>();
const onValueChange = (next: string | null, details: ChangeDetails) => {
    value.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <NavigationMenu.Root aria-label="Main" @value-change="onValueChange">
        <NavigationMenu.List>
            <NavigationMenu.Item value="products">
                <NavigationMenu.Trigger>Products<NavigationMenu.Icon /></NavigationMenu.Trigger>
                <NavigationMenu.Content>
                    <ul :class="navigationMenu['content-list']">
                        <li><NavigationMenu.ContentLink href="#analytics" active>Analytics</NavigationMenu.ContentLink></li>
                        <li><NavigationMenu.ContentLink href="#automation">Automation</NavigationMenu.ContentLink></li>
                        <li><NavigationMenu.ContentLink href="#reports">Reports</NavigationMenu.ContentLink></li>
                    </ul>
                </NavigationMenu.Content>
            </NavigationMenu.Item>
            <NavigationMenu.Item value="learn">
                <NavigationMenu.Trigger>Learn<NavigationMenu.Icon /></NavigationMenu.Trigger>
                <NavigationMenu.Content>
                    <ul :class="navigationMenu['content-grid']">
                        <li><NavigationMenu.ContentLink href="#guides">Guides</NavigationMenu.ContentLink></li>
                        <li><NavigationMenu.ContentLink href="#blog">Blog</NavigationMenu.ContentLink></li>
                        <li><NavigationMenu.ContentLink href="#videos">Videos</NavigationMenu.ContentLink></li>
                        <li><NavigationMenu.ContentLink href="#community">Community</NavigationMenu.ContentLink></li>
                    </ul>
                </NavigationMenu.Content>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
                <NavigationMenu.Link href="#pricing">Pricing</NavigationMenu.Link>
            </NavigationMenu.Item>
        </NavigationMenu.List>
        <NavigationMenu.Portal>
            <NavigationMenu.Positioner :side-offset="8">
                <NavigationMenu.Popup>
                    <NavigationMenu.Arrow />
                    <NavigationMenu.Viewport />
                </NavigationMenu.Popup>
            </NavigationMenu.Positioner>
        </NavigationMenu.Portal>
    </NavigationMenu.Root>
    <button type="button" class="mt-40">Outside button</button>
    <Output :values="{ value, reason }" />
</template>
