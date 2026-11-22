import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Toolbar hints",
    description:
        "Tooltips that describe a toolbar's buttons: hover waits for the delay, the next one opens at once, keyboard focus opens them with no delay.",
    category: "overlays",
    order: 3,
    features: [
        "Tooltip.Provider",
        "Tooltip.Root",
        "Tooltip.Trigger",
        "Tooltip.Portal",
        "Tooltip.Positioner",
        "Tooltip.Popup",
        "Tooltip.Arrow",
        "delay",
    ],
    docs: "/docs/api/tooltip",
    height: 240,
} satisfies ExampleMeta;
