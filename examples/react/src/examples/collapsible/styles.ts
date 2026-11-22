import { collapsible } from "examples-shared/recipes/collapsible";
import { FOCUS_RING } from "examples-shared/recipes/shared";

// The example's classes: the Collapsible recipe, the sidebar and its links.
export const styles = {
    ...collapsible,
    sidebar:
        "flex w-60 flex-col gap-3 font-primitives text-(length:--pr-size) text-palette-contrast",
    root: `${collapsible.root} w-full`,
    trigger: `${collapsible.trigger} w-full justify-between`,
    list: "flex flex-col gap-1 ps-3",
    link: `rounded-control underline-offset-4 hover:underline ${FOCUS_RING}`,
};
