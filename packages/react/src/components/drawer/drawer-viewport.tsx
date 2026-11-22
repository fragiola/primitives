import { useRequiredContext } from "../../hooks/use-required-context.ts";
import type { PartProps } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    DialogViewport,
    type DialogViewportState,
} from "../dialog/dialog-viewport.tsx";
import { DrawerContext } from "./drawer-context.ts";

/** Dialog's Viewport, with the swipe's `data-swiping`. */
export function DrawerViewport(props: PartProps<DialogViewportState>) {
    const { swipe } = useRequiredContext(DrawerContext, "Drawer.Viewport");
    return (
        <DialogViewport
            {...props}
            {...stateAttributes({ swiping: swipe.swiping })}
        />
    );
}
