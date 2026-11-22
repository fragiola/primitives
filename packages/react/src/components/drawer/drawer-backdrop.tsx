import type { CSSProperties } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    DialogBackdrop,
    type DialogBackdropProps,
} from "../dialog/dialog-backdrop.tsx";
import { DrawerContext } from "./drawer-context.ts";

export interface DrawerBackdropProps extends DialogBackdropProps {}

/** Dialog's Backdrop, with the swipe's `data-swiping` and `--drawer-swipe-progress`. */
export function DrawerBackdrop({ style, ...props }: DrawerBackdropProps) {
    const { swipe } = useRequiredContext(DrawerContext, "Drawer.Backdrop");
    return (
        <DialogBackdrop
            {...props}
            style={(state) =>
                ({
                    "--drawer-swipe-progress": swipe.progress,
                    ...(typeof style === "function" ? style(state) : style),
                }) as CSSProperties
            }
            {...stateAttributes({ swiping: swipe.swiping })}
        />
    );
}
