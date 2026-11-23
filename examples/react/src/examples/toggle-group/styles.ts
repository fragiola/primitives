import { toggle } from "examples-shared/recipes/toggle";
import { toggleGroup } from "examples-shared/recipes/toggle-group";

// The example's classes: the ToggleGroup recipe, its toggles' (the Toggle recipe), and the
// paragraph the alignment applies to (`data-align`).
export const styles = {
    ...toggleGroup,
    toggle: toggle.root,
    stack: "flex w-full max-w-md flex-col items-start gap-3 font-primitives text-(length:--pr-size) text-palette-contrast",
    preview:
        "w-full rounded-control border border-palette-line p-3 text-start data-[align=center]:text-center data-[align=right]:text-right data-[align=justify]:text-justify",
};
