import { dialog } from "./dialog.ts";
import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/drawer.md, "Anatomy": Dialog's parts, the popup at its edge and moved by the swipe's
// variables (the snap point's offset plus the movement), with no transition while it is swiped
const EDGE_MOTION =
    "transition-[translate] duration-(--pr-motion) ease-out data-swiping:transition-none";

export const drawer: Recipe<
    | "trigger"
    | "backdrop"
    | "viewport"
    | "popup"
    | "handle"
    | "content"
    | "title"
    | "description"
    | "close"
> = {
    ...dialog,
    backdrop:
        "fixed inset-0 bg-backdrop opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-(--pr-motion) data-swiping:transition-none data-starting-style:opacity-0 data-ending-style:opacity-0",
    popup: `palette-raised fixed flex flex-col gap-(--pr-gap) p-(--pr-popup-padding) border-palette-line bg-palette-base text-palette-contrast font-primitives text-(length:--pr-size) shadow-popup ${EDGE_MOTION} ${FOCUS_RING}
        data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:mx-auto data-[swipe-direction=down]:w-full data-[swipe-direction=down]:max-w-[32rem] data-[swipe-direction=down]:max-h-[calc(100vh-2rem)] data-[swipe-direction=down]:rounded-t-popup data-[swipe-direction=down]:border-x data-[swipe-direction=down]:border-t
        data-[swipe-direction=down]:translate-y-[calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y))] data-[swipe-direction=down]:data-starting-style:translate-y-full data-[swipe-direction=down]:data-ending-style:translate-y-full
        data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:w-(--pr-popup-width) data-[swipe-direction=right]:max-w-[calc(100vw-2rem)] data-[swipe-direction=right]:rounded-l-popup data-[swipe-direction=right]:border-y data-[swipe-direction=right]:border-l
        data-[swipe-direction=right]:translate-x-(--drawer-swipe-movement-x) data-[swipe-direction=right]:data-starting-style:translate-x-full data-[swipe-direction=right]:data-ending-style:translate-x-full`.replace(
        /\s+/g,
        " ",
    ),
    // the bar a mouse swipes from (the Content selects text)
    handle: "mx-auto h-1.5 w-12 shrink-0 rounded-full bg-palette-line",
    content: "flex flex-col gap-(--pr-gap) min-h-0",
};
