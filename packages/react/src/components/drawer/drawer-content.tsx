import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { DrawerContext } from "./drawer-context.ts";

/**
 * The drawer's content: a mouse press inside it selects text instead of swiping (spec/drawer.md,
 * "Swipe"); a touch still swipes.
 */
export function DrawerContent(props: PartProps<Record<string, never>>) {
    useRequiredContext(DrawerContext, "Drawer.Content");
    return renderElement(
        "div",
        props,
        {},
        { "data-primitives-part": "drawer-content" },
    );
}
