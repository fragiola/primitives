<script setup lang="ts">
import { navigationMenu } from "examples-shared/recipes/navigation-menu";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { NavigationMenu } from "../../kit/ui/navigation-menu.ts";

// spec/navigation-menu.md: a nested, vertical level inside the Products Content.
const value = ref<string | null>(null);
const nested = ref<string | null>(null);
</script>

<template>
    <NavigationMenu.Root aria-label="Main" @value-change="(next: string | null) => (value = next)">
        <NavigationMenu.List>
            <NavigationMenu.Item value="products">
                <NavigationMenu.Trigger>Products<NavigationMenu.Icon /></NavigationMenu.Trigger>
                <NavigationMenu.Content>
                    <NavigationMenu.Root orientation="vertical" @value-change="(next: string | null) => (nested = next)">
                        <NavigationMenu.List>
                            <NavigationMenu.Item value="developers">
                                <NavigationMenu.Trigger>Developers<NavigationMenu.Icon /></NavigationMenu.Trigger>
                                <NavigationMenu.Content>
                                    <ul :class="navigationMenu['content-list']">
                                        <li><NavigationMenu.ContentLink href="#api">API</NavigationMenu.ContentLink></li>
                                        <li><NavigationMenu.ContentLink href="#sdks">SDKs</NavigationMenu.ContentLink></li>
                                    </ul>
                                </NavigationMenu.Content>
                            </NavigationMenu.Item>
                            <NavigationMenu.Item>
                                <NavigationMenu.Link href="#teams">Teams</NavigationMenu.Link>
                            </NavigationMenu.Item>
                        </NavigationMenu.List>
                        <NavigationMenu.Portal>
                            <NavigationMenu.Positioner side="inline-end" :side-offset="8">
                                <NavigationMenu.Popup>
                                    <NavigationMenu.Viewport />
                                </NavigationMenu.Popup>
                            </NavigationMenu.Positioner>
                        </NavigationMenu.Portal>
                    </NavigationMenu.Root>
                </NavigationMenu.Content>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
                <NavigationMenu.Link href="#pricing">Pricing</NavigationMenu.Link>
            </NavigationMenu.Item>
        </NavigationMenu.List>
        <NavigationMenu.Portal>
            <NavigationMenu.Positioner :side-offset="8">
                <NavigationMenu.Popup>
                    <NavigationMenu.Viewport />
                </NavigationMenu.Popup>
            </NavigationMenu.Positioner>
        </NavigationMenu.Portal>
    </NavigationMenu.Root>
    <Output :values="{ value, nested }" />
</template>
