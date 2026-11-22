import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Site header",
    description:
        "A site's navigation: Products and Resources disclose panels of links, opened by a hover or a press, in one popup whose size follows the panel; Pricing is a plain link.",
    category: "navigation",
    order: 2,
    features: [
        "NavigationMenu.Root",
        "NavigationMenu.List",
        "NavigationMenu.Item",
        "NavigationMenu.Trigger",
        "NavigationMenu.Icon",
        "NavigationMenu.Content",
        "NavigationMenu.Link",
        "NavigationMenu.Portal",
        "NavigationMenu.Positioner",
        "NavigationMenu.Popup",
        "NavigationMenu.Viewport",
        "NavigationMenu.Arrow",
    ],
    docs: "/docs/api/navigation-menu",
    height: 380,
} satisfies ExampleMeta;
