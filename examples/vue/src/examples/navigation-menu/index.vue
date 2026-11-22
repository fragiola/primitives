<script setup lang="ts">
import { NavigationMenu } from "@fragiola/primitives-vue/navigation-menu";
import { styles } from "./styles.ts";

const PRODUCTS = [
    { href: "#analytics", title: "Analytics", text: "See how people use it." },
    { href: "#automation", title: "Automation", text: "Run the boring parts." },
    { href: "#reports", title: "Reports", text: "Share what you learned." },
];

const RESOURCES = [
    { href: "#guides", title: "Guides", text: "Step by step." },
    { href: "#blog", title: "Blog", text: "News and stories." },
    { href: "#videos", title: "Videos", text: "Watch and learn." },
    { href: "#community", title: "Community", text: "Ask and answer." },
];

// A site header: hover or press "Products" or "Resources" to disclose a panel of links, in one
// popup that resizes to each panel; the arrow keys move between the items, ArrowDown opens a
// panel with focus inside, Escape closes it (spec/navigation-menu.md).
</script>

<template>
    <header :class="styles.header">
        <span :class="styles.brand">Acme</span>
        <NavigationMenu.Root aria-label="Main" :class="styles.root">
            <NavigationMenu.List :class="styles.list">
                <NavigationMenu.Item :class="styles.item">
                    <NavigationMenu.Trigger :class="styles.trigger">Products<NavigationMenu.Icon :class="styles.icon" /></NavigationMenu.Trigger>
                    <NavigationMenu.Content :class="styles.content">
                        <ul :class="styles.panel">
                            <li v-for="link in PRODUCTS" :key="link.href">
                                <NavigationMenu.Link :href="link.href" :class="styles.contentLink"><span :class="styles.linkTitle">{{ link.title }}</span><span :class="styles.linkDescription">{{ link.text }}</span></NavigationMenu.Link>
                            </li>
                        </ul>
                    </NavigationMenu.Content>
                </NavigationMenu.Item>
                <NavigationMenu.Item :class="styles.item">
                    <NavigationMenu.Trigger :class="styles.trigger">Resources<NavigationMenu.Icon :class="styles.icon" /></NavigationMenu.Trigger>
                    <NavigationMenu.Content :class="styles.content">
                        <ul :class="styles.grid">
                            <li v-for="link in RESOURCES" :key="link.href">
                                <NavigationMenu.Link :href="link.href" :class="styles.contentLink"><span :class="styles.linkTitle">{{ link.title }}</span><span :class="styles.linkDescription">{{ link.text }}</span></NavigationMenu.Link>
                            </li>
                        </ul>
                    </NavigationMenu.Content>
                </NavigationMenu.Item>
                <NavigationMenu.Item :class="styles.item">
                    <NavigationMenu.Link href="#pricing" :class="styles.link">Pricing</NavigationMenu.Link>
                </NavigationMenu.Item>
            </NavigationMenu.List>
            <NavigationMenu.Portal>
                <NavigationMenu.Positioner :side-offset="8" :class="styles.positioner">
                    <NavigationMenu.Popup :class="styles.popup">
                        <NavigationMenu.Arrow :class="styles.arrow" />
                        <NavigationMenu.Viewport :class="styles.viewport" />
                    </NavigationMenu.Popup>
                </NavigationMenu.Positioner>
            </NavigationMenu.Portal>
        </NavigationMenu.Root>
    </header>
</template>
