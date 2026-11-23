import { toggle } from "examples-shared/recipes/toggle";
import { toggleGroup } from "examples-shared/recipes/toggle-group";
import { toolbar } from "examples-shared/recipes/toolbar";

// The example's classes: the Toolbar recipe (one string per part), the ToggleGroups and Toggles
// inside it, and the paragraph the formatting applies to (`data-bold`, `data-italic`,
// `data-underline`, `data-align`).
export const styles = {
    ...toolbar,
    toggleGroup: toggleGroup.root,
    toggle: toggle.root,
    stack: "flex w-full flex-col items-start gap-3 font-primitives text-(length:--pr-size) text-palette-contrast",
    preview:
        "w-full rounded-control border border-palette-line p-3 text-start data-bold:font-bold data-italic:italic data-underline:underline data-[align=center]:text-center data-[align=right]:text-right",
};
